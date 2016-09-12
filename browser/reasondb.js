(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
	"use strict";
	let Database = require("./lib/Database");

	if(typeof(module)!=="undefined") {
		module.exports = Database;
	}
	if(typeof(window)!=="undefined") {
		window.ReasonDB = Database;
	}
})();
},{"./lib/Database":4}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
(function() {
	"use strict";
	let CXProduct = require("./CXProductLite"),
	Cursor = require("./Cursor"),
	Index = require("./Index"),
	iIndexedDB = require("./iIndexedDB"),
	iMemDB = require("./iMemDB");

	class Database {
		constructor(keyProperty="@key",Storage=iMemDB,name) {
			this.keyProperty = keyProperty;
			this.storage = new Storage(name);
			this.Pattern = class Pattern {
				constructor(projection,classVars,when) {
					let me = this;
					Object.keys(when).forEach((key) => {
						me[key] = when[key];
					});
					Pattern.index.put(me);
					Object.defineProperty(me,"projection",{configurable:true,writable:true,value:projection});
					Object.defineProperty(me,"classVars",{configurable:true,writable:true,value:classVars});
					Object.defineProperty(me,"matches",{configurable:true,writable:true,value:[]});
					Object.defineProperty(me,"then",{configurable:true,writable:true,value:null});
				}
			}
			this.Pattern.index = new Index(this.Pattern,keyProperty,this);
			this.Entity = class Entity {
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
			this.Entity.index = new Index(this.Entity,keyProperty,this);
			this.patterns = {};
		}
		select(projection) {
			var db = this;
			return {
				from(classVars) {
					return {
						when(whenPattern) {
							let pattern = new db.Pattern(projection,classVars,whenPattern);
							return {
								then(f) {
									let next;
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
									}
									Object.keys(pattern).forEach((classVar) => {
										if(classVar[0]!=="$") { return; }
										let cls = classVars[classVar];
										if(!db.patterns[cls.name]) { db.patterns[cls.name] = {}; }
										Object.keys(pattern[classVar]).forEach((property) => {
											if(!db.patterns[cls.name][property]) { db.patterns[cls.name][property] = {}; }
											if(typeof(pattern[classVar][property])==="object") {
												Object.keys(pattern[classVar][property]).forEach((test) => {
													if(test[0]!=="$") { return; }
													if(classVars[test]) {
														let othercls = classVars[test],
															otherproperty = pattern[classVar][property][test];
														test = "$eq";
														if(!db.patterns[cls.name][property][test][othercls.name]) { db.patterns[cls.name][property][test][othercls.name] = {}; }
														if(!db.patterns[othercls.name]) { db.patterns[othercls.name] = {}; }
														if(!db.patterns[othercls.name][otherproperty]) { db.patterns[othercls.name][otherproperty] = {}; }
														if(!db.patterns[cls.name][property][test][othercls.name][otherproperty]) { 
															db.patterns[cls.name][property][test][othercls.name][otherproperty] = db.patterns[othercls.name][otherproperty];
														}
													} else {
														if(!db.patterns[cls.name][property][test]) { db.patterns[cls.name][property][test] = {}; }
														let value = pattern[classVar][property][test],
														type = typeof(value);
														if(!db.patterns[cls.name][property][test][type]) { db.patterns[cls.name][property][test][type] = {}; }
														if(!db.patterns[cls.name][property][test][type][value]) { db.patterns[cls.name][property][test][type][value] = {}; }
														if(!db.patterns[cls.name][property][test][type][value][pattern[db.keyProperty]]) { db.patterns[cls.name][property][test][type][value][pattern[db.keyProperty]] = {}; }
														if(!db.patterns[cls.name][property][test][type][value][pattern[db.keyProperty]][classVar]) { db.patterns[cls.name][property][test][type][value][pattern[db.keyProperty]][classVar] = {}; }
														if(pattern.matches.indexOf(db.patterns[cls.name][property][test][type][value][pattern[db.keyProperty]])===-1) {
															pattern.matches.push(db.patterns[cls.name][property][test][type][value][pattern[db.keyProperty]]);
														}
													}
												});	
											}
										});
									});
									return f;
								}
							}
						},
						where(pattern) {
							return {
								then(f) {
									let matches = {};
									if(Object.keys(pattern).every((classVar) => {
										let cls = classVars[classVar];
										matches[classVar] = cls.index.match(pattern[classVar],classVars,matches);
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
										f([]);
									}
								}
							}
						}
					}
				}
			}
		}
	}
	Database.indexedDB = iIndexedDB;
	Database.memDB = iMemDB;
	if(typeof(module)!=="undefined") {
		module.exports = Database;
	}
	if(typeof(window)!=="undefined") {
		window.Database = Database;
	}
})();
},{"./CXProductLite":2,"./Cursor":3,"./Index":5,"./iIndexedDB":6,"./iMemDB":8}],5:[function(require,module,exports){
(function() {
	"use strict";
	let intersection = require("./intersection"),
		CXProduct = require("./CXProductLite"),
		Cursor = require("./Cursor");

	function IndexValue(value,id,node,oldvalue,keyProperty,db) {
		let type = typeof(value),
		oldtype = typeof(oldvalue);
		if(value && type==="object") {
			if(!value.constructor.index) { value.constructor.index = new Index(value.constructor,keyProperty,db); }
			value.constructor.index.put(value);
			type = value.constructor.name + "@";
			value = value[keyProperty];
		} 
		if(!node[value]) { node[value]={}; }
		if(!node[value][type]) { node[value][type]={}; }
		node[value][type][id] = true;
		if(oldvalue && oldtype==="object") {
			oldtype = oldvalue.constructor.name + "@";
			oldvalue = oldvalue[keyProperty];
		} 
		if(!node[oldvalue]) { return; }
		if(!node[oldvalue][oldtype]) { return; }
		delete node[oldvalue][oldtype][id];
	}


	function Index(cls,keyProperty="@key",db) {
		Object.defineProperty(this,"metadata",{value: {
				className: cls.name,
				db: db,
				nextid: 0,
				keyProperty: keyProperty,
				store: db.storage.createStore(cls.name,db)
		}});
	}
	Index.prototype.uid = function() {
		return  this.metadata.className + "@" + (++this.metadata.nextid);
	}
	Index.prototype.get = function(key) {
		// should test to make sure it is an object key
		let instance = this[key];
		return Promise.resolve(instance);
	}
	Index.prototype.put = function(object) {
		let index = this,
			keyProperty = index.metadata.keyProperty,
			store = index.metadata.store;
		if(!object || typeof(object)!=="object") {
			return;
		}
		if(object[keyProperty]==null) { object[keyProperty] = this.uid(); }
		index[object[keyProperty]] = object;
		//index.metadata.instances[object[keyProperty]] = object;
		Object.keys(object).forEach((property) => {
			function get() {
				return get.value;
			}
			function set(value) {
				let me = this,
					type = typeof(value),
					oldvalue = get.value,
					db = index.metadata.db,
					store = index.metadata.store,
					keyProperty = index.metadata.keyProperty;
					get.value = value;
				if(oldvalue!==value) {
					if(value && type==="object") {
						if(!value.constructor.index) { value.constructor.index = new Index(value.constructor,keyProperty,db); }
						value.constructor.index.put(value);
					}
					if(!index[property]) { index[property] = {}; }
					IndexValue(value,me[keyProperty],index[property],oldvalue,keyProperty,store,db);
					if(db) {
						index.patternMatch(me,property,value);
					}
				}
			}
			let value = object[property],
			desc = Object.getOwnPropertyDescriptor(object,property);
			if(desc.set+""!==set+"") {
				desc.get = get;
				desc.set = set;
				delete desc.writable;
				delete desc.value;
				Object.defineProperty(object,property,desc);
			}
			object[property] = value;
			store.set(property,index[property]);
		});
		index.save();
	}
	Index.prototype.save = function() {
		let me = this,
			store = me.metadata.store,
			promises = [];
		if(store) {
			Object.keys(me).forEach((property) => {
				promises.push(store.set(property,me[property]));
			});
		}
		return Promise.all(promises);
	}
	Index.prototype.patternMatch = function(object,property,value) {
		let index = this,
			db = index.metadata.db,
			cls = object.constructor,
			type = typeof(value),
			keyProperty = index.metadata.keyProperty;
		if(db.patterns[cls.name] && db.patterns[cls.name][property]) {
			Object.keys(db.patterns[cls.name][property]).forEach((test) => {
				if(db.patterns[cls.name][property][test][type]) {
					Object.keys(db.patterns[cls.name][property][test][type]).forEach((testvalue) => {
						if(Index[test](value,Index.$coerce(testvalue,type))) {
							Object.keys(db.patterns[cls.name][property][test][type][testvalue]).forEach((patternId) => {
								Object.keys(db.patterns[cls.name][property][test][type][testvalue][patternId]).forEach((classVar) => {
									db.patterns[cls.name][property][test][type][testvalue][patternId][classVar][object[keyProperty]] = object;
								});
								let results = {},
								pattern = index.metadata.db.Pattern.index[patternId];
								if(pattern.matches.every((matches) => {
									return Object.keys(matches).every((classVar) => {
										let ids = Object.keys(matches[classVar]);
										results[classVar]  = (results[classVar]  ? intersection(results[classVar],ids) : ids);
										return results[classVar]  && results[classVar].length > 0;
									});
								})) {
									let classes = [],
									collections = [],
									classVarMap = {};
									Object.keys(results).forEach((classVar,i) => {
										classes.push(pattern.classVars[classVar]);
										collections.push(results[classVar]);
										classVarMap[classVar] = i;
									});
									pattern.then(new Cursor(classes,new CXProduct(collections),pattern.projection,classVarMap),results);
								}
							});
						}
					});
				}
			});
		}
	}
	Index.prototype.match = function(pattern,classVars,matches) {
		function match(v1,v2,results,test) {
			let type = typeof(v2);
			if(v1 && typeof(v1)==="object")  {
				if(Object.keys(v1).every((key) => {
					if(key[0]==="$") {
						if(Index[key]) {
							results = match(v1[key],v2,results,key);
						}
						if(classVars[key]) { //{$e1: "name"}
							//results = join(me[key],)
						}
					}
					if(v2 && type==="object") {
						results = match(v1[key],v2[key],results,test);
					}
					return results
				})) {
					return results;
				};
			} else if(test) {
				return test(Index.$coerce(v1,type),v2);
			}
			return v1===v2;
		}
		function join(leftNode,rightNode,results,test) {
			let ids = [],
			left = [],
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
				test;
				if(value && type==="object") {
					let testname = Object.keys(value)[0];
					if(testname[0]==="$") {
						if(Index[testname]) {
							test = Index[testname];
							value = value[testname];
							type = typeof(value);
						} else if(classVars[testname] && classVars[testname].index && classVars[testname].index[value[testname]]) { // e.g. {$e1: {name: {$e2: "name"}}}
							results = join(me[property],classVars[testname].index[value[testname]],matches[testname]);
							return results && results.length > 0;
						}
					}
				}
				if(value && type==="object") {
					let keys = Object.keys(value);
					if(keys[0][0]==="$" && classVars[keys[0]]) { // e.g. {$e1: {name: {$eq: {$e2: "name"}}}}
						if(classVars[keys[0]].index[value[keys[0]]]) {
							results = join(me[property],classVars[keys[0]].index[value[keys[0]]],matches[keys[0]],test);
							return results && results.length > 0;
						}
					}
					return Object.keys(me[property]).every((instanceId) => {
						let cache = Index.prototype.match.cache,
						tmp = [];
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
							//	let instance = cls.index.metadata.instances[instanceId];
								let instance = cls.index[instanceId];
								if(match(value,instance,results)) {
									tmp = tmp.concat(Object.keys(me[property][instanceId][className]));
								}
							}
						});
						results = (results ? intersection(results,tmp) : tmp);
						return results && results.length > 0;
					});
				} else if(test) { // e.g. {$e1: {name: {$eq: "Mary"}}}
					let ids  = [];
					Object.keys(me[property]).forEach((testvalue) => {
						if(me[property][testvalue][type] && test(Index.$coerce(testvalue,type),value)) {
							ids = ids.concat(Object.keys(me[property][testvalue][type]));
						}
					});
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
	}
	Index.prototype.match.cache = {};
	Index.$coerce = function(value,type) {
		return value;
	}
	Index.$eq = function(v1,v2) {
		return v1==v2;
	}

	if(typeof(module)!=="undefined") {
		module.exports = Index;
	}
	if(typeof(window)!=="undefined") {
		window.Index = Index;
	}
})();

},{"./CXProductLite":2,"./Cursor":3,"./intersection":11}],6:[function(require,module,exports){
(function() {
	"use strict";
	let iIndexedDBStore = require("./iIndexedDBStore");
		
	class iIndexedDB {
		constructor(name) {
			this.name = name;
		}
		createStore(name,db) {
			return new iIndexedDBStore(name,db)	
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
					db.deleteObjectStore("Values");
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
},{"./iIndexedDBStore":7}],7:[function(require,module,exports){
(function() {
	"use strict";
	let iStore = require("./iStore");
	
	class iIndexedDBStore extends iStore {
		constructor(name,db) {
			super(name,db);
		}
		del(key) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					delete data[key];
					me.save().then(() => {
						resolve();
					});
				});
			});
		}
		get(key) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.initiliazed().then((data) => {
					resolve(data[key]);
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
					reject(event);
				};
				request.onsuccess = function(event) {
					me.data = me.restore(request.result);
				}
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
					request = transaction.objectStore("Values").put(me.data,me.name);
				transaction.oncomplete = function(event) {
					resolve();
				};
				transaction.onerror = function(event) {
					reject(event);
				};
				request.onerror = function(event) {
					reject(event);
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
},{"./iStore":10}],8:[function(require,module,exports){
(function() {
	"use strict";
	iMemStore = require("./iMemStore");
		
	class iMemDB {
		constructor(name) {
			this.name = name;
		}
		createStore() {
			return new iMemStore();
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
},{"./iMemStore":9}],9:[function(require,module,exports){
(function() {
	"use strict";
	
	class iMemStore  {
		constructor() {
			this.store = {};
		}
		del(key) {
			delete this[key];
			return Promise.resolve();
		}
		get(key) {
			return Promise.resolve(this.store[key]);
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}]},{},[1]);
