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

module.exports = CXProduct;

},{}],3:[function(require,module,exports){
function Cursor(classes,cxproduct,projection,classVarMap) {
	this.classes = classes;
	this.cxproduct = cxproduct;
	this.projection = projection;
	this.classVarMap = classVarMap;
	this.position = 0;
}
Cursor.prototype.next = function() {
	let me = this;
	if(me.position<me.cxproduct.length) {
		return me.get(me.position++);
	}
}
Cursor.prototype.move = function(postition) {
	let me = this;
	if(position>=0 && position<me.cxproduct.length) {
		me.position = position;
	}
}
Cursor.prototype.count = function() {
	return me.cxproduct.length;
}
Cursor.prototype.get = function(row) {
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

module.exports = Cursor;
},{}],4:[function(require,module,exports){
let CXProduct = require("./CXProductLite"),
	Cursor = require("./Cursor"),
	Index = require("./Index");

class Database {
	constructor() {
		this.Pattern = class Pattern {
			constructor(config) {
				let me = this;
				Object.keys(config).forEach((key) => {
					me[key] = config[key];
				});
				Pattern.index.put(me);
				Object.defineProperty(me,"matches",{configurable:true,writable:true,value:[]});
				Object.defineProperty(me,"then",{configurable:true,writable:true,value:null});
			}
		}
		this.Pattern.index = new Index(this.Pattern,this);
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
		this.Entity.index = new Index(this.Entity,this);
		this.patterns = {};
	}
	select(projection) {
		var db = this;
		return {
			from(classVars) {
				return {
					when(whenPattern) {
						let pattern = new db.Pattern(whenPattern);
						return {
							then(f) {
								pattern.then = f;
								Object.keys(pattern).forEach((classVar) => {
									if(classVar[0]!=="$") { return; }
									let cls = classVars[classVar];
									if(!db.patterns[cls.name]) { db.patterns[cls.name] = {}; }
									Object.keys(pattern[classVar]).forEach((property) => {
										if(!db.patterns[cls.name][property]) { db.patterns[cls.name][property] = {}; }
										Object.keys(pattern[classVar][property]).forEach((test) => {
											if(test[0]!=="$") { return; }
											if(!db.patterns[cls.name][property][test]) { db.patterns[cls.name][property][test] = {}; }
											let value = pattern[classVar][property][test],
												type = typeof(value);
											if(!db.patterns[cls.name][property][test][type]) { db.patterns[cls.name][property][test][type] = {}; }
											if(!db.patterns[cls.name][property][test][type][value]) { db.patterns[cls.name][property][test][type][value] = {}; }
											if(!db.patterns[cls.name][property][test][type][value][pattern.id]) { db.patterns[cls.name][property][test][type][value][pattern.id] = {}; }
											if(!db.patterns[cls.name][property][test][type][value][pattern.id][classVar]) { db.patterns[cls.name][property][test][type][value][pattern.id][classVar] = {}; }
											if(pattern.matches.indexOf(db.patterns[cls.name][property][test][type][value][pattern.id])===-1) {
												pattern.matches.push(db.patterns[cls.name][property][test][type][value][pattern.id]);
											}
										});
									});
								});
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

module.exports = Database;
},{"./CXProductLite":2,"./Cursor":3,"./Index":5}],5:[function(require,module,exports){
let intersection = require("./intersection");
	
function IndexValue(value,id,node,oldvalue) {
	let type = typeof(value),
		oldtype = typeof(oldvalue);
	if(value && type==="object") {
		if(!value.constructor.index) { value.constructor.index = new Index(value.constructor); }
		value.constructor.index.put(value);
		type = value.constructor.name + "@";
		value = value.id;
	} 
	if(!node[value]) { node[value]={}; }
	if(!node[value][type]) { node[value][type]={}; }
	node[value][type][id] = true;
	if(oldvalue && oldtype==="object") {
		oldtype = oldvalue.constructor.name + "@";
		oldvalue = oldvalue.id;
	} 
	if(!node[oldvalue]) { return; }
	if(!node[oldvalue][oldtype]) { return; }
	delete node[oldvalue][oldtype][id];
}


function Index(cls,db) {
	this.metadata = {
		className: cls.name,
		db: db,
		nextid: 0,
		instances: {}
	}
}
Index.prototype.uid = function() {
	return  this.metadata.className + "@" + (++this.metadata.nextid);
}
Index.prototype.get = function(key) {
	return Promise.resolve(this.metadata.instances[key]);
}
Index.prototype.put = function(object) {
	let index = this;
	if(!object || typeof(object)!=="object") {
		return;
	}
	if(object.id==null) { object.id = this.uid(); }
	index.metadata.instances[object.id] = object;
	Object.keys(object).forEach((property) => {
		function get() {
			return get.value;
		}
		function set(value) {
			let me = this,
				cls = me.constructor,
				type = typeof(value),
				oldvalue = get.value,
				db = index.metadata.db;
			get.value = value;
			if(oldvalue!==value) {
				if(value && type==="object") {
					if(!value.constructor.index) { value.constructor.index = new Index(value.constructor); }
					value.constructor.index.put(value);
				}
				if(!index[property]) { index[property] = {}; }
				IndexValue(value,me.id,index[property],oldvalue);
				
				if(index.metadata.db) {
					if(db.patterns[cls.name] && db.patterns[cls.name][property]) {
						Object.keys(db.patterns[cls.name][property]).forEach((test) => {
							if(db.patterns[cls.name][property][test][type]) {
								Object.keys(db.patterns[cls.name][property][test][type]).forEach((testvalue) => {
									if(Index[test](value,Index.$coerce(testvalue,type))) {
										Object.keys(db.patterns[cls.name][property][test][type][testvalue]).forEach((patternId) => {
											Object.keys(db.patterns[cls.name][property][test][type][testvalue][patternId]).forEach((classVar) => {
												db.patterns[cls.name][property][test][type][testvalue][patternId][classVar][me.id] = me;
											});
											let results = {},
												pattern = index.metadata.db.Pattern.index.metadata.instances[patternId];
											if(pattern.matches.every((matches) => {
												return Object.keys(matches).every((classVar) => {
													let ids = Object.keys(matches[classVar]);
													results[classVar]  = (results[classVar]  ? intersection(results[classVar],ids) : ids);
													return results[classVar]  && results[classVar] .length > 0;
												});
											})) {
												pattern.then(results);
											}
										});
									}
								});
							}
						});
					}
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
	});
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
							let instance = cls.index.metadata.instances[instanceId];
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

module.exports = Index;

},{"./intersection":6}],6:[function(require,module,exports){
/*
 * https://github.com/Benvie
 * improvements 2015 by AnyWhichWay
 */
function intersection(h){var a=arguments.length;if(0===a)return[];if(1===a)return intersection(h,h);var e=0,k=0,l=0,m=[],d=[],n=new Map,b;do{var p=arguments[e],q=p.length,f=1<<e;b=0;if(!q)return[];k|=f;do{var g=p[b],c=n.get(g);"undefined"===typeof c?(l++,c=d.length,n.set(g,c),m[c]=g,d[c]=f):d[c]|=f}while(++b<q)}while(++e<a);a=[];b=0;do d[b]===k&&(a[a.length]=m[b]);while(++b<l);return a}

module.exports = intersection;
},{}]},{},[1]);
