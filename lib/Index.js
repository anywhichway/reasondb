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

	function Index(cls,keyProperty="@key",db,clear) {
		Object.defineProperty(this,"metadata",{value: {
				className: cls.name,
				db: db,
				nextid: 0,
				keyProperty: keyProperty,
				store: db.storage.createStore(cls.name,db,(clear ? clear : db.clear))
		}});
	}
	Index.prototype.uid = function() {
		return  this.metadata.className + "@" + (++this.metadata.nextid);
	}
	Index.prototype.delete = function(key) {
		let me = this;
		if(key && key.indexOf("@")>=1) {
			let parts = key.split("@");
			if(parts[0]===me.metadata.className) {
				delete me[key];
				return me.metadata.store.delete(key);
			}
		}
	}
	Index.prototype.flush = function(key) {
		let me = this,
			keys = (key ? [key] : Object.keys(me));
		keys.forEach((key) => {
			if(key.indexOf("@")>=1) {
				let parts = key.split("@");
				if(parts[0]===me.metadata.className) {
					me[key] = true;
				}
			}
		});
	}
	Index.prototype.get = function(key) {
		let me = this,
			result;
		if(key && key.indexOf("@")>=1) {
			let parts = key.split("@");
			if(parts[0]===me.metadata.className) {
				result = me[key];
				let type = typeof(result);
				if(type==="object") {
					return Promise.resolve(result);
				} else if(type==="boolean"){
					return me.metadata.store.get(key);
				}
			}
		}
		return Promise.resolve(result);
	}
	Index.prototype.instances = function(keys) {
		let me = this,
			promises = [];
		keys.forEach((key) => {
			promises.push(me.get(key))
		});
		return Promise.all(promises);
	}
	Index.prototype.put = function(object) {
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
	Index.prototype.load = function() {
		let me = this,
			store = me.metadata.store;
		if(store && store.initialized) {
			return store.initialized();
		}
		return Promise.resolve();
	}
	Index.prototype.save = function() {
		let me = this,
			store = me.metadata.store,
			promises = [];
		if(store) {
			Object.keys(me).forEach((property) => {
				let value = me[property];
				if(property.indexOf("@")>=1) {
					let parts = property.split("@");
					if(parts[0]===me.metadata.className) {
						value = true;
					}
				}
				promises.push(store.set(property,value));
			});
		}
		return Promise.all(promises);
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
	Index.prototype.match = function(pattern,classVars,matches,restrictToId) {
		function match(v1,v2,results,test) {
			let type = typeof(v2);
			if(v1 && typeof(v1)==="object")  {
				if(Object.keys(v1).every((key) => {
					if(key[0]==="$") {
						if(Index[key]) {
							results = match(v1[key],v2,results,key);
						}
						if(classVars && classVars[key]) { //{$e1: "name"}
							//results = join(me[key],)
						}
					}
					if(v2 && type==="object") {
						results = match(v1[key],v2[key],results,test);
					}
					return results;
				})) {
					return results;
				};
			} else if(test) {
				if(v2[v1] && v2[v1][typeof(v1)]) {
					if(test(v1,Index.$coerce(v2,type))) {
						let ids = Object.keys(v2[v1][typeof(v1)]);
						return (results ? intersection(results,ids) : ids);
					}
				} else {
					return test(Index.$coerce(v1,type),v2,results);
				}
			}
			if(v2[v1] && v2[v1][typeof(v1)]) {
				let ids = Object.keys(v2[v1][typeof(v1)]);
				return (results ? intersection(results,ids) : ids);
			}
			return v1===v2;
		}
		function join(leftNode,rightNode,results,test) {
			let ids = [],
				left = (restrictToId ? [restrictToId] : []),
				right = [];
			Object.keys(leftNode).forEach((leftValue) => {
				Object.keys(leftNode[leftValue]).forEach((leftType) => {
					left = left.concat(Object.keys(leftNode[leftValue][leftType]));
					if(test) {
						Object.keys(rightNode).forEach((rightValue) => {
							if(rightNode[rightValue][leftType]) {
								if(test(Index.$coerce(leftValue,leftType),Index.$coerce(rightValue,leftType))) {
									right = right.concat(Object.keys(rightNode[rightValue][leftType]));
								}
							}
						});
					} else if(rightNode[leftValue][leftType]) {
						right = right.concat(Object.keys(rightNode[leftValue][leftType]));
					}
					ids = ids.concat(intersection(left,right));
				});
			});
			return (results ? intersection(results,ids) : intersection(ids,ids));
		}
		let me = this,
			results;
		if(Object.keys(pattern).every((property) => {
			if(me[property]) {
				let value = pattern[property],
					type = typeof(value),
					testname,
					test;
				if(value && type==="object") {
					testname = Object.keys(value)[0];
					if(testname[0]==="$") {
						if(Index[testname]) {
							test = Index[testname];
							value = value[testname];
							type = typeof(value);
						} else if(classVars && classVars[testname] && classVars[testname].index && classVars[testname].index[value[testname]]) { // e.g. {$e1: {name: {$e2: "name"}}}
							results = join(me[property],classVars[testname].index[value[testname]],matches[testname]);
							return results && results.length > 0;
						}
					}
				}
				if(value && type==="object") {
					let keys = Object.keys(value);
					if(keys[0][0]==="$" && classVars && classVars[keys[0]]) { // e.g. {$e1: {name: {$eq: {$e2: "name"}}}}
						if(classVars[keys[0]].index[value[keys[0]]]) {
							results = join(me[property],classVars[keys[0]].index[value[keys[0]]],matches[keys[0]],test);
							return results && results.length > 0;
						}
					}
					if(!test) {
						return Object.keys(me[property]).every((key) => {
							let tmp = [],
								cache = Index.prototype.match.cache,
								i = key.indexOf("@");
							if(i>=1) {
								if(i===key.length-1) {
								//	Object.keys(me[property][key]).forEach((testValue) => {
										let subtmp = match(value,me[property][key],results);
										if(subtmp) {
											if(Array.isArray(subtmp)) {
												tmp = tmp.concat(subtmp);
											} else {
												
											}
										}
									//});
								} else {
									let instanceId = key;
									if(restrictToId && instanceId!==restrictToId) { return true; }
									Object.keys(me[property][instanceId]).forEach((className) => {
										if(instanceId.indexOf(className)!==0) { return; }
										let cls = cache[className];
										if(!cls) {
											cache[className] = cls = me.metadata.db[className.substring(0,className.length-1)];
										}
										if(!cls) {
											cache[className] = cls = new Function("return " + className.substring(0,className.length-1))();
										}
										if(cls) {
											let instance = cls.index[instanceId];
											if(match(value,instance,results)) {
												tmp = tmp.concat(Object.keys(me[property][instanceId][className]));
											}
										}
									});
								}
							}
							results = (results ? intersection(results,tmp) : tmp);
							return results && results.length > 0;
						});
					}
				}
				if(test) { // e.g. {$e1: {name: {$eq: "Mary"}}}
					let ids  = [];
					type = (Array.isArray(value) ? typeof(value[0]) : type);
					if(testname==="$") {
						// should we fail if type is not function?
						Object.keys(me[property]).forEach((testValue) => {
							Object.keys(me[property][testValue]).forEach((type) => {
								if(restrictToId) {
									if(me[property][testValue][type][restrictToId] && test(Index.$coerce(testValue,type),value)) {
										ids.push(restrictToId);
									}
								} else if(test(Index.$coerce(testValue,type),value)) {
									ids = ids.concat(Object.keys(me[property][testValue][type]));
								}
							});
						});
					} else {
						Object.keys(me[property]).forEach((testValue) => {
							if(restrictToId) {
								if(me[property][testValue][type] && me[property][testValue][type][restrictToId] && test(Index.$coerce(testValue,type),value)) {
									ids.push(restrictToId);
								}
							} else if(me[property][testValue][type] && test(Index.$coerce(testValue,type),value)) {
								ids = ids.concat(Object.keys(me[property][testValue][type]));
							}
						});
					}
					results = (results ? intersection(results,ids) : ids);
					return results && results.length > 0;
				} else if(me[property][value] && me[property][value][type]){ // e.g. {$e1: {name: "Mary"}}
					let ids = Object.keys(me[property][value][type]);
					results = (results ? intersection(results,ids) : ids);
					return results && results.length > 0;
				}
			}
		})) {
			return results;
		}
		return [];
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

	if(typeof(module)!=="undefined") {
		module.exports = Index;
	}
	if(typeof(window)!=="undefined") {
		window.Index = Index;
	}
})();
