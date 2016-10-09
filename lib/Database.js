(function() {
	"use strict";
	let CXProduct = require("./CXProductLite"),
	Cursor = require("./Cursor"),
	Index = require("./Index"),
	iIndexedDB = (typeof(window)!=="undefined" ? require("./iIndexedDB") : undefined),
	iLocalStorageDB = require("./iLocalStorageDB"),
	iLocalForageDB = require("./iLocalForageDB"),
	iMemDB = require("./iMemDB");

	class Database {
		constructor(keyProperty="@key",Storage=iMemDB,name,shared,clear) {
			let db = this;
			db.clear = true;
			db.shared = shared;
			db.keyProperty = keyProperty;
			db.storage = new Storage(name);
			
			db.index(Object,shared,clear);
			
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
			db.Pattern.index = (shared ? Object.index : new Index(db.Pattern,db,keyProperty,false,clear));
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
			db.Entity.index = (shared ? Object.index : new Index(db.Entity,db,keyProperty,false,clear));
			if(shared) {
				Array.index = Object.index;
				db.Array = Array;
				Date.index = Object.index;
				db.Date = Date;
			} else {
				db.index(Array,false,clear);
				db.index(Date,false,clear);
			}
			db.patterns = {};
		}
		index(cls,shared,clear) {
			let db = this;
			if(!cls.index) { 
				cls.index = new Index(cls,db,db.keyProperty,(typeof(shared)==="boolean" ? shared : db.shared),(typeof(clear)==="boolean" ? clear : db.clear));
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
							//	let loads = [];
							//	Object.keys(classVars).forEach((classVar) => {
							//		loads.push(classVars[classVar].index.load());
							//	});
							//	Promise.all(loads).then(() => {
									let matches = {},
										matchvars = [],
										promises = [];
									Object.keys(pattern).forEach((classVar) => {
										let restrictions;
										if(!classVars[classVar].index) { 
											return false;
										}
										matchvars.push(classVar);
										if(classVar===restrictVar) {
											restrictions = [instanceId];
										}
										promises.push(classVars[classVar].index.match(pattern[classVar],restrictions,classVars));
										//return matches[classVar] && matches[classVar].length>0;
									});
									Promise.all(promises).then((results) => {
										let pass = true;
										results.forEach((result,i) => {
											matches[matchvars[i]] = result;
											if(result.length===0) {
												pass = false;
											}
										});
										if(!pass) {
											resolve(new Cursor([],new CXProduct([]),projection,{}),matches);
										} else {
											let classes = [],
											collections = [],
											classVarMap = {};
											Object.keys(matches).forEach((classVar,i) => {
												classes.push(classVars[classVar]);
												collections.push(matches[classVar]);
												classVarMap[classVar] = i;
											});
											resolve(new Cursor(classes,new CXProduct(collections),projection,classVarMap),matches);
										}
									});
								});
							//});
						}
					}
				}
			}
		}
	}
	Database.indexedDB = iIndexedDB;
	Database.localStorageDB = iLocalStorageDB;
	Database.localForageDB = iLocalForageDB;
	Database.memDB = iMemDB;
	if(typeof(module)!=="undefined") {
		module.exports = Database;
	}
	if(typeof(window)!=="undefined") {
		window.Database = Database;
	}
})();