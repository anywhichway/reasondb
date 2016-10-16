(function() {
	let uuid = require("node-uuid");

	Array.indexKeys = ["length","$max","$min","$avg","*"];
	Array.reindexCalls = ["push","pop","splice","reverse","fill","shift","unshift"];
	Object.defineProperty(Array.prototype,"$max",{enumerable:false,configurable:true,
		get:function() { let result; this.forEach((value) => { result = (result!=null ? (value > result ? value : result) : value); }); return result;},
		set:function() { }
	});
	Object.defineProperty(Array.prototype,"$min",{enumerable:false,configurable:true,
		get:function() { let result; this.forEach((value) => { result = (result!=null ? (value < result ? value : result) : value); }); return result;},
		set:function() { }
	});
	Object.defineProperty(Array.prototype,"$avg",{enumerable:false,configurable:true,
		get:function() { 
			let result = 0, count = 0; 
			this.forEach((value) => {
				let v = value.valueOf();
				if(typeof(v)==="number") {
					count++;
					result += v;
				}
			});
			return result / count;
			},
		set:function() { }
	});
	
	Date.indexKeys = [];
	Date.reindexCalls = [];
	Object.getOwnPropertyNames(Date.prototype).forEach((key) => {
		if(key.indexOf("get")===0) {
			let name = (key.indexOf("UTC")>=0 ? key.slice(3) : key.charAt(3).toLowerCase() + key.slice(4)),
				setkey = "set" + key.slice(3),
				get = Function("return function() { return this." + key + "(); }")(),
				set = Function("return function(value) { " + (Date.prototype[setkey] ? "return this." + setkey + "(value); " : "") + "}")();
			Object.defineProperty(Date.prototype,name,{enumerable:false,configurable:true,get:get,set:set});
			Date.indexKeys.push(name);
			if(Date.prototype[setkey]) {
				Date.reindexCalls.push(setkey);
			}
		}
	});
	
	/*
	 * https://github.com/Benvie
	 * improvements 2015 by AnyWhichWay
	 */
	function intersection(h){var a=arguments.length;if(0===a)return[];if(1===a)return intersection(h,h);var e=0,k=0,l=0,m=[],d=[],n=new Map,b;do{var p=arguments[e],q=p.length,f=1<<e;b=0;if(!q)return[];k|=f;do{var g=p[b],c=n.get(g);"undefined"===typeof c?(l++,c=d.length,n.set(g,c),m[c]=g,d[c]=f):d[c]|=f}while(++b<q)}while(++e<a);a=[];b=0;do d[b]===k&&(a[a.length]=m[b]);while(++b<l);return a}
	
	//soundex from https://gist.github.com/shawndumas/1262659
	function soundex(s) {
		var a = (s+"").toLowerCase().split(""),
		f = a.shift(),
		r = "",
		codes = {
			a: "", e: "", i: "", o: "", u: "",
			b: 1, f: 1, p: 1, v: 1,
			c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
			d: 3, t: 3,
			l: 4,
			m: 5, n: 5,
			r: 6
		};
	
		r = f +
		a.map(function (v) { return codes[v]; }).filter(function (v, i, a) {
			return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
		}).join("");
	
		return (r + "000").slice(0, 4).toUpperCase();
	}
	
	function CXProduct(collections,filter) {
		this.collections = (collections ? collections : []);
		this.filter = filter;
		Object.defineProperty(this,"length",{set:function() {},get:function() { if(this.collections.length===0){ return 0; } if(this.start!==undefined && this.end!==undefined) { return this.end - this.start; }; var size = 1; this.collections.forEach(function(collection) { size *= collection.length; }); return size; }});
		Object.defineProperty(this,"size",{set:function() {},get:function() { return this.length; }});
	}
	// there is probably an alogorithm that never returns null is index is in range and takes into account the restrict right
	CXProduct.prototype.get = function(index){
		var me = this, c = [];
		function get(n,collections,dm,c) {
			for (var i=collections.length;i--;) c[i]=collections[i][(n/dm[i][0]<<0)%dm[i][1]];
		}
		for (var dm=[],f=1,l,i=me.collections.length;i--;f*=l){ dm[i]=[f,l=me.collections[i].length];  }
		get(index,me.collections,dm,c);
		if(me.filter(c)) {
			return c.slice(0);
		}
	}
	class Cursor {
		constructor(classes,cxproduct,projection,classVarMap) {
			this.classes = classes;
			this.cxproduct = cxproduct;
			this.projection = projection;
			this.classVarMap = classVarMap;
			this.position = 0;
		}
		forEach(f) {
			let cursor = this,
				i = 0;
			function rows() {
				let row = cursor.get(i);
				if(row) {
					f(row,i,cursor);
				}
				i++;
				if(i<cursor.cxproduct.length) {
					rows();
				}
			}
			rows();
			return i;
		}
		every(f) {
			let cursor = this,
				i = 0,
				result = false;
			function rows() {
				let row = cursor.get(i);
				if(row) {
					if(f(row,i,cursor)) {
						if(i<cursor.cxproduct.length) {
							i++;
							rows();
							return;
						}
					}
				} else {
					if(i<cursor.cxproduct.length) {
						i++;
						rows();
						return;
					}
				}
				result = i===cursor.cxproduct.length;
			}
			rows();
			return result;
		}
		some(f) {
			let cursor = this,
			i = 0,
			result = false;
			function rows() {
				let row = cursor.get(i);
				if(row) {
					if(f(row,i,cursor)) {
						result = true;
						return;
					}
				}
				i++;
				if(i<cursor.cxproduct.length) {
					rows();
				} else {
					result = false;
					return;
				}
			}
			rows();
			return result;
		}
		get count() {
			let cursor = this,
				i = 0;
			cursor.forEach((row) => {
				i++;
			});
			return i;
		}
		get(rowNumber) {
			let me = this;
			if(rowNumber>=0 && rowNumber<me.cxproduct.length) {
			//	return new Promise((resolve,reject) => {
					let promises = [],
						row = me.cxproduct.get(rowNumber);
					if(row && me.projection) {
						let result = {};
						Object.keys(me.projection).forEach((property) => {
							let colspec = me.projection[property];
							if(colspec && typeof(colspec)==="object") {
								let classVar = Object.keys(colspec)[0],
									key = colspec[classVar],
									col = me.classVarMap[classVar];
								result[property] = row[col][key];
							}
						});
						return result;
					} else {
						return row;
					}
			//	});
			}
		}
	}
	class Index {
		constructor(cls,keyProperty="@key",db,StorageType=(db ? db.storageType : MemStore),clear=(db ? db.clear : false)) {
			let store = new StorageType(cls.name,keyProperty,db,clear);
			cls.index = this;
			this.__metadata__ = {
				store:store,
				name: cls.name
			};
		}
		static coerce(value,type) {
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
		static keys(object) {
			let indexkeys;
			if(object.indexKeys) {
				indexkeys = object.indexKeys;
			} else if(object.constructor.indexKeys) {
				indexkeys = object.constructor.indexKeys
			}
			if(indexkeys) {
				let i = indexkeys.indexOf("*");
				if(i>=0) {
					return indexkeys.slice(0,i).concat(Object.keys(object));
				}
				return indexkeys;
			}
			return Object.keys(object);
		}
		async delete(key) {
			let desc = Object.getOwnPropertyDescriptor(this,key);
			if(desc) {
				await this.__metadata__.store.delete(key);
				delete this[key];
			}
		}
		flush(key) {
			let desc = Object.getOwnPropertyDescriptor(this,key);
			if(desc) {
				desc[key] = false;
			}
		}
		async get(key) {
			let value = this[key];
			if(!value) {
				return this.__metadata__.store.get(key);
			}
			return Promise.resolve(value);
		}
		async instances(keyArray) {
			let index = this,
				promises = [];
			keyArray.forEach((key) => {
				promises.push(index.get(key));
			});
			return Promise.all(promises);
		}
		async load() {
			let me = this;
			if(!this.__metadata__.loaded) {
				let keys =  await this.__metadata__.store.get(key);
				if(keys) {
					Object.keys(keys).forEach((key) => {
						me[key] = keys[key];
					});
				}
				this.__metadata__.loaded = true;
			}
			return this.__metadata__.loaded;
		}
		async match(pattern,restrictToIds,classVars={},classMatches={},restrictRight={},classVar="$self",parentKey) {
			let index = this,
				cls = pattern.$class,
				clstype = typeof(cls),
				clsprefix,
				keys = Object.keys(pattern),
				promises = [],
				literals = {},
				tests = {},
				subobjects = {},
				joinvars = {},
				joins = {},
				cols = {},
				results = classMatches;
			if(clstype==="string") {
				cls = index.__indextadata__.scope[cls];
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
			if(cls) {
				clsprefix = (cls ? cls.name + "@" : undefined);
			}
			Object.keys(classVars).forEach((classVar,i) => {
				cols[classVar] = i;
				if(!results[classVar]) { results[classVar] = null; }
				if(!restrictRight[i]) { restrictRight[i] = {}; };
			});
			keys.forEach((key) => {
				let value = pattern[key],
					type = typeof(value);
				if(key==="$class") { 
					return; 
				}
				if(!classVars[key]) {
					promises.push(index.get(key));
				}
			});
			let nodes = await Promise.all(promises);
			return new Promise((resolve,reject) => { // db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
				nodes.every((node,i) => {
					let key = keys[i],
						value = pattern[key],
						type = typeof(value);
					if(!node) {
						results[classVar] = [];
						return false;
					}
					if(key==="$class") {
						return true;
					}
					if(type!=="object") {
						return literals[i] = true;
					}
					Object.keys(value).forEach((key) => {
						if(classVars[key]) {
							joins[i] = {rightVar:key, rightIndex:classVars[key].index, rightProperty:value[key], test:Index.$eeq};
							return;
						}
						if(key[0]==="$") {
							let testvalue = value[key],
								test = Index[key];
							if(typeof(test)==="function") {
								if(testvalue && typeof(testvalue)==="object") {
									let second = Object.keys(testvalue)[0];
									if(classVars[second]) {
										return joins[i] = {rightVar:second, rightIndex:classVars[second].index, rightProperty:testvalue[second], test:test};
									}
								}
								tests[i] = true;
								return;
							}
						}
						subobjects[i] = true;
						return;
					});
					return true;
				});
				//if(Object.keys(joins).length>0 && Object.keys(literals).length===0 && Object.keys(tests).length===0 && Object.keys(subobjects).length===0) {
				//	reject(new Error("Join patterns must include at least one literal, predicate, or sub-object condition: " + JSON.stringify(pattern)));
				//}
				if(results[classVar] && results[classVar].length===0) { resolve([]); return; }
				nodes.every((node,i) => {
					if(!literals[i]) { return true; }
					let key = keys[i],
						value = pattern[key],
						type = typeof(value);
					if(!node[value] || !node[value][type]) { 
						results[classVar] = []; 
						return false;
					}
					let ids = Object.keys(node[value][type]);
					results[classVar] = (results[classVar] ? intersection(results[classVar],ids) : ids);
					return results[classVar].length > 0;
				});
				if(results[classVar] && results[classVar].length===0) { resolve([]); return; }
				nodes.every((node,i) => {
					if(!tests[i]) { return true; }
					let key = keys[i],
						predicate = pattern[key],
						testnaindex = Object.keys(predicate)[0],
						value = predicate[testnaindex],
						test = Index[testnaindex],
						ids = [];
					Object.keys(node).forEach((testValue) => {
						Object.keys(node[testValue]).forEach((testType) => {
							if(test(Index.coerce(testValue,testType),value)) {
								ids = ids.concat(Object.keys(node[testValue][testType]));
							}
						});
					});
					results[classVar] = (results[classVar] ? intersection(results[classVar],ids) :  intersection(ids,ids));
					return results[classVar].length > 0;
				});
				if(results[classVar] && results[classVar].length===0) { resolve([]); return; }
				promises = [];
				let childnodes = [];
				nodes.every((node,i) => {
					if(!subobjects[i]) { return true; }
					let key = keys[i],
						subobject = pattern[key];
					childnodes.push(node);
					promises.push(index.match(subobject,Object.keys(node),classVars,classMatches,restrictRight,classVar + "$" + subobject.constructor.name,key));
				});
				Promise.all(promises).then((childidsets) => {
					childidsets.every((childids,i) => {
						let ids = [],
							node = childnodes[i];
						childids.forEach((id) => {
							if(clsprefix && id.indexOf(clsprefix)!==0) { return; } // tests for $class
							if(node[id] && node[id].object) {
								ids = (ids ? ids.concat(Object.keys(node[id].object)) : Object.keys(node[id].object));
							} else if(index[id]) {
								ids = (ids ? ids.push(index[id]) : [index[id]]); // not sure about this line
							}
						});
						results[classVar] = (results[classVar] ? intersection(results[classVar],ids) : intersection(ids,ids));
						return results[classVar].length > 0;
					});
					if(results[classVar] && results[classVar].length===0) { resolve([]); return;}
					promises = [];
					nodes.forEach((node,i) => { // db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
						if(!joins[i]) { return true; }
						promises.push(joins[i].rightIndex.get(joins[i].rightProperty));
					});
					Promise.all(promises).then((rightnodes) => { // variable not used, promises just ensure nodes loaded for matching
						if(!results[classVar]) {
							results[classVar] = Object.keys(index).filter((item) => { return item.indexOf("@")>0; });
						}
						nodes.every((node,i) => { // db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
							if(!joins[i]) { return true; }
							let join = joins[i]; // {rightVar: second, rightIndex:classVars[second].index, rightProperty:testvalue[second], test:test};
							if(!join.rightIndex[join.rightProperty]) {
								results[classVar] = [];
								return false;
							}
							if(!results[join.rightVar]) {
								results[join.rightVar] = Object.keys(join.rightIndex).filter((item) => { return item.indexOf("@")>0; });
							}
							let leftids;
							Object.keys(node).forEach((leftValue) => {
								let innerleftids;
								Object.keys(node[leftValue]).forEach((leftType) => {
									Object.keys(join.rightIndex[join.rightProperty]).forEach((rightValue) => {
										Object.keys(join.rightIndex[join.rightProperty][rightValue]).forEach((rightType) => {
											if(join.test(Index.coerce(leftValue,leftType),Index.coerce(rightValue,rightType))) { 
												let rightids = Object.keys(join.rightIndex[join.rightProperty][rightValue][rightType]);
												innerleftids = (innerleftids ? innerleftids : Object.keys(node[leftValue][leftType]));
												innerleftids.forEach((id,i) => {
													restrictRight[cols[join.rightVar]][id] = (restrictRight[cols[join.rightVar]][id] ? intersection(restrictRight[cols[join.rightVar]][id],rightids) : rightids);
												});
											}
										});
									});
								});
								let lids = (results[join.rightVar] ? intersection(results[join.rightVar],innerleftids) : innerleftids);
								if(lids.length>0) {
									leftids = (leftids ? leftids.concat(lids) : lids);
								}
							});
							results[classVar] = (results[classVar] && leftids ? intersection(results[classVar],leftids) : leftids);
							return results[classVar] && results[classVar].length > 0;
						});
						if(results[classVar] && results[classVar].length>0) { resolve(results[classVar]); return; }
						resolve([]);
					});
				});
			});
		}
		async put(object) {
				let index = this,
					keyProperty = index.__metadata__.store.keyProperty(),
					keys = Index.keys(object),
					id = object[keyProperty],
					promises = [];
				if(!id) {
					id = object[keyProperty] = object.constructor.name +  "@" + uuid.v4();
				}
				if(index[id]!==object) {
					index[id] = object;
					index.__metadata__.store.addScope(object);
					await index.__metadata__.store.set(id,object);
				}
				keys.forEach((key) => {
				//	if(key===keyProperty) {
				//		return;
				//	}
					let value = object[key],
						desc = Object.getOwnPropertyDescriptor(object,key);
					function get() {
						return get.value;
					}
					function set(value) {
						let instance = this,
							oldvalue = get.value,
							oldtype = typeof(oldvalue),
							type = typeof(value);
						if(oldtype==="undefined" || oldvalue!=value) {
							get.value = value;
							return new Promise((resolve,reject) => {
								index.get(key).then((node) => {
									if(!node) {
										if(index[key]) {
											node = index[key];
										} else {
											index[key] = node = {};
										}
									}
									index.__metadata__.store.set(instance[keyProperty],instance,true).then(() => {
										if(node[oldvalue] && node[oldvalue][oldtype]) {
											delete node[oldvalue][type][id];
										}
										let db = index.__metadata__.store.db(),
											cls = instance.constructor;
										if(type==="object") {
											if(!value) {
												if(!node.null) {
													node.null = {};
												}
											} else {
												if(!value[keyProperty]) {
													value[keyProperty] = value.constructor.name +  "@" + uuid.v4();
												}
												if(!node[value[keyProperty]]) {
													node[value[keyProperty]] = {};
												}
											}
											index.put(value).then(() => {
												let idvalue = value[keyProperty];
												if(!node[idvalue][type]) {
													node[idvalue][type] = {};
												}
												node[idvalue][type][id] = true; //instance;			
												index.save(key).then(() => {
													resolve(true);
													if(db.patterns[cls.name] && db.patterns[cls.name][key]) {
														Object.keys(db.patterns[cls.name][key]).forEach((patternId) => {
															Object.keys(db.patterns[cls.name][key][patternId]).forEach((classVar) => {
																let pattern = db.patterns[cls.name][key][patternId][classVar];
																db.select(pattern.projection).from(pattern.classVars).where(pattern.when).exec().then(pattern.then);
															});
														});
													}
												});
											});
										} else {
											if(!node[value]) {
												node[value] = {};
											}
											if(!node[value][type]) {
												node[value][type] = {};
											}
											node[value][type][id] = true; //instance;
											index.save(key).then(() => {
												resolve(true);
												if(db.patterns[cls.name] && db.patterns[cls.name][key]) {
													Object.keys(db.patterns[cls.name][key]).forEach((patternId) => {
														Object.keys(db.patterns[cls.name][key][patternId]).forEach((classVar) => {
															let pattern = db.patterns[cls.name][key][patternId][classVar];
															db.select(pattern.projection).from(pattern.classVars).where(pattern.when).exec().then(pattern.then);
														});
													});
												}
	
											});
										}
									});
								});
							});
						}
						return Promise.resolve(true);
					}
				let writable = desc && !!desc.configurable && !!desc.writable;
				if(desc && writable && !desc.get && !desc.set) {
					delete desc.writable;
					delete desc.value;
					desc.get = get;
					desc.set = set;
					Object.defineProperty(object,key,desc);
				}
				promises.push(set.call(object,value,writable));
			});
			return Promise.all(promises).catch((e) => { console.log(e); });
		}
		async save(key) {
			let node = this[key];
			if(node) {
				return await this.__metadata__.store.set(key,node);
			}
		}
	}
	Index.$ = (value,f) => {
		return f(value);
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
	
	
	class Store {
		constructor(name="Object",keyProperty="@key",db) {
			Object.defineProperty(this,"__metadata__",{value: {
				name: name,
				keyProperty: keyProperty,
				db: db,
				scope: {}
			}});
		}
		addScope(value) {
			let me = this;
			if(value && typeof(value)==="object") {
				me.__metadata__.scope[value.constructor.name] = value.constructor;
				Object.keys(value).forEach((property) => {
					me.addScope(value[property]);
				});
			}
		}
		db() { 
			return this.__metadata__.db;
		}
		keyProperty() {
			return this.__metadata__.keyProperty;
		}
		normalize(value,recursing) {
			let me = this,
				type = typeof(value),
				keyProperty = me.keyProperty(),
				result;
			if(value && type==="object") {
				let id = value[keyProperty]
				if(!id) {
					value[keyProperty] = id = value.constructor.name +  "@" + uuid.v4();
				}
				let json = (value.toJSON ? value.toJSON() : value);
				if(typeof(json)!=="object") {
					json = value;
				}
				me.addScope(value);
				result = {};
				if(recursing) {
					result[keyProperty] = id;
				} else {
					let keys = Object.keys(json);
					if(json instanceof Date) {
						result.time = json.getTime();
					}
					keys.forEach((key,i) => {
						result[key] = me.normalize(json[key],true);
					});
				}
			} else {
				result = value;
			}
			return result;
		}
		restore(json) {
			let me = this;
			if(json && typeof(json)==="object") {
				let key = json[me.keyProperty()];
				if(typeof(key)==="string") {
					let parts = key.split("@"),
						cls = me.__metadata__.scope[parts[0]];
					if(!cls) {
						try {
							me.__metadata__.scope[parts[0]] = cls = Function("return " + parts[0]);
						} catch(e) {
							Object.keys(json).forEach((property) => {
								json[property] = me.restore(json[property]);
							});
							return json;
						}
						me.__metadata__.scope[parts[0]] = cls;
					}
					if(json instanceof cls) {
						Object.keys(json).forEach((property) => {
							json[property] = me.restore(json[property]);
						});
						return json;
					}
					let instance = Object.create(cls.prototype);
					Object.keys(json).forEach((property) => {
						instance[property] = me.restore(json[property]);
					});
					return instance;
				}
			}
			return json;
		}
	}
	class MemStore extends Store {
		async clear() {
			let me = this;
			Object.keys(me).forEach((key) => {
				delete me[key];
			});
			return true;
		}
		async delete(key) {
			if(this[key]) {
				delete this[key];
				return true;
			}
			return false;
		}
		async get(key) {
			return this[key];
		}
		async set(key,value) {
			this[key] = value;
			return true;
		}
	}
	class LocalStore extends Store {
		constructor(name,keyProperty,db,clear) {
			super(name,keyProperty,db);
			if(typeof(window)!=="undefined") {
				this.__metadata__.storage = window.localStorage;
			} else {
				let r = require,
					LocalStorage = r("./LocalStorage.js").LocalStorage;
				this.__metadata__.storage = new LocalStorage("./db/" + name);
			}
			if(clear) {
				this.__metadata__.storage.clear();
			}
		}
		async clear() {
			let me = this;
				me.__metadata__.storage.clear();
			Object.keys(me).forEach((key) => {
				delete me[key];
			});
			return true;
		}
		async delete(key,force) {
			if(this[key] || force) {
				me.__metadata__.storage.removeItem(key+".json");
				delete this[key];
				return true;
			}
			return false;
		}
		async get(key) {
			let value = this.__metadata__.storage.getItem(key+".json");
			if(value!=null) {
				this[key] = true;
				return this.restore(JSON.parse(value));
			}
		}
		async set(key,value,normalize) {
			this[key] = true;
			this.__metadata__.storage.setItem(key+".json",JSON.stringify(normalize ? this.normalize(value) : value));
			return true;
		}
	}
	class LocalForageStore extends Store {
		constructor(name,keyProperty,db,clear) {
			super(name,keyProperty,db);
			if(typeof(window)!=="undefined") {
				window.localforage.config({name:name})
				this.__metadata__.storage = window.localforage;
			} else {
				let r = require,
				LocalStorage = r("node-localstorage").LocalStorage;
				this.__metadata__.storage = new LocalStorage("./db/" + name);
			}
			if(clear) {
				this.__metadata__.storage.clear();
			}
		}
		async clear() {
			await this.__metadata__.storage.clear();
			Object.keys(me).forEach((key) => {
				delete me[key];
			});
			return true;
		}
		async delete(key,force) {
			if(this[key] || force) {
				await me.__metadata__.storage.removeItem(key+".json");
				delete this[key];
				return true;
			}
			return false;
		}
		async get(key) {
			let value = await this.__metadata__.storage.getItem(key+".json");
			if(value!=null) {
				this[key] = true;
				return this.restore(value);
			}
		}
		async set(key,value,normalize) {
			this[key] = true;
			await this.__metadata__.storage.setItem(key+".json",normalize ? this.normalize(value) : value);
			return true;
		}
	}
	class ReasonDB {
		constructor(name,keyProperty="@key",storageType=MemStore,shared,clear) {
			let db = this;
			db.keyProperty = keyProperty;
			db.storageType = storageType;
			db.clear = true;
			db.shared = shared;
			
			delete Object.index;
			db.index(Object,keyProperty,storageType,clear);
			
			db.Pattern = class Pattern {
				constructor(projection,classVars,when,then) {
					let me = this;
					me.projection = projection;
					me.classNames = {};
					Object.defineProperty(me,"classVars",{configurable:true,writable:true,value:classVars});
					Object.keys(classVars).forEach((classVar) => {
						me.classNames[classVar] = me.classVars[classVar].name;
					});
					Object.defineProperty(me,"when",{configurable:true,writable:true,value:when});
					Object.defineProperty(me,"then",{configurable:true,writable:true,value:then});
					//Pattern.index.put(me);
				}
				/*toJSON() {
					let me = this,
						result = {};
					result[db.keyProperty] = me[db.keyProperty];
					result.projection = me.projection;
					result.classVars = me.classNames;
					result.when = me.when;
					result.then = me.then+"";
					return result;
				}*/
			}
			/*db.Pattern.fromJSON = function(object) {
				let result = Object.create(Pattern.prototype);
				result[db.keyProperty] = object[db.keyProperty];
				result.projection = object.projection;
				result.classVars = [];
				object.classVars.forEach((className) => {
					if(db[className]) {
						
					}
				});
				result.when = object.when;
				result.then = new Function(object.then);
				return result;
			}
			db.Pattern.index = (shared ? Object.index : new Index(db.Pattern,keyProperty,db,storageType,clear));*/
			if(shared) {
				Array.index = Object.index;
				db.Array = Array;
				Date.index = Object.index;
				db.Date = Date;
			} else {
				delete Array.index;
				delete Date.index;
				db.index(Array,keyProperty,storageType,clear);
				db.index(Date,keyProperty,storageType,clear);
			}
			db.patterns = {};
		}
		index(cls,keyProperty,storageType,clear) {
			let db = this;
			keyProperty = (keyProperty ? keyProperty : db.keyProperty);
			storageType = (storageType ? storageType : db.storageType);
			clear = (clear ? clear : db.clear);
			if(!cls.index) { 
				cls.index = new Index(cls,keyProperty,db,storageType,clear);
				db[cls.name] = cls;
			}
		}
		select(projection) {
			var db = this;
			return {
				from(classVars) {
					return {
						when(whenPattern) {
							return {
								then(f) {
									/*let pattern = new db.Pattern(projection,classVars,whenPattern);
									let next; // makes then chainable, but not serializable
									pattern.then = function then() { 
										if(next) {
											next(...arguments);
											next = next.then;
										} else {
											f(...arguments);
											next = f.then;
										}
										if(next) { 
											then(...arguments); 
										}
									}*/
									let pattern = new db.Pattern(projection,classVars,whenPattern,f);
									Object.keys(whenPattern).forEach((classVar) => {
										if(classVar[0]!=="$") { return; }
										let cls = classVars[classVar];
										if(!db.patterns[cls.name]) { db.patterns[cls.name] = {}; }
										Object.keys(whenPattern[classVar]).forEach((property) => {
											if(!db.patterns[cls.name][property]) { db.patterns[cls.name][property] = {}; }
											if(!db.patterns[cls.name][property][pattern[db.keyProperty]]) { db.patterns[cls.name][property][pattern[db.keyProperty]] = {}; }
											if(!db.patterns[cls.name][property][pattern[db.keyProperty]][classVar]) { db.patterns[cls.name][property][pattern[db.keyProperty]][classVar] = pattern; }
										});
									});
									return f;
								}
							}
						},
						where(pattern,restrictVar,instanceId) {
							return {
								orderBy(ordering) { // {$o: {name: "asc"}}
									let me = this;
									return {
										exec() {
											return me.exec(ordering);
										}
									}
								},
								exec() {
									let ordering = arguments[0];
									return new Promise((resolve,reject) => {
										let matches = {},
											restrictright = {},
											matchvars = [],
											promises = [],
											col = -1;
										Object.keys(pattern).forEach((classVar) => {
											let restrictions;
											if(!classVars[classVar] || !classVars[classVar].index) { 
												return;
											}
											matchvars.push(classVar);
											if(classVar===restrictVar) {
												restrictions = [instanceId];
											}
											col++;
											promises.push(classVars[classVar].index.match(pattern[classVar],restrictions,classVars,matches,restrictright,classVar));
										});
										Promise.all(promises).then((results) => {
											let pass = true;
											results.every((result,i) => {
											//	matches[matchvars[i]] = (matches[matchvars[i]] ? intersection(matches[matchvars[i]],result) : result);
												if(result.length===0) {
													pass = false;
												}
												return pass;
											});
											if(!pass) {
												resolve(new Cursor([],new CXProduct([]),projection,{}),matches);
											} else {
												let classes = [],
													collections = [],
													promises = [],
													vars = [],
													classVarMap = {};
												Object.keys(matches).forEach((classVar) => {
													vars.push(classVar);
													if(classVars[classVar] && matches[classVar]) {
														promises.push(classVars[classVar].index.instances(matches[classVar]));
													}
												});
												Promise.all(promises).then((results) => {
													results.forEach((result,i) => {
														let classVar = vars[i];
														// add order result based on ordering
														matches[classVar] = result;
														classes.push(classVars[classVar]);
														collections.push(matches[classVar]);
														classVarMap[classVar] = i;
													});
													function filter(row) {
														return row.every((item,i) => {
															if(i===0 || !restrictright[i]) {
																return true;
															}
															let prev = row[i-1][db.keyProperty];
															return !restrictright[i][prev] || restrictright[i][prev].indexOf(item[db.keyProperty])>=0;
														});
													}
													resolve(new Cursor(classes,new CXProduct(collections,filter),projection,classVarMap),matches);
												});
											}
										});
									});
								}
							}
						}
					}
				}
			}
		}
	}
	ReasonDB.LocalStore = LocalStore;
	ReasonDB.MemStore = MemStore;
	ReasonDB.LocalForageStore = LocalForageStore;
	if(typeof(module)!=="undefined") {
		module.exports = ReasonDB;
	}
	if(typeof(window)!=="undefined") {
		window.ReasonDB = ReasonDB;
	}
})();