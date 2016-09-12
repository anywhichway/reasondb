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