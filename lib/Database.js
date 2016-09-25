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