(function() {
	"use strict";
	let intersection = require("./intersection"),
		soundex = require("./soundex"),
		CXProduct = require("./CXProductLite"),
		Cursor = require("./Cursor");

	function IndexValue(value,id,node,keyProperty,db) {
		let type = typeof(value),
			indextype = Index.typeOf(value);
		
		if(type==="object" && indextype!=="object") {
			let keys = Index.keys(value);
			indextype = indextype += "@";
			keys.forEach((property) => {
				if(!node[indextype]) { node[indextype]={}; }
				if(!node[indextype][property]) { node[indextype][property]={}; }
				IndexValue(value[property],id,node[indextype][property],keyProperty,db);
			});
		} else if(type!=="undefined") {
			if(value && indextype==="object") {
				if(!value.constructor.index) { value.constructor.index = new Index(value.constructor,keyProperty,db); }
				value.constructor.index.put(value);
				indextype = value.constructor.name + "@";
				value = value[keyProperty];
			} 
			if(!node[value]) { node[value]={}; }
			if(!node[value][indextype]) { node[value][indextype]={}; }
			node[value][indextype][id] = true;
		}
		
	}

	function UnIndexValue(value,id,node,keyProperty,db) {
		let type = typeof(value),
			indextype = Index.typeOf(value);
		if(type!=="undefined") {
			if(type==="object" && indextype!=="object") {
				if(!node[indextype]) { return; }
				let keys = Index.keys(value);
				keys.forEach((property) => {
					if(!node[indextype][property]) { return; }
					UnIndexValue(value[property],id,node[indextype][property],keyProperty,db);
				});
			} else {
				if(value && indextype==="object") {
					if(!value.constructor.index) { return; }
					indextype = value.constructor.name + "@";
					value = value[keyProperty];
				} 
				if(!node[value]) { return; }
				if(!node[value][indextype]) {return; }
				delete node[value][indextype][id];
			}
		}
		
	}
	
	class Index {
		constructor(cls,db,keyProperty="@key",shared,clear) {
			Object.defineProperty(this,"__metadata__",{value: {
				cls: cls,
				className: cls.name,
				locations: {},
				scope: {},
				shared: shared,
				instances: {},
				db: db,
				nextid: 0,
				keyProperty: keyProperty,
				store: db.storage.createStore(cls.name,db,(typeof(shared)==="boolean" ? shared : db.shared),(typeof(clear)==="boolean" ? clear : db.clear))
			}});
			cls.index = this;
		}
		activate(cls,property,value,path=[],id) {
			let index = this,
				type = (value===null ? "undefined" : typeof(value)),
				keyProperty = index.__metadata__.keyProperty;
			if(!cls.index[property]) { cls.index[property] = {}; }
			if(type==="object") {
				let pcls = value.constructor;
				if(!pcls.index) { pcls.index = (index.__metadata__.shared ? index : new Index(pcls,index.db,false)); }
				if(!value[keyProperty]) { value[keyProperty] = pcls.name + "@" + (++pcls.index.__metadata__.nextid); };
				if(!cls.index[property][value[keyProperty]]) { cls.index[property][value[keyProperty]] = {}; }
				if(!cls.index[property][value[keyProperty]].object) { cls.index[property][value[keyProperty]].object = {}; }
				cls.index[property][value[keyProperty]].object[id] = true;
			} else if(value!==undefined) {
				if(!cls.index[property][value]) { cls.index[property][value] = {}; }
				if(!cls.index[property][value][type]) { cls.index[property][value][type] = {}; }
				cls.index[property][value][type][id] = true;
			}
		}
		coerce(value,type) {
			let conversions = {
					string: {
						number: parseFloat,
						boolean: (value) => { return (["true","yes","on"].indexOf(value)>=0 ? true : (["false","no","off"].indexOf(value)>=0 ? false : value)); }
					},
					number: {
						string: (value) => { return value+""; },
						boolean: (value) => { return !!value; }
					},
					boolean: {
						number: (value) => { return (value ? 1 : 0); },
						string: (value) => { return value+""; }
					}
				},
				vtype = typeof(value);
			if(type===vtype) {
				return value;
			}
			if(conversions[vtype] && conversions[vtype][type]) {
				return conversions[vtype][type](value);
			}
			return value;
		}
		delete(key) {
			let me = this;
			if(key && key.indexOf("@")>=1) {
				delete me[key];
				return me.__metadata__.store.delete(key);
			}
		}
		flush(key) {
			let me = this,
				keys = (key ? [key] : Object.keys(me));
			keys.forEach((key) => {
				if(key.indexOf("@")>=1) {
					me[key] = true;
				}
			});
		}
		async get(key) {
			let me = this,
				value = me[key],
				type = typeof(value);
			if(type==="undefined" || (type==="boolean" && key.indexOf("@")>=1)){
				//return new Promise((resolve,reject) => {
					let value = me.__metadata__.store.get(key);
					//.then((value) => {
						me[key] = (value ? value : {});
					//	resolve(value);
						return Promise.resolve(value);
					//});
				//});
			}
			return Promise.resolve(value);
		}
		instances(keyArray) {
			let index = this,
				promises = [];
			keyArray.forEach((key) => {
				promises.push(index.get(key));
			});
			return Promise.all(promises);
		}
		join(foreignClass,foreignPattern,varName) {
			// (Object,{name: "name"}})
			varName = (varName ? varName : "$" + this.__metadata__.cls.name);
			return foreignClass.index.match(foreignPattern,undefined,undefined,this,varName);
		}
		keys(object) {
			let keys = Object.keys(object);
			if(object.indexKeys) {
				let i = object.indexKeys.indexOf("*");
				if(i>=0) {
					let result = object.indexKeys.concat(keys);
					result.splice(i,1);
					return result;
				}
				return object.indexKeys.slice();
			}
			if(object.constructor.indexKeys) {
				let i = object.constructor.indexKeys.indexOf("*");
				if(i>=0) {
					let result = object.constructor.indexKeys.concat(keys);
					result.splice(i,1);
					return result;
				}
				return object.constructor.indexKeys.slice();
			}
			return keys;
		}
		match(pattern,restrictToIds,classVars={},parentKey,joinIndex,joinVar) {
			let index = this,
				cls = pattern.$class,
				clstype = typeof(cls),
				clsprefix;
			if(clstype==="string") {
				cls = index.__metadata__.scope[cls];
				if(!cls) {
					try {
						cls = new Function("return " + cls)();
					} catch(e) {
						return Promise.resolve([]);
					}
				}
				index = cls.index;
			} else if(clstype==="function") {
				index = cls.index;
			}
			if(!index) {
				return Promise.resolve([]);
			}
			if(cls) {
				clsprefix = (cls ? cls.name + "@" : undefined);
			}
			let keys = Object.keys(pattern);
			// process literals first
			if(keys.length===0) {
				return Promise.resolve([]);
			}
			if(keys.length===1 && cls) {
				return Promise.resolve(Object.keys(index.__metadata__.instances[cls.name]));
			}
			return new Promise((finalresolve,finareject) => {
				// do literal matches, they are fastest
				let predicatekeys = [],
					//joinkeys = [],
					objectkeys = [],
					promises = [],
					joinvars = {},
					results;
				keys.forEach((key) => {
					if(key==="$class") { return; }
					if(classVars[key]) { 
						joinvars[key] = {index: classVars[key].index, property:parentKey};
						//joinkeys.push(key);
						return;
					}
					promises.push(new Promise((resolve,reject) => {
						let value = pattern[key],
						type = (value===null ? "undefined" : typeof(value));
						if(type==="object") {
							predicatekeys.push(key);
							resolve(true); // ignore objects
						} else {
							let node = index.get(key);
							if(!node) {
								resolve(false);
							} else {
								index.get(key).then(() => { // use Promise to load index node for property, predicate and object tests then won't need to use Promise
									if(!index[key] || !index[key][value] || !index[key][value][type]) { 
										resolve(false);
									}  else {
										let filtered = (clsprefix ? Object.keys(index[key][value][type]).filter((id) => { return id.indexOf(clsprefix)===0; }) :  Object.keys(index[key][value][type])),
											ids = (restrictToIds ? intersection(filtered,restrictToIds) : filtered);
										results = (results ? intersection(results,ids) : ids);
										if(results.length===0) {
											resolve(false);
										} else {
											resolve(true);
										}
									}
								});
							}
						}
					}));
				});
				Promise.all(promises).then((resolutions) => {
					if(resolutions.indexOf(false)>=0) {
						finalresolve([]);
					} else {
						// do predicates, they are next fastest, don't need promises
						if(!predicatekeys.every((key) => {
							let predicate = pattern[key];
							if(predicate && typeof(predicate)==="object") {
								let testname = Object.keys(predicate)[0],
									test = Index[testname];
								if(!index[key]) {
									return false;
								}
							/*	if(testname===joinVar) {
									joinkeys.push(key);
									return true;
								}*/
								if(testname.indexOf("$")===-1 || typeof(test)!=="function") {
									objectkeys.push(key);
									return true; 
								}
								let v2 = predicate[testname],
									v2type = (v2===null ? "undefined" : typeof(v2)),
									ids = [];
								Object.keys(index[key]).forEach((v1str) => {
									Object.keys(index[key][v1str]).forEach((v1type) => {
										if(test(index.coerce(v1str,v1type),v2)) {
											ids = ids.concat(Object.keys(index[key][v1str][v1type]));
										}
									});
								});
								results = (results ? intersection(results,ids) : ids);
								return results.length>0;
							}
							return true;
						})) {
							finalresolve([]);
						} else {
							// do nested objects
							promises = [];
							objectkeys.forEach((key) => {
								promises.push(new Promise((resolve,reject) => {
									let value = pattern[key],
									type = (value===null ? "undefined" : typeof(value));
								if(!index[key]) {
									resolve(false);
								}
								if(type==="object") {
									let ids = [];
									index.match(value,Object.keys(index[key]),classVars,key).then((childids) => {
										childids.forEach((id) => {
											if(clsprefix && id.indexOf(clsprefix)!==0) { return; } // tests for $class
											if(index[key][id] && index[key][id].object) {
												ids = ids.concat(Object.keys(index[key][id].object));
											} else if(index[id]) {
												ids.push(index[id]);
											}
										});
										results = (results ? intersection(results,ids) : ids);
										if(results.length===0) {
											resolve(false);
										} else {
											resolve(true);
										}
									});
								} else {
									resolve(true); // ignore non-objects
								}
								}));
							});
							Promise.all(promises).then((resolutions) => {
								if(resolutions.indexOf(false)>=0) {
									finalresolve([]);
								} else {
									// do joins
									let joined;
									Object.keys(joinvars).every((joinvar) => { // need to turn into promises
										let join = pattern[joinvar],
											jointype = typeof(join),
											joinindex = joinvars[joinvar].index,
											property = joinvars[joinvar].property,
											jointest,
											joinproperty;
										if(jointype==="string") {
											joinproperty = join;
										} else {
											jointest = Object.keys(join)[0];
											joinproperty = join[jointest];
										}
										if(!joinindex) {
											return false;
										}
										if(!joinindex[joinproperty]) {
											joined = [];
											return false;
										} else {
											let ids = []; // this is inverted should have test outside join var
											Object.keys(index[property]).forEach((value) => {
												if(Index[jointest]) {
													Object.keys(index[property][value]).forEach((type) => {
														Object.keys(joinindex).forEach((testValue) => {
															Object.keys(joinindex[testValue]).forEach((testType) => {
																if(Index[jointest](Index.coerce(value,type),Index.coerce(testValue,testType))) { 
																	ids = ids.concat(Object.keys(index[property][value][type]));
																}
															});
														});
														
													});
												} else {
													if(joinindex[joinproperty][value]) {
														Object.keys(index[property][value]).forEach((type) => {
															if(joinindex[joinproperty][value][type]) { 
																ids = ids.concat(Object.keys(index[property][value][type]));
															}
														});
													}
												}
											});
											joined = (joined ? intersection(joined,ids) : intersection(ids,ids));
											return true;
										}
									});
									if(joined) {
										finalresolve(joined);
									} else {
										finalresolve(results ? results : []);
									}
								}
							});
						}
					}
				});
			});
		}
		reindexCalls(object) {
			if(object.reindexCalls) {
				return object.reindexCalls;
			}
			if(object.constructor.reindexCalls) {
				return object.constructor.reindexCalls;
			}
			return [];
		}
		put(value,path=[]) {
			let index = this,
				type = typeof(value),
				keyProperty = index.__metadata__.keyProperty,
				store = index.__metadata__.store;
			if(!type || type!=="object") {
				return Promise.reject(new Error("Can't index primitive value " + value));
			}
			let cls = value.constructor;
			if(!cls.index) { cls.index = (index.__metadata__.shared ? index : new Index(cls,index.db,false)); }
			if(!value[keyProperty]) { value[keyProperty] = cls.name + "@" + (++cls.index.__metadata__.nextid); };
			cls.index.__metadata__.scope[cls.name] = cls;
			if(!cls.index.__metadata__.instances[cls.name]) { cls.index.__metadata__.instances[cls.name] = {}; }
			cls.index.__metadata__.instances[cls.name][value[keyProperty]] = value;	
			if(path.length>0) {
				if(!cls.index.__metadata__.locations[value[keyProperty]]) { cls.index.__metadata__.locations[value[keyProperty]] = {}; }
				cls.index.__metadata__.locations[value[keyProperty]][path[path.length-1]] = true;
			}
			return new Promise((resolve,reject) => {
				store.put(value).then(() => {
					index.set(value[keyProperty],value).then(() => {
						let promises = [];
						Index.keys(value).forEach((property) => {
							promises.push(new Promise((resolve,reject) => { 
								let pvalue = value[property],
									ptype = (pvalue===null ? "undefined" : typeof(pvalue));
								cls.index.get(property).then(() => {
									index.activate(cls,property,pvalue,path,value[keyProperty]);
									let tmp = store.set(property,cls.index[property]);
									tmp.then(() => {
										if(ptype==="object") {
											let parents = path.slice();
											parents.push(value[keyProperty]);
											index.put(pvalue,parents).then(() => {
												resolve();
											}).catch((e) => {
												console.log(e);
											});;
										} else {
											resolve();
										}
									}).catch((e) => {
										console.log(e);
									});
								}).catch((e) => {
									console.log(e);
								});
							}).catch((e) => {
								console.log(e);
							}));
						});
						Promise.all(promises).then(() => {
							resolve();
						}).catch((e) => {
							console.log(e);
						});;
					});
				});
			});
		}
		save() {
			let me = this,
				store = me.__metadata__.store,
				promises = [];
			if(store) {
				Object.keys(me).forEach((property) => {
					promises.push(store.set(property,me[property]));
				});
			}
			return Promise.all(promises);
		}
		set(key,value) {
			let me = this,
				oldvalue = me[key],
				type = typeof(value);
			if(type==="undefined" || (type==="boolean" && key.indexOf("@")>=1) || oldvalue!==value){
				return new Promise((resolve,reject) => {
					me.__metadata__.store.set(key,value).then(() => {
						me[key] = value;
						resolve();
					});
				});
			}
			return Promise.resolve();
		}
	}
	Index.$ = (value,f) => {
		return f(value);
	}
	Index.$coerce = function(value,type) {
		let t = typeof(value),
			ctable = {
				string: {
					number: parseFloat
				},
				number: {
					string: (value) => { return value+""; }
				}
			};
		if(t===type) {
			return value;
		}
		if(ctable[t] && ctable[t][type]) {
			return ctable[t][type](value);
		}
		return value;
	}
	Index.$typeof = function() {
		return true; // test is done in method find
	}
	Index.$lt = function(value,testValue) {
		return value < testValue;
	}
	Index["<"] = Index.$lt;
	Index.$lte = function(value,testValue) {
		return value <= testValue;
	}
	Index["<="] = Index.$lte;
	Index.$eq = function(value,testValue) {
		return value == testValue;
	}
	Index["=="] = Index.$eq;
	Index.$neq = function(value,testValue) {
		return value != testValue;
	}
	Index["!="] = Index.$neq;
	Index.$eeq = function(value,testValue) {
		return value === testValue;
	}
	Index["==="] = Index.$eeq;
	Index.$echoes = function(value,testValue) {
		return value==testValue || soundex(value)===soundex(testValue);
	}
	Index.$matches = function(value,testValue) {
		return value.search(testValue)>=0;
	}
	Index.$in = function(value,testValue) {
		if(testValue.indexOf) {
			return testValue.indexOf(value)>=0;
		}
		if(testValue.includes) {
			return testValue.includes(value);
		}
		return false;
	}
	Index.$nin = function(value,testValue) {
		return !Index.$in(value,testValue);
	}
	Index.$between = function(value,testValue) {
		var end1 = testValue[0],
			end2 = testValue[1],
			inclusive = testValue[2],
			start = Math.min(end1,end2),
			stop = Math.max(end1,end2);
		if(inclusive) {
			return value>=start && value<=stop;
		}
		return value>start && value<stop;
	}
	Index.$outside = function(value,testValue) {
		return !Index.$between(value,testValue.concat(true));
	}
	Index.$gte = function(value,testValue) {
		return value >= testValue;
	}
	Index[">="] = Index.$gte;
	Index.$gt = function(value,testValue) {
		return value > testValue;
	}
	Index[">"] = Index.$gt;

	
	Index.prototype.oldput = function(object) {
		let index = this,
			keyProperty = index.metadata.keyProperty,
			db = index.metadata.db,
			store = index.metadata.store;
		if(!object || typeof(object)!=="object") {
			return;
		}
		if(object[keyProperty]==null) { object[keyProperty] = this.uid(); }
		store.put(object);
		index[object[keyProperty]] = object;
		let keys = Index.keys(object);
		keys.forEach((property) => {
			function get() {
				if(get.get) {
					return get.get.call(this);
				}
				return get.value;
			}
			function set(value) {
				let me = this,
					type = Index.typeOf(value),
					oldvalue = (get.get ? get.get.call(this) : get.value);
					if(set.set) {
						set.set.call(this,value);
					} else {
						get.value = value;
					}
				if(oldvalue!==value) {
					if(!index[property]) { index[property] = {}; }
					UnIndexValue(oldvalue,me[keyProperty],index[property],keyProperty,db);
					IndexValue(value,me[keyProperty],index[property],keyProperty,db);
					if(db) {
						index.patternMatch(me,property);
					}
				}
			}
			let value = object[property],
			desc = Object.getOwnPropertyDescriptor(object,property);
			if(!desc) {
				desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(object),property);
			}
			if(desc && desc.configurable && desc.writable) {
				if(!desc.set+""!==set+"") {
					if(desc.get) {
						get.get = desc.get;
					}
					desc.get = get;
					if(desc.set) {
						set.set = desc.set;
					}
					desc.set = set;
					delete desc.writable;
					delete desc.value;
					Object.defineProperty(object,property,desc);
				}
				object[property] = value;
			} else {
				if(!index[property]) {
					index[property] = {};
				}
				IndexValue(value,object[keyProperty],index[property],keyProperty,db);
				if(db) {
					index.patternMatch(object,property);
				}
			}
			store.set(property,index[property]);
		});
		Index.reindexCalls(object).forEach((key) => {
			let desc = Object.getOwnPropertyDescriptor(object,key);
			if(!desc) {
				desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(object),key);
			}
			if(desc && desc.configurable) {
				desc.value = new Proxy(desc.value,{
					apply: (target,thisArg,argumentsList) => {
						keys.forEach((property) => {
							if(!index[property]) { index[property] = {}; }
							UnIndexValue(thisArg[property],thisArg[keyProperty],index[property],keyProperty,db);
						});
						target.call(thisArg,...argumentsList);
						keys.forEach((property) => {
							IndexValue(thisArg[property],thisArg[keyProperty],index[property],keyProperty,db);
						});
					}
				})
				Object.defineProperty(object,key,desc);
			}
		});
		//index.save();
	}
	Index.prototype.patternMatch = function(object,property) {
		let index = this,
			db = index.metadata.db,
			cls = object.constructor,
			keyProperty = index.metadata.keyProperty;
		if(db.patterns[cls.name] && db.patterns[cls.name][property]) {
			Object.keys(db.patterns[cls.name][property]).forEach((patternId) => {
				Object.keys(db.patterns[cls.name][property][patternId]).forEach((classVar) => {
					let pattern = db.patterns[cls.name][property][patternId][classVar];
					db.select(pattern.projection).from(pattern.classVars).where(pattern.when,classVar,object[keyProperty]).then((cursor,matches) => { 
						if(cursor.count>0) {
							pattern.then(cursor,matches);
						}
					});
				});
			});
		}
	}
	
	Index.prototype.match.cache = {};
	Index.keys = function(object) {
		let keys = Object.keys(object);
		if(object.indexKeys) {
			let i = object.indexKeys.indexOf("*");
			if(i>=0) {
				let result = object.indexKeys.concat(keys);
				result.splice(i,1);
				return result;
			}
			return object.indexKeys.slice();
		}
		if(object.constructor.indexKeys) {
			let i = object.constructor.indexKeys.indexOf("*");
			if(i>=0) {
				let result = object.constructor.indexKeys.concat(keys);
				result.splice(i,1);
				return result;
			}
			return object.constructor.indexKeys.slice();
		}
		return keys;
	}
	Index.reindexCalls = function(object) {
		if(object.reindexCalls) {
			return object.reindexCalls;
		}
		if(object.constructor.reindexCalls) {
			return object.constructor.reindexCalls;
		}
		return [];
	}
	Index.typeOf = function(value) {
		let type = typeof(value);
		if(value && type==="object") {
			if(value.indexType) {
				return value.indexType;
			}
			if(value.constructor.indexType) {
				return value.constructor.indexType;
			}
		}
		return type;
	}
	

	if(typeof(module)!=="undefined") {
		module.exports = Index;
	}
	if(typeof(window)!=="undefined") {
		window.Index = Index;
	}
})();
