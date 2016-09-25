(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
	"use strict";
	let Database = require("./lib/Database"),
		Date = require("./lib/Date"),
		Array = require("./lib/Array");

	if(typeof(module)!=="undefined") {
		module.exports = Database;
	}
	if(typeof(window)!=="undefined") {
		window.ReasonDB = Database;
	}
})();
},{"./lib/Array":2,"./lib/Database":5,"./lib/Date":6}],2:[function(require,module,exports){
(function() {
	"use strict";
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
})();
},{}],3:[function(require,module,exports){
(function() {
	"use strict";
	function CXProduct(collections){
		this.deleted = {};
		this.collections = (collections ? collections : []);
		Object.defineProperty(this,"length",{set:function() {},get:function() { if(this.collections.length===0){ return 0; } if(this.start!==undefined && this.end!==undefined) { return this.end - this.start; }; var size = 1; this.collections.forEach(function(collection) { size *= collection.length; }); return size; }});
		Object.defineProperty(this,"size",{set:function() {},get:function() { return this.length; }});
	}

	function get(n,collections,dm,c) {
		for (var i=collections.length;i--;)c[i]=collections[i][(n/dm[i][0]<<0)%dm[i][1]];
	}
	CXProduct.prototype.get = function(index){
		var me = this, c = [];
		for (var dm=[],f=1,l,i=me.collections.length;i--;f*=l){ dm[i]=[f,l=me.collections[i].length];  }
		get(index,me.collections,dm,c);
		return c.slice(0);
	}

	if(typeof(module)!=="undefined") {
		module.exports = CXProduct;
	}
	if(typeof(window)!=="undefined") {
		window.CXProduct = CXProduct;
	}
})();

},{}],4:[function(require,module,exports){
(function() {
	"use strict";
	class Cursor {
		constructor(classes,cxproduct,projection,classVarMap) {
			this.classes = classes;
			this.cxproduct = cxproduct;
			this.projection = projection;
			this.classVarMap = classVarMap;
			this.position = 0;
		}
		get count() {
			return this.cxproduct.length;
		}
		next() {
			let me = this;
			if(me.position<me.cxproduct.length) {
				return me.get(me.position++);
			}
		}
		move(postition) {
			let me = this;
			if(position>=0 && position<me.cxproduct.length) {
				me.position = position;
			}
		}
		get(row) {
			let me = this;
			if(row>=0 && row<me.cxproduct.length) {
				return new Promise((resolve,reject) => {
					let promises = [];
					row = me.cxproduct.get(row);
					row.forEach((key,col) => {
						promises.push(me.classes[col].index.get(key));
					});
					Promise.all(promises).then((results) => {
						if(me.projection) {
							let result = {};
							Object.keys(me.projection).forEach((property) => {
								let colspec = me.projection[property],
								classVar = Object.keys(colspec)[0],
								key = colspec[classVar],
								col = me.classVarMap[classVar];
								result[property] = results[col][key];
							});
							resolve(result);
						} else {
							resolve(results);
						}
					});
				});
			}
		}
	}

	if(typeof(module)!=="undefined") {
		module.exports = Cursor;
	}
	if(typeof(window)!=="undefined") {
		window.Cursor = Cursor;
	}
})();
},{}],5:[function(require,module,exports){
(function() {
	"use strict";
	let CXProduct = require("./CXProductLite"),
	Cursor = require("./Cursor"),
	Index = require("./Index"),
	iIndexedDB = (typeof(window)!=="undefined" ? require("./iIndexedDB") : undefined),
	iLocalStorageDB = require("./iLocalStorageDB"),
	iMemDB = require("./iMemDB");

	class Database {
		constructor(keyProperty="@key",Storage=iMemDB,name,clear) {
			let db = this;
			db.clear = true;
			db.keyProperty = keyProperty;
			db.storage = new Storage(name);
			db.Pattern = class Pattern {
				constructor(projection,classVars,when,then) {
					let me = this;
					me.projection = projection;
					me.classNames = {};
					Pattern.index.put(me);
					Object.defineProperty(me,"classVars",{configurable:true,writable:true,value:classVars});
					Object.keys(classVars).forEach((classVar) => {
						me.classNames[classVar] = me.classVars[classVar].name;
					});
					Object.defineProperty(me,"when",{configurable:true,writable:true,value:when});
					Object.defineProperty(me,"then",{configurable:true,writable:true,value:then});
				}
				toJSON() {
					let me = this,
						result = {};
					result[db.keyProperty] = me[db.keyProperty];
					result.projection = me.projection;
					result.classVars = me.classNames;
					result.when = me.when;
					result.then = me.then+"";
					return result;
				}
			}
			db.Pattern.index = new Index(db.Pattern,keyProperty,db);
			db.Entity = class Entity {
				constructor(config,index) {
					let me = this;
					if(config && typeof(config)==="object") {
						Object.keys(config).forEach((key) => {
							me[key] = config[key];	
						});
					}
					if(index) {
						Entity.index.put(me);
					}
					return me;
				}
			}
			db.Entity.index = new Index(db.Entity,keyProperty,db);
			db.index(Object);
			db.index(Array);
			db.index(Date);
			db.patterns = {};
		}
		index(cls,clear) {
			let db = this;
			if(!cls.index) { 
				cls.index = new Index(cls,db.keyProperty,db,clear);
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
									//let pattern = new db.Pattern(projection,classVars,whenPattern);
									/*let next; // makes then chainable, but not serializable
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
							/*return {
								then(f) {
									let matches = {};
									if(Object.keys(pattern).every((classVar) => {
										if(!classVars[classVar].index) { 
											return false;
										}
										if(classVar===restrictVar) {
											matches[classVar] = classVars[classVar].index.match(pattern[classVar],classVars,matches,instanceId);
										} else {
											matches[classVar] = classVars[classVar].index.match(pattern[classVar],classVars,matches);
										}
										return matches[classVar] && matches[classVar].length>0;
									})) {
										let classes = [],
										collections = [],
										classVarMap = {};
										Object.keys(matches).forEach((classVar,i) => {
											classes.push(classVars[classVar]);
											collections.push(matches[classVar]);
											classVarMap[classVar] = i;
										});
										f(new Cursor(classes,new CXProduct(collections),projection,classVarMap),matches);
									} else {
										f(new Cursor([],new CXProduct([]),projection,{}),matches);
									}
								}
							}*/
							return new Promise((resolve,reject) => {
								let loads = [];
								Object.keys(classVars).forEach((classVar) => {
									loads.push(classVars[classVar].index.load());
								});
								Promise.all(loads).then(() => {
									let matches = {};
									if(Object.keys(pattern).every((classVar) => {
										if(!classVars[classVar].index) { 
											return false;
										}
										if(classVar===restrictVar) {
											matches[classVar] = classVars[classVar].index.match(pattern[classVar],classVars,matches,instanceId);
										} else {
											matches[classVar] = classVars[classVar].index.match(pattern[classVar],classVars,matches);
										}
										return matches[classVar] && matches[classVar].length>0;
									})) {
										let classes = [],
										collections = [],
										classVarMap = {};
										Object.keys(matches).forEach((classVar,i) => {
											classes.push(classVars[classVar]);
											collections.push(matches[classVar]);
											classVarMap[classVar] = i;
										});
										resolve(new Cursor(classes,new CXProduct(collections),projection,classVarMap),matches);
									} else {
										resolve(new Cursor([],new CXProduct([]),projection,{}),matches);
									}
								});
							});
						}
					}
				}
			}
		}
	}
	Database.indexedDB = iIndexedDB;
	Database.localStorageDB = iLocalStorageDB;
	Database.memDB = iMemDB;
	if(typeof(module)!=="undefined") {
		module.exports = Database;
	}
	if(typeof(window)!=="undefined") {
		window.Database = Database;
	}
})();
},{"./CXProductLite":3,"./Cursor":4,"./Index":7,"./iIndexedDB":8,"./iLocalStorageDB":10,"./iMemDB":12}],6:[function(require,module,exports){
(function() {
	"use strict";
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
})();
},{}],7:[function(require,module,exports){
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

},{"./CXProductLite":3,"./Cursor":4,"./intersection":15,"./soundex":16}],8:[function(require,module,exports){
(function() {
	"use strict";
	let iIndexedDBStore = require("./iIndexedDBStore");
		
	class iIndexedDB {
		constructor(name) {
			this.name = name;
		}
		createStore(name,db) {
			return new iIndexedDBStore(name,db);
		}
		close() {
			me.db.close();
			me.db = null;
		}
		open() {
			let me = this;
			return new Promise((resolve,reject) => {
				if(me.db) {
					resolve();
					return;
				}
				let request = indexedDB.open(me.name,2);
				request.onerror = function(event) {
				  reject(event);
				};
				request.onupgradeneeded = function(event) {
					let db = event.target.result;
					try {
						db.deleteObjectStore("Values");
					} catch(e) {
						// ignore
					}
					db.createObjectStore("Values");
				};
				request.onsuccess = function(event) {
				  me.db = event.target.result;
				  resolve();
				};
			});
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iIndexedDB;
	}
	if(typeof(window)!=="undefined") {
		window.iIndexedDB = iIndexedDB;
	}
})();
},{"./iIndexedDBStore":9}],9:[function(require,module,exports){
(function() {
	"use strict";
	let iStore = require("./iStore");
	
	class iIndexedDBStore extends iStore {
		constructor(name,db) {
			super(name,db);
		}
		delete(key) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					delete data[key];
					if(key.indexOf("@")>=0) {
						let parts = key.split("@");
						if(parts[0]===me.name) {
							let transaction = me.db.storage.db.transaction(["Values"],"readwrite"),
								request = transaction.objectStore("Values").delete(key);
							transaction.onerror = function(event) {
								reject(event.srcElement.error);
							};
							request.onsuccess = function(event) {
								me.save().then(() => {
									resolve();
								});
							}
							return;
						}
					}
					me.save().then(() => {
						resolve();
					});
				});
			});
		}
		get(key) {
			let me = this,
				keyProperty = me.db.keyProperty;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					let result = data[key];
					if(key.indexOf("@")>=0 && data[keyProperty] && data[keyProperty][key]) {
						let parts = key.split("@");
						if(parts[0]===me.name) {
							let transaction = me.db.storage.db.transaction(["Values"]),
								request = transaction.objectStore("Values").get(key);
							transaction.onerror = function(event) {
								reject(event.srcElement.error);
							};
							request.onsuccess = function(event) {
								result = data[key] = me.restore(request.result);
								resolve(result);
							}
							return;
						}
					}
					resolve(result);
				});
			});
		}
		initialized() {
			let me = this;
			return new Promise((resolve,reject) => {
				me.db.storage.open().then(() => {
					me.load().then((data) => {
						if(!data) {
							me.data = {};
							me.save().then(() => {
								resolve(me.data);
							});
						} else {
							resolve(data);
						}
					});
				});
			});
		}
		load(force) {
			let me = this;
			return new Promise((resolve,reject) => {
				if(me.data && !force) {
					resolve(me.data);
					return;
				}
				let transaction = me.db.storage.db.transaction(["Values"]), // perhaps add transaction to storage??
					request = transaction.objectStore("Values").get(me.name);
				transaction.oncomplete = function(event) {
					resolve(me.data);
				};
				transaction.onerror = function(event) {
					reject(event.srcElement.error);
				};
				request.onsuccess = function(event) {
					me.data = me.restore(request.result);
				}
			});
		}
		put(object) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.db.storage.open().then(() => {
					let keyProperty = me.db.keyProperty,
						transaction = me.db.storage.db.transaction(["Values"], "readwrite");
					transaction.objectStore("Values").put(me.normalize(object),object[keyProperty]);
					transaction.oncomplete = function(event) {
						resolve();
					};
					transaction.onerror = function(event) {
						reject(event.srcElement.error);
					};
				});	
			});
		}
		save() {
			let me = this;
			return new Promise((resolve,reject) => {
				if(!me.data) {
					resolve();
					return;
				}
				let transaction = me.db.storage.db.transaction(["Values"], "readwrite"),
					request = transaction.objectStore("Values").put(me.normalize(me.data),me.name);
				transaction.oncomplete = function(event) {
					resolve();
				};
				transaction.onerror = function(event) {
					reject(event.srcElement.error);
				};
				request.onerror = function(event) {
					reject(event.srcElement.error);
				}
			});
		}
		set(key,value) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					me.addScope(value);
					data[key] = value;
					me.save().then(() => {
						resolve();
					});
				});
			});
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iIndexedDBStore;
	}
	if(typeof(window)!=="undefined") {
		window.iIndexedDBStore = iIndexedDBStore;
	}
})();
},{"./iStore":14}],10:[function(require,module,exports){
(function() {
	"use strict";
	let iLocalStorageDBStore = require("./iLocalStorageDBStore");
		
	class iLocalStorageDB {
		constructor(name) {
			this.name = name;
		}
		createStore(name,db,clear) {
			return new iLocalStorageDBStore(name,db,clear);
		}
		close() {
			
		}
		open() {
			return Promise.resolve();
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iLocalStorageDB;
	}
	if(typeof(window)!=="undefined") {
		window.iLocalStorageDB = iLocalStorageDB;
	}
})();
},{"./iLocalStorageDBStore":11}],11:[function(require,module,exports){
(function() {
	"use strict";
	let iStore = require("./iStore"),
		LocalStorage;
	
	if(typeof(window)!=="undefined") {
		LocalStorage = window.localStorage;
	} else {
		let r = require,
			fs = r("fs");
		try {
			fs.mkdirSync("./db");
		} catch(e) {
			// ignore
		}
		LocalStorage = r("node-localstorage").LocalStorage; // indirection avoids load of unused code into browserfied version
	}
	
	class iLocalStorageDBStore extends iStore {
		constructor(name,db,clear) {
			super(name,db);
			if(typeof(window)!=="undefined") {
				this.storage = LocalStorage;
			} else {
				this.storage = new LocalStorage("./db/" + name);
			}
			if(clear) {
				this.storage.clear();
			}
		}
		delete(key) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					delete data[key];
					if(key.indexOf("@")>=0) {
						let parts = key.split("@");
						if(parts[0]===me.name) {
							me.storage.removeItem(key+".json");
							me.save().then(() => {
								resolve();
							});
							return;
						}
					}
					me.save().then(() => {
						resolve();
					});
				});
			});
		}
		get(key) {
			let me = this,
				keyProperty = me.db.keyProperty;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					let result = data[key];
					if(key.indexOf("@")>=0 && data[keyProperty] && data[keyProperty][key]) {
						let parts = key.split("@");
						if(parts[0]===me.name) {
							result = data[key] = me.restore(JSON.parse(me.storage.getItem(key+".json")));
							resolve(result);
							return;
						}
					}
					resolve(result);
				});
			});
		}
		initialized() {
			let me = this;
			return new Promise((resolve,reject) => {
				me.db.storage.open().then(() => {
					me.load().then((data) => {
						if(!data) {
							me.data = {};
							me.save().then(() => {
								resolve(me.data);
							});
						} else {
							resolve(data);
						}
					});
				});
			});
		}
		load(force) {
			let me = this;
			return new Promise((resolve,reject) => {
				if(me.data && !force) {
					resolve(me.data);
					return;
				}
				resolve(JSON.parse(me.storage.getItem(me.name+".json")));
			});
		}
		put(object) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.db.storage.open().then(() => {
					let keyProperty = me.db.keyProperty;
					me.storage.setItem(object[keyProperty]+".json",JSON.stringify(me.normalize(object)));
					resolve();
				});	
			});
		}
		save() {
			let me = this;
			return new Promise((resolve,reject) => {
				if(!me.data) {
					resolve();
					return;
				}
				me.storage.setItem(me.name+".json",JSON.stringify(me.normalize(me.data)));
				resolve();
			});
		}
		set(key,value) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					data[key] = value;
					me.save().then(() => {
						resolve();
					});
				});
			});
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iLocalStorageDBStore;
	}
	if(typeof(window)!=="undefined") {
		window.iLocalStorageDBStore = iLocalStorageDBStore;
	}
})();
},{"./iStore":14}],12:[function(require,module,exports){
(function() {
	"use strict";
	let iMemStore = require("./iMemStore");
		
	class iMemDB {
		constructor(name) {
			this.name = name;
		}
		createStore(name,db) {
			return new iMemStore(name,db);
		}
		close() {
			
		}
		open() {
			return Promise.resolve();
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iMemDB;
	}
	if(typeof(window)!=="undefined") {
		window.iMemDB = iMemDB;
	}
})();
},{"./iMemStore":13}],13:[function(require,module,exports){
(function() {
	"use strict";
	let iStore = require("./iStore");
	
	class iMemStore extends iStore {
		constructor(name,db) {
			super(name,db);
		}
		delete(key) {
			delete this[key];
			return Promise.resolve();
		}
		get(key) {
			return Promise.resolve(this[key]);
		}
		put(object) {
			let me = this,
				keyProperty = me.db.keyProperty;
			return me.set(object[keyProperty],object);
		}
		load(force) {
			return Promise.resolve();
		}
		save(value,key) {
			return this.set(key,value);
		}
		set(key,value) {
			this[key] = value;
			return Promise.resolve();
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iMemStore;
	}
	if(typeof(window)!=="undefined") {
		window.iMemStore = iMemStore;
	}
})();
},{"./iStore":14}],14:[function(require,module,exports){
(function() {
	"use strict";
	
	class iStore {
		constructor(name,db) {
			this.name = name;
			this.db = db;
			this.scope = {};
		}
		addScope(value) {
			let me = this;
			if(value && typeof(value)==="object") {
				me.scope[value.constructor.name] = value.constructor;
				Object.keys(value).forEach((property) => {
					me.addScope(value[property]);
				});
			}
		}
		normalize(value,recursing) {
			let me = this,
				type = typeof(value),
				result;
			if(value && type==="object") {
				let json = (value.toJSON ? value.toJSON() : value);
				if(typeof(json)!=="object") {
					json = value;
				}
				me.addScope(value);
				result = {};
				if(recursing  && json[me.db.keyProperty]) {
					result[me.db.keyProperty] = json[me.db.keyProperty];
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
				let key = json[me.db.keyProperty];
				if(typeof(key)==="string") {
					let parts = key.split("@"),
						cls = me.scope[parts[0]];
					if(!cls) {
						try {
							me.scope[parts[0]] = cls = Function("return " + parts[0]);
						} catch(e) {
							Object.keys(json).forEach((property) => {
								json[property] = me.restore(json[property]);
							});
							return json;
						}
						me.scope[parts[0]] = cls;
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
	
	if(typeof(module)!=="undefined") {
		module.exports = iStore;
	}
	if(typeof(window)!=="undefined") {
		window.iCache = iStore;
	}
})();
},{}],15:[function(require,module,exports){
(function() {
	"use strict";
 /*
 * https://github.com/Benvie
 * improvements 2015 by AnyWhichWay
 */
function intersection(h){var a=arguments.length;if(0===a)return[];if(1===a)return intersection(h,h);var e=0,k=0,l=0,m=[],d=[],n=new Map,b;do{var p=arguments[e],q=p.length,f=1<<e;b=0;if(!q)return[];k|=f;do{var g=p[b],c=n.get(g);"undefined"===typeof c?(l++,c=d.length,n.set(g,c),m[c]=g,d[c]=f):d[c]|=f}while(++b<q)}while(++e<a);a=[];b=0;do d[b]===k&&(a[a.length]=m[b]);while(++b<l);return a}

if(typeof(module)!=="undefined") {
	module.exports = intersection;
}
if(typeof(window)!=="undefined") {
	window.intersection = intersection;
}
})();
},{}],16:[function(require,module,exports){
(function() {
	"use strict";
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
	
	if(typeof(module)!=="undefined") {
		module.exports = soundex;
	}
	if(typeof(window)!=="undefined") {
		window.intersection = soundex;
	}
})();
},{}]},{},[1]);
