/* 
The MIT License (MIT)

Copyright (c) 2016 AnyWhichWay, Simon Y. Blackwell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function() {
	let _uuid;
	if(typeof(window)==="undefined") {
		let r = require;
		_uuid = r("node-uuid");
	}
	
	/*async function asyncForEach(f) {
		let iterable = this;
		for(var i=0;i<iterable.length;i++) {
			await f(iterable[i]);
		}
		return;
	}
	async function asyncEvery(f) {
		let iterable = this;
		for(var i=0;i<iterable.length;i++) {
			let result = await f(iterable[i]);
			if(!result) { return; }
		}
		return;
	}
	async function asyncSome(f) {
		let iterable = this;
		for(var i=0;i<iterable.length;i++) {
			let result = await f(iterable[i]);
			if(result) { return; }
		}
		return;
	}*/

	Array.indexKeys = ["length","$max","$min","$avg","*"];
	Array.reindexCalls = ["push","pop","splice","reverse","fill","shift","unshift"];
	Array.fromJSON = function(json) {
		let array = [];
		Object.keys(json).forEach((key) => {
			array[key] = json[key];
		});
		return array;
	}
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
	
	Date.indexKeys = ["*"];
	Date.reindexCalls = [];
	Date.fromJSON = function(json) {
		let dt = new Date(json.time);
		Object.keys(json).forEach((key) => {
			if(key!=="time") {
				dt[key] = json[key];
			}
		});
		return dt;
	}
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
	function soundex(a){a=(a+"").toLowerCase().split("");var c=a.shift(),b="",d={a:"",e:"",i:"",o:"",u:"",b:1,f:1,p:1,v:1,c:2,g:2,j:2,k:2,q:2,s:2,x:2,z:2,d:3,t:3,l:4,m:5,n:5,r:6},b=c+a.map(function(a){return d[a]}).filter(function(a,b,e){return 0===b?a!==d[c]:a!==e[b-1]}).join("");return(b+"000").slice(0,4).toUpperCase()};
	
	// http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
	function getRandomInt(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	//Shanti R Rao and Potluri M Rao, "Sample Size Calculator", 
	//Raosoft Inc., 2009, http://www.raosoft.com/samplesize.html
	//probCriticalNormal function is adapted from an algorithm published
	//in Numerical Recipes in Fortran.
	function probCriticalNormal(a){var d,e,b,c;b=[0,-.322232431088,-1,-.342242088547,-.0204231210245,-4.53642210148E-5];var f=[0,.099348462606,.588581570495,.531103462366,.10353775285,.0038560700634];a=.5-a/2;if(1E-8>=a)b=6;else if(.5==a)b=0;else{a=Math.sqrt(Math.log(1/(a*a)));d=b[5];e=f[5];for(c=4;1<=c;c--)d=d*a+b[c],e=e*a+f[c];b=a+d/e}return b};
	function samplesize(confidence, margin, population)
	{
		var response = 50, pcn = probCriticalNormal(confidence / 100.0),
	     d1 = pcn * pcn * response * (100.0 - response),
	     d2 = (population - 1.0) * (margin * margin) + d1;
	    if (d2 > 0.0)
	     return Math.ceil(population * d1 / d2);
	    return 0.0;
	}
	
	function CXProduct(collections,filter) {
		this.collections = (collections ? collections : []);
		this.filter = filter;
		Object.defineProperty(this,"length",{set:function() {},get:function() { if(this.collections.length===0){ return 0; } if(this.start!==undefined && this.end!==undefined) { return this.end - this.start; }; var size = 1; this.collections.forEach(function(collection) { size *= collection.length; }); return size; }});
		Object.defineProperty(this,"size",{set:function() {},get:function() { return this.length; }});
	}
	// there is probably an alogorithm that never returns null if index is in range and takes into account the restrict right
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
		constructor(classes,cxProductOrRows,projection,classVars={}) {
			let me = this;
			me.classes = classes;
			if(Array.isArray(cxProductOrRows)) {
				me.rows = cxProductOrRows;
			} else {
				me.cxproduct = cxProductOrRows;
			}
			me.projection = projection;
			me.classVarMap = {};
			me.classVars = classVars;
			Object.keys(classVars).forEach((classVar,i) => {
				me.classVarMap[classVar] = i;
			});
		}
		async first(count) {
			let cursor = this;
			return new Promise((resolve,reject) => {
				let results = [];
				cursor.forEach((row) => {
					if(results.length<count) {
						results.push(row);
					}
					if(results.length===count) {
						resolve(results);
					}
				}).then(() => {
					if(results.length<count) {
						resolve(results);
					}
				});
			});
		}
		async forEach(f) {
			let cursor = this;
			return new Promise((resolve,reject) => {
				let promises = [],
					results = [],
					i = 0;
				function rows() {
					promises.push(cursor.get(i).then((row) => {
						if(row) {
							let result = f(row,i,cursor);
							if(!(result instanceof Promise)) {
								result = Promise.resolve(result);
							}
							results.push(result);
						}
					}));
					i++;
					if(i < cursor.maxCount) {
						rows();
					}
				}
				rows();
				Promise.all(promises).then((rows) => {
					resolve(results);
				});
				//resolve(promises);
			});
		}
		async every(f) {
			let cursor = this,
				result = true;
			return new Promise((resolve,reject) => {
				cursor.forEach((row) => {
					if(result && !f(row)) {
						result = false;
						resolve(false);
					};
				}).then(() => {
					if(result) {
						resolve(result);
					}
				});
			});
		}
		async random(count) {
			let cursor = this,
				maxcount = cursor.maxCount,
				done = {},
				results = [],
				resolver,
				rejector,
				promise = new Promise((resolve,reject) => { resolver = resolve; rejector = reject; });
			function select() {
				let i = getRandomInt(0,cursor.maxCount-1);
				if(!done[i]) {
					done[i] = true;
					cursor.get(i).then((row) => {
						if(row) {
							if(results.length<count && results.length<maxcount) {
								results.push(row);
							}
							if(results.length===count || results.length===maxcount) {
								resolver(results);
								return;
							}
						} else {
							maxcount--;
						}
						select();
					});
				} else {
					select();
				}
			}
			select();
			return promise;
		}
		async sample(confidence, margin) {
			let cursor = this,
				done = {},
				results = [],
				resolver,
				rejector,
				promise = new Promise((resolve,reject) => { resolver = resolve; rejector = reject; });
			cursor.count().then((population) => {
				let count = samplesize(confidence, margin,population);
				function select() {
					let i = getRandomInt(0,cursor.maxCount-1);
					if(!done[i]) {
						done[i] = true;
						cursor.get(i).then((row) => {
							if(row) {
								if(results.length<count) {
									results.push(row);
								}
								if(results.length===count) {
									resolver(results);
									return;
								}
							}
							select();
						});
					} else {
						select();
					}
				}
				select();
			});
			return promise;
		}
		async some(f) {
			let cursor = this,
				result = false;
			return new Promise((resolve,reject) => {
				cursor.forEach((row) => {
					if(f(row)) {
						result = true;
						resolve(true);
					}
				}).then(() => {
					if(!result) {
						resolve(false);
					}
				});
			});
		}
		async count() {
			let cursor = this,
				i = 0;
			return new Promise((resolve,reject) => {
				cursor.forEach((row) => {
					i++;
				}).then(() => {
					resolve(i);
				});
			});
		}
		async get(rowNumber) {
			let me = this;
			if(me.rows) {
				if(rowNumber<me.maxCount) {
					return me.rows[rowNumber];
				}
				return undefined; // should we throw an error?
			}
			return new Promise((resolve,reject) => {
				let promises = [],
					vars = Object.keys(me.classVars);
				if(rowNumber>=0 && rowNumber<me.cxproduct.length) {
					let row = me.cxproduct.get(rowNumber);
					if(row) {
						row.forEach((id,col) => {
							let classVar = vars[col],
							cls = me.classVars[classVar];
							promises.push(cls.index.get(row[col]));
						});
						Promise.all(promises).then((instances) => {
							let result;
							if(me.projection) {
								result = {};
								Object.keys(me.projection).forEach((property) => {
									let colspec = me.projection[property];
									if(colspec && typeof(colspec)==="object") {
										let classVar = Object.keys(colspec)[0],
											key = colspec[classVar],
											col = me.classVarMap[classVar];
										result[property] = instances[col][key];		
									}
								});
							} else {
								result = [];
								instances.forEach((instance) => {
									result.push(instance);
								})
							}
							resolve(result);
						});
					} else {
						resolve(undefined);
					}
				} else {
					resolve(undefined);
				}
			});	
		}
		get maxCount() {
			return (this.rows ? this.rows.length : this.cxproduct.length);
		}
	}
	function stream(object,db) {
		let fired = {},
			cls = object.constructor;
		Index.keys(object).forEach((key) => {
			if(db.patterns[cls.name] && db.patterns[cls.name][key]) {
				Object.keys(db.patterns[cls.name][key]).forEach((patternId) => {
					if(fired[patternId]) { return; }
					Object.keys(db.patterns[cls.name][key][patternId]).forEach((classVar) => {
						let pattern = db.patterns[cls.name][key][patternId][classVar],
							projection,
							when = {};
						if(!pattern.action) { return; }
						if(pattern.projection) {
							projection = {};
							Object.keys(pattern.projection).forEach((key) => {
								if(key!==db.keyProperty) {
									projection[key] = pattern.projection[key];
								}
							});
						}
						Object.keys(pattern.when).forEach((key) => {
							if(key!==db.keyProperty) {
								when[key] = {};
								Object.keys(pattern.when[key]).forEach((wkey) => {
									when[key][wkey] = pattern.when[key][wkey];
								});
								if(pattern.classVars[key] && object instanceof pattern.classVars[key]) {
									when[key][db.keyProperty] = object[db.keyProperty];
								}
							}
						});
						db.select(projection).from(pattern.classVars).where(when).exec().then((cursor) => { 
							if(!fired[patternId] && cursor.maxCount>0) { 
								fired[patternId]=true;
								pattern.action(cursor); 
							} 
						});
					});
				});
			}
		});
	}
	class Index {
		constructor(cls,keyProperty="@key",db,StorageType=(db ? db.storageType : MemStore),clear=(db ? db.clear : false)) {
			let store = new StorageType(cls.name,keyProperty,db,clear);
			cls.index = this;
			Object.defineProperty(this,"__metadata__",{value:{store:store,name:cls.name,prefix:""}});
			if(!db.shared) {
				this.__metadata__.prefix = cls.name + ".";
			}
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
					indexkeys = indexkeys.concat(Object.keys(object));
				}
			} else {
				indexkeys = Object.keys(object);
			}
			return indexkeys.filter((key) => {
				return key!=="*"; //typeof(object[key])!=="function" && 
			});
		}
		async clear() {
			let index = this,
				promises = [];
			Object.keys(index).forEach((key) => {
				promises.push(index.delete(key));
			});
			return new Promise((resolve,reject) => {
				Promise.all(promises).then(() => { resolve(); });
			});
		}
		async delete(id) {
			let index = this,
				store = index.__metadata__.store,
				keyProperty = store.__metadata__.keyProperty;
			return new Promise((resolve,reject) => {
				index.get(id).then((object) => { 
					let promises = [];
					promises.push(store.delete(id,true));
					Index.keys(object).forEach((key) => {
						promises.push(new Promise((resolve,reject) => {
							index.get(key).then((node) => {
								if(!node) { 
									resolve();
									return;
								}
								let value = object[key],
									type = typeof(value);
								if(type==="object") {
									if(!value) {
										if(node.null) {
											delete node.null[id];
										}
									} else if(value[keyProperty]) {
										let idvalue = value[keyProperty];
										if(node[idvalue][type] && node[idvalue][type][id]) {
											delete node[idvalue][type][id];
										}
									}
									index.save(key).then(() => {
										resolve(true);
									});
								} else if(type!=="undefined") {
									if(!node[value] || !node[value][type] || !node[value][type][id]) {
										resolve();
										return;
									}
									delete node[value][type][id];
									index.save(key).then(() => {
										resolve();
									});
								}
							});
						}));
					});
					Promise.all(promises).then(() => {
						delete object[keyProperty];
						delete index[id];
						resolve(id);
					});
				});
			});
		}
		flush(key) {
			let desc = Object.getOwnPropertyDescriptor(this,key);
			if(desc) {
				this[key] = false;
			}
		}
		get(key,init=false) {
			let index = this,
				value = index[key];
			if(!value) {
				let empty = {};
				if(init) {
					value = index[key] = empty;
				}
				return new Promise((resolve,reject) => {
					let metadata = index.__metadata__;
					metadata.store.get(key.indexOf(metadata.name+"@")===0 ? key : metadata.prefix+key).then((storedvalue) => {
						if(typeof(storedvalue)!=="undefined") {
							let store = index.__metadata__.store,
								db = store.db();
							if(index[key]===empty || !index[key]) { // another async may have already loaded the object
								value = index[key] = storedvalue;
								index.index(value,false,db.activate).then(() => {
									resolve(value);
								});
								resolve(value);
							} else {
								resolve(index[key]);
							}
						} else {
							resolve(value);
						}
					});
				});
			}
			return Promise.resolve(value);
		}
		async instances(keyArray,cls) {
			let index = this,
				results = [];
			for(var i=0;i<keyArray.length;i++) {
				try {
					let instance = await index.get(keyArray[i]);
					if(!cls || instance instanceof cls) {
						results.push(instance);
					}  
				} catch(e) {
					console.log(e);
				}
			}
			return results;
		}
		async match(pattern,classVars={},classMatches={},restrictRight={},classVar="$self",parentKey,nestedClass) {
			let index = this,
				keys = Object.keys(pattern),
				promises = [],
				literals = {},
				tests = {},
				nestedobjects = {},
				joinvars = {},
				joins = {},
				cols = {},
				results = classMatches,
				metadata = index.__metadata__,
				keyProperty = metadata.store.keyProperty();
			Object.keys(classVars).forEach((classVar,i) => {
				cols[classVar] = i;
				if(!results[classVar]) { results[classVar] = null; }
				if(!restrictRight[i]) { restrictRight[i] = {}; };
			});
			let nodes = [];
			for(var i=0;i<keys.length;i++) {
				let key = keys[i];
				if(!classVars[key]) {
					try {
						nodes.push(await index.get(key));
					} catch(e) {
						console.log(e);
					}
				}
			}
			return new Promise((resolve,reject) => { // db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
				nodes.every((node,i) => {
					let key = keys[i],
						value = pattern[key],
						type = typeof(value);
					if(!node) {
						if(type==="undefined") {
							return true;
						}
						results[classVar] = [];
						return false;
					}
					if(type!=="object") {
						return literals[i] = true;
					}
					Object.keys(value).forEach((key) => {
						if(classVars[key]) {
							joins[i] = {rightVar:key, rightIndex:(nestedClass ? nestedClass.index : classVars[key].index), rightProperty:value[key], test:Index.$eeq};
							return;
						}
						if(key[0]==="$") {
							let testvalue = value[key],
								test = Index[key];
							if(typeof(test)==="function") {
								if(testvalue && typeof(testvalue)==="object") {
									let second = Object.keys(testvalue)[0];
									if(classVars[second]) {
										return joins[i] = {rightVar:second, rightIndex:(nestedClass ? nestedClass.index : classVars[second].index), rightProperty:testvalue[second], test:test};
									}
								}
								tests[i] = true;
								return;
							}
						}
						nestedobjects[i] = true;
						return;
					});
					return true;
				});
				if(results[classVar] && results[classVar].length===0) { resolve([]); return; }
				let exclude = [];
				nodes.every((node,i) => {
					if(!literals[i]) { return true; }
					let key = keys[i],
						value = pattern[key],
						type = typeof(value);
					if(type==="undefined") {
						Object.keys(node).forEach((testValue) => {
							Object.keys(node[testValue]).forEach((testType) => {
								exclude = exclude.concat(Object.keys(node[testValue][testType]));
							});
						});
						return true;
					}
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
						testname = Object.keys(predicate)[0],
						value = predicate[testname],
						type = typeof(value),
						test = Index[testname],
						ids = [];
					if(type==="undefined" && (testname==="$eq" || testname==="$eeq")) {
						Object.keys(node).forEach((testValue) => {
							Object.keys(node[testValue]).forEach((testType) => {
								exclude = exclude.concat(Object.keys(node[testValue][testType]));
							});
						});
						return true;
					}
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
				let childnodes = [],
					nestedtypes = [];
				nodes.forEach((node,i) => {
					if(!nestedobjects[i]) { return; }
					let key = keys[i],
						nestedobject = pattern[key];
					Object.keys(node).forEach((key) => {
						if(key.indexOf("@")>0) {
							let parts = key.split("@"),
								clsname = parts[0];
							if(!nestedtypes[clsname]) {
								nestedtypes[clsname] = [];
							}
							childnodes.push(node);
							nestedtypes.push(new Function("return " + clsname)());
						}
					});
					nestedtypes.forEach((nestedtype) => {
						promises.push(nestedtype.index.match(nestedobject,classVars,classMatches,restrictRight,classVar + "$" + nestedtype.name,key,nestedtype));
					});
				});
				Promise.all(promises).then((childidsets) => {
					childidsets.every((childids,i) => {
						let ids = [],
							node = childnodes[i],
							nestedtype = nestedtypes[i];
						childids.forEach((id) => {
							//if(clsprefix && id.indexOf(clsprefix)!==0) { return; } // tests for $class
							if(node[id]) {
								ids = ids.concat(Object.keys(node[id][nestedtype.name]));
							}
						});
						results[classVar] = (results[classVar] ? intersection(results[classVar],ids) : intersection(ids,ids));
						return results[classVar].length > 0;
					});
					if(results[classVar] && results[classVar].length===0) { resolve([]); return;}
					let promises = [];
					nodes.forEach((node,i) => { // db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
						let join = joins[i];
						if(!join) { return true; }
						promises.push(join.rightIndex.get(join.rightProperty));
					});
					Promise.all(promises).then((rightnodes) => { // variable not used, promises just ensure nodes loaded for matching
						if(!results[classVar]) {
							results[classVar] = Object.keys(index[keyProperty]);
						}
						nodes.every((node,i) => { // db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
							let join = joins[i]; // {rightVar: second, rightIndex:classVars[second].index, rightProperty:testvalue[second], test:test};
							if(!join) { return true; }
							if(cols[join.rightVar]===0) {
								return true;
							}
							if(!join.rightIndex[join.rightProperty]) {
								results[classVar] = [];
								return false;
							}
							if(!results[join.rightVar]) {
								results[join.rightVar] = Object.keys(join.rightIndex[keyProperty]);
							}
							let leftids = [];
							Object.keys(node).forEach((leftValue) => {
								Object.keys(node[leftValue]).forEach((leftType) => {
									let innerleftids = Object.keys(node[leftValue][leftType]),
										innerrightids = [],
										some = false;
									Object.keys(join.rightIndex[join.rightProperty]).forEach((rightValue) => {
										Object.keys(join.rightIndex[join.rightProperty][rightValue]).forEach((rightType) => {
											if(join.test(Index.coerce(leftValue,leftType),Index.coerce(rightValue,rightType))) { 
												some = true;
												innerrightids = innerrightids.concat(Object.keys(join.rightIndex[join.rightProperty][rightValue][rightType]));
											}
										});
									});
									if(some) {
										leftids = leftids.concat(innerleftids);
										innerrightids = intersection(innerrightids,innerrightids);
										innerleftids.forEach((id,i) => {
											restrictRight[cols[join.rightVar]][id] = (restrictRight[cols[join.rightVar]][id] ? intersection(restrictRight[cols[join.rightVar]][id],innerrightids) : innerrightids);  
										});
									}
								});
							});
							results[classVar] = (results[classVar] && leftids.length>0 ? intersection(results[classVar],leftids) : leftids);
							return results[classVar] && results[classVar].length > 0;
						});
						if(results[classVar] && results[classVar].length>0) { resolve(results[classVar].filter((item) => { return exclude.indexOf(item)===-1; })); return; }
						resolve([]);
					});
				});
			});
		}
		async put(object) {
			let index = this,
				store = index.__metadata__.store,
				db = store.db(),
				keyProperty = store.keyProperty(),
				id = object[keyProperty];
			if(!id) {
				id = object.constructor.name +  "@" + (_uuid ? _uuid.v4() : uuid.v4());
				Object.defineProperty(object,keyProperty,{enumerable:true,configurable:true,value:id});
			}
			if(index[id]!==object) {
				store.addScope(object);
				try {
					await store.set(id,object,db.activate);
				} catch(e) {
					console.log(e);
				}
			}
			return index.index(object,true,db.activate);
		}
		async index(object,reIndex,activate) {
			let index = this,
				cls = object.constructor,
				db = this.__metadata__.store.db(),
				metadata = index.__metadata__,
				keyProperty = metadata.store.keyProperty(),
				id = object[keyProperty],
				promises = [];
			index[id] = object;
			if(object.constructor.reindexCalls) {
				object.constructor.reindexCalls.forEach((fname) => {
					let f = object[fname];
					if(!f.reindexer) {
						Object.defineProperty(object,fname,{configurable:true,writable:true,value:function() {
							let me = this;
							f.call(me,...arguments);
							index.index(me,true,db.activate).then(() => {
								stream(me,db);
							});
						}});
						object[fname].reindexer = true;
					}
				});
			}
			Index.keys(object).forEach((key) => {
				let value = object[key],
					desc = Object.getOwnPropertyDescriptor(object,key);
				function get() {
					return get.value;
				}
				if(!reIndex) {
					get.value = value;
				}
				function set(value,first) {
					let instance = this,
						cls = instance.constructor,
						index = cls.index,
						metadata = index.__metadata__,
						keyProperty = metadata.store.keyProperty(),
						db = metadata.store.db(),
						id = instance[keyProperty],
						oldvalue = get.value,
						oldtype = typeof(oldvalue),
						type = typeof(value);
					if(oldtype==="undefined" || oldvalue!=value) {
						if(type==="undefined") {
							delete get.value;
						} else {
							get.value = value;
						}
						if(type==="function") {
							value = value.call(instance);
							type = typeof(value);
						}
						//set.queue.push({value:value,type:type});
						return new Promise((resolve,reject) => {
							//let promise = (first ? Promise.resolve() : metadata.store.set(id,instance,true));
							//promise.then(() => { 
								index.get(key,true).then((node) => {
									node = index[key]; // re-assign since 1) we know it is loaded and initialized, 2) it may have been overwritten by another async
									if(!instance[keyProperty]) { // object may have been deleted by another async call!
										if(node[oldvalue] && node[oldvalue][oldtype]) {
											delete node[oldvalue][oldtype][id];
										}
										resolve(true);
										return;
									} 
									if(value && type==="object") {
										let ocls = value.constructor,
											oindex = ocls.index;
										if(!oindex) {
											db.index(ocls);
										}
										ocls.index.put(value).then(() => {
											let okey = value[keyProperty],
												otype = value.constructor.name;
											if(!node[okey]) {
												node[okey] = {};
											}
											if(!node[okey][otype]) {
												node[okey][otype] = {};
											}
											node[okey][otype][id] = true;
											let restorable = false;
											if(node[oldvalue] && node[oldvalue][oldtype]) {
												delete node[oldvalue][oldtype][id];
												restorable = true;
											}
											let promise = (first ? Promise.resolve() : metadata.store.set(id,instance,true));
											Promise.resolve().then(() => { 
												index.save(key).then(() => {
													if(!first) {
														stream(object,db);
													}
													resolve(true);
												}).catch((e) => {
													throw(e);
												});
											}).catch((e) => {
												delete node[okey][otype][id];
												if(restorable) {
													node[oldvalue][oldtype][id] = true;
												}
											});;
											
										});
									} else if(type!=="undefined") {
										if(!node[value]) {
											node[value] = {};
										}
										if(!node[value][type]) {
											node[value][type] = {};
										}
										node[value][type][id] = true;
										let restorable = false;
										if(node[oldvalue] && node[oldvalue][oldtype]) {
											delete node[oldvalue][oldtype][id];
											restorable = true;
										}
										let promise = (first ? Promise.resolve() : metadata.store.set(id,instance,true));
										Promise.resolve().then(() => { 
											index.save(key).then(() => {
												if(!first) {
													stream(object,db);
												}
												resolve(true);
											}).catch((e) => {
												throw(e);
											});
										}).catch((e) => {
											delete node[value][type][id];
											if(restorable) {
												node[oldvalue][oldtype][id] = true;
											}
										});
									}
								});
							//});
						});
					}
					//set.queue = []; not yet used
					return Promise.resolve(true);
				}
				let writable = desc && !!desc.configurable && !!desc.writable;
				if(activate && desc && writable && !desc.get && !desc.set) {
					delete desc.writable;
					delete desc.value;
					desc.get = get;
					desc.set = set;
					Object.defineProperty(object,key,desc);
				}
				if(reIndex) {
					metadata.store.set(id,object,true);
					promises.push(set.call(object,value,true));
				}
			});
			return Promise.all(promises).catch((e) => { console.log(e); });
		}
		async save(key) {
			let node = this[key],
				metadata = this.__metadata__;
			if(node) {
				try {
					return await metadata.store.set(metadata.prefix+key,node);
				} catch(e) {
					console.log(e);
				}
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
					id = value.constructor.name +  "@" + (_uuid ? _uuid.v4() : uuid.v4());
					Object.defineProperty(value,keyProperty,{enumerable:true,configurable:true,value:id});
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
						if(typeof(json[key])!=="function") {
							result[key] = me.normalize(json[key],true);
						}
					});
				}
			} else {
				result = value;
			}
			return result;
		}
		// add cache support to prevent loops
		async restore(json,recurse,cache={}) { 
			let me = this,
				type = typeof(json);
			if(json && type==="object") {
				let key = json[me.keyProperty()],
					keys = Object.keys(json),
					keymap = {};
				if(typeof(key)==="string") {
					let parts = key.split("@"),
						cls = me.__metadata__.scope[parts[0]];
					if(!cls) {
						try {
							me.__metadata__.scope[parts[0]] = cls = Function("return " + parts[0])();
						} catch(e) {
							console.log(e);
							let promises = [];
							keys.forEach((property,i) => {
								keymap[i] = property;
								promises.push(me.restore(json[property],true,cache));
							});
							return new Promise((resolve,reject) => {
								Promise.all(promises).then((results) => {
									results.forEach((data,i) => {
										json[keymap[i]] = data;
									});
									resolve(json);
								});
							});
							
						}
					}
					if(keys.length===1) {
						let object;
						try {
							object = await me.get(key);
						} catch(e) {
							console.log(e);
						}
						if(object instanceof cls) {
							return Promise.resolve(object);
						}
						if(cls.fromJSON && object) {
							return Promise.resolve(cls.fromJSON(object));
						}
						let instance = Object.create(cls.prototype);
						if(typeof(object)==="undefined") {
							instance[me.keyProperty()] = key;
							return Promise.resolve(instance);
						}
						let promises = [];
						if(object && typeof(object)==="object") {
							Object.keys(object).forEach((property,i) => {
								keymap[i] = property;
								promises.push(me.restore(object[property],true,cache));
							});
						}
						return new Promise((resolve,reject) => {
							Promise.all(promises).then((results) => {
								results.forEach((data,i) => {
									instance[keymap[i]] = data;
								});
								resolve(instance);
							});
						});
					} else if(json instanceof cls) {
							let promises = [];
							keys.forEach((property,i) => {
								keymap[i] = property;
								promises.push(me.restore(json[property],true,cache).catch((e) => { console.log(e); }));
							});
							return new Promise((resolve,reject) => {
								Promise.all(promises).then((results) => {
									results.forEach((data,i) => {
										json[keymap[i]] = data;
									});
									resolve(json);
								});
							});
					} else if(cls.fromJSON) {
							return Promise.resolve(cls.fromJSON(json));
					} else {
						let instance = Object.create(cls.prototype),
							promises = [];
						keys.forEach((property,i) => {
							keymap[i] = property;
							promises.push(me.restore(json[property],true,cache));
						});
						return new Promise((resolve,reject) => {
							Promise.all(promises).then((results) => {
								results.forEach((data,i) => {
									instance[keymap[i]] = data;
								});
								resolve(instance);
							});
						});
					}
				}
			}
			return Promise.resolve(json);
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
	class IronCacheStore extends Store {
		constructor(name,keyProperty,db,clear) {
			super(name,keyProperty,db);
			if(clear) {
				this.clear();
			}
		}
		async clear() {
			let me = this;
			return new Promise((resolve,reject) => {
				me.__metadata__.db.ironCacheClient.clearCache(me.__metadata__.name, function(err, res) {
					if (err) {
						resolve(false);
					} else {
						//console.log(res);
						resolve(true);
					}
				});
			});
		}
		async delete(key) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.__metadata__.db.ironCacheClient.del(me.__metadata__.name, key, function(err, res) {
					if (err) {
						//console.log("del ",err);
						reject(err);
					} else {
						//console.log(res);
						resolve(true);
					}
				});
			});
		}
		async get(key) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.__metadata__.db.ironCacheClient.get(me.__metadata__.name, key, function(err, res) {
					if (err) {
						resolve();
					} else {
						//console.log(res);
						me.restore(JSON.parse(res.value)).then((value) => {
							resolve(value);
						});
					}
				});
			});
		}
		async set(key,value,normalize) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.__metadata__.db.ironCacheClient.put(me.__metadata__.name, key, { value: JSON.stringify((normalize ? me.normalize(value) : value)) }, function(err, res) {
					if (err) {
						reject(err);
					} else {
						//console.log(res);
						resolve(true);
					}
				});
			});
		}
	}
	class RedisStore extends Store {
		constructor(name,keyProperty,db,clear) {
			super(name,keyProperty,db);
			if(clear) {
				this.clear();
			}
		}
		async clear() {
			let me = this;
			return new Promise((resolve,reject) => {
				me.__metadata__.db.redisClient.flushdb(function(err, res) {
					if (err) {
						//console.log("clear ",err);
						resolve(false);
					} else {
						//console.log("clear",res);
						resolve(true);
					}
				});
			});
		}
		async delete(key) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.__metadata__.db.redisClient.del(key, function(err, res) {
					if (err) {
						//console.log("del ",err);
						reject(err);
					} else {
						//console.log("del ",res);
						resolve(true);
					}
				});
			});
		}
		async get(key) {
			let me = this;
			//console.log("get ", key);
			return new Promise((resolve,reject) => {
				me.__metadata__.db.redisClient.get(key, function(err, value, key) {
					if (err) {
						//console.log("get ",key,err);
						resolve();
					} else {
						//console.log("get ",key,value);
						if(!value) {
							resolve();
						} else {
							me.restore(JSON.parse(value)).then((value) => {
								resolve(value);
							});
						}
					}
				});
			});
		}
		async set(key,value,normalize) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.__metadata__.db.redisClient.set(key, JSON.stringify((normalize ? me.normalize(value) : value)), function(err, res) {
					if (err) {
						//console.log("set ",err);
						reject(err);
					} else {
						//console.log("set",res);
						resolve(true);
					}
				});
			});
		}
	}
	class MemcachedStore extends Store {
		constructor(name,keyProperty,db,clear) {
			super(name,keyProperty,db);
			if(clear) {
				this.clear();
			}
		}
		async clear() {
			let me = this;
			return new Promise((resolve,reject) => {
				me.__metadata__.db.memcachedClient.flush(function(err, res) {
					if (err) {
						//console.log("clear ",err);
						resolve(false);
					} else {
						//console.log("clear",res);
						resolve(true);
					}
				});
			});
		}
		async delete(key) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.__metadata__.db.memcachedClient.delete(key, function(err, res) {
					if (err) {
						//console.log("del ",err);
						reject(err);
					} else {
						//console.log("del ",res);
						resolve(true);
					}
				});
			});
		}
		async get(key) {
			let me = this;
			//console.log("get ", key);
			return new Promise((resolve,reject) => {
				me.__metadata__.db.memcachedClient.get(key, function(err, value, key) {
					if (err) {
						//console.log("get ",key,err);
						resolve();
					} else {
						//console.log("get ",key,value);
						if(!value) {
							resolve();
						} else {
							me.restore(JSON.parse(value)).then((value) => {
								resolve(value);
							});
						}
					}
				});
			});
		}
		async set(key,value,normalize) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.__metadata__.db.memcachedClient.set(key, JSON.stringify((normalize ? me.normalize(value) : value)), function(err, res) {
					if (err) {
						//console.log("set ",err);
						reject(err);
					} else {
						//console.log("set",res);
						resolve(true);
					}
				});
			});
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
				this.__metadata__.storage = new LocalStorage(db.name);
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
				this.__metadata__.storage.removeItem(key+".json");
				delete this[key];
				return true;
			}
			return false;
		}
		async get(key,recursing) {
			let value = this.__metadata__.storage.getItem(key+".json");
			if(value!=null) {
				this[key] = true;
				return this.restore(JSON.parse(value));
			}
			return Promise.resolve(undefined);
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
				//window.localforage.config({name:"ReasonDB"})
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
			try {
				await this.__metadata__.storage.clear();
			} catch(e) {
				console.log(e);
			}
			Object.keys(me).forEach((key) => {
				delete me[key];
			});
			return true;
		}
		async delete(key,force) {
			let index = this;
			if(this[key] || force) {
				try {
					await index.__metadata__.storage.removeItem(key+".json");
				} catch(e) {
					console.log(e);
				}
				delete this[key];
				return true;
			}
			return false;
		}
		async get(key) {
			let value;
			try {
				value = await this.__metadata__.storage.getItem(key+".json");
			} catch(e) {
				console.log(e);
			}
			if(value!=null) {
				this[key] = true;
				try {
					return await this.restore(value);
				} catch(e) {
					console.log(e);
				}
			}
		}
		async set(key,value,normalize) {
			this[key] = true;
			try {
				await this.__metadata__.storage.setItem(key+".json",normalize ? this.normalize(value) : value);
			} catch(e) {
				console.log(e);
			}
			return true;
		}
	}
	class ReasonDB {
		constructor(name,keyProperty="@key",storageType,clear=false,activate=true,options={}) { // make the additional args part of a config object, add a config option for active or passive objects
			let db = this;
			if(typeof(storageType)==="undefined") {
				console.log("WARNING: storageType undefined, defaulting to ReasonDB.MemStore.");
				storageType=MemStore;
			}
			db.name = name;
			db.keyProperty = keyProperty;
			db.storageType = storageType;
			db.clear = clear;
			db.classes = {};
			db.activate = activate;
			Object.keys(options).forEach((key) => {
				db[key] = options[key];
			});
			
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
					Pattern.index.put(me);
				}
				toJSON() {
					let me = this,
						result = {};
					result[db.keyProperty] = me[db.keyProperty];
					result.classVars = me.classNames;
					result.when = me.when;
					return result;
				}
			}
			db.index(Array,keyProperty,storageType,clear);
			db.index(Date,keyProperty,storageType,clear);
			db.index(db.Pattern,keyProperty,storageType,clear);
			db.patterns = {};
		}
		async deleteIndex(cls) {
			if(cls.index) {
				try {
					await cls.index.clear();
				} catch(e) {
					console.log(e);
				}
				delete cls.index;;
			}
		}
		index(cls,keyProperty,storageType,clear) {
			let db = this;
			keyProperty = (keyProperty ? keyProperty : db.keyProperty);
			storageType = (storageType ? storageType : db.storageType);
			clear = (clear ? clear : db.clear);
			if(!cls.index || clear) { 
				cls.index = (db.shared && cls!==Object ? Object.index : new Index(cls,keyProperty,db,storageType,clear));
				db.classes[cls.name] = cls;
			}
			return cls.index;
		}
		delete() {
			let db = this;
			return {
				from(classVars) {
					return {
						where(pattern) {
							return {
								exec() {
									return new Promise((resolve,reject) => {
										db.select().from(classVars).where(pattern).exec().then((cursor) => {
											cursor.count().then((count) => {
												if(count>0) {
													let promises = [];
													Object.keys(cursor.classVarMap).forEach((classVar) => {
														let i = cursor.classVarMap[classVar],
															cls = classVars[classVar];
														cursor.cxproduct.collections[i].forEach((id) => {
															promises.push(cls.index.delete(id));
														});
													});
													Promise.all(promises).then((results) => {
														resolve(results);
													});
													return;
												}
												resolve([]);
											}); 
										});
									});
								}
							}
						}
					}
				}
			}
		}
		insert(object) {
			var db = this;
			return {
				into(cls) {
					return {
						exec() {
							return new Promise((resolve,reject) => {
								let instance,
									thecls = (cls ? cls : object.constructor);
								if(object instanceof cls) {
									instance = object;
								} else if(cls.fromJSON) {
									instance = cls.fromJSON(object);
								} else {
									instance = Object.create(cls.prototype);
									Object.defineProperty(instance,"constructor",{configurable:true,writable:true,value:thecls});
									Object.keys(object).forEach((key) => {
										instance[key] = object[key];
									});
								}
								if(!cls.index) {
									cls.index = db.index(cls);
								}
								cls.index.put(instance).then(() => {
									stream(instance,db);
									resolve(instance);
								});	
							});
						}
					}
				},
				exec() {
					return this.into(object.constructor).exec();
				}
			}
		}
		select(projection) {
			var db = this;
			return {
				first(count) {
					let me = this;
					me.firstCount = count;
					return {
						from(classVars) {
							return me.from(classVars);
						}
					}
				},
				random(count) {
					let me = this;
					me.randomCount = count;
					return {
						from(classVars) {
							return me.from(classVars);
						}
					}
				},
				sample(confidence,range) {
					let me = this;
					me.sampleSpec = {confidence:confidence, range:range};
					return {
						from(classVars) {
							return me.from(classVars);
						}
					}
				},
				from(classVars) {
					let select = this;
					return {
						where(pattern,restrictVar,instanceId) {
							return {
								orderBy(ordering) { // {$o: {name: "asc"}}
									let me = this;
									me.ordering = ordering;
									return {
										exec() {
											return me.exec();
										}
									}
								},
								exec(ordering) {
									return new Promise((resolve,reject) => {
										let matches = {},
											restrictright = {},
											matchvars = [],
											promises = [];
										Object.keys(pattern).forEach((classVar) => {
											if(!classVars[classVar] || !classVars[classVar].index) { 
												return;
											}
											matchvars.push(classVar);
											promises.push(classVars[classVar].index.match(pattern[classVar],classVars,matches,restrictright,classVar));
										});
										Promise.all(promises).then((results) => {
											let pass = true;
											results.every((result,i) => {
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
												Object.keys(classVars).forEach((classVar) => {
													if(matches[classVar]) {
														collections.push(matches[classVar]);
														classes.push(classVars[classVar]);
													}
												});
												function filter(row,index,cxp) {
													return row.every((item,i) => {
														if(i===0 || !restrictright[i]) {
															return true;
														}
														let prev = row[i-1];
														return !restrictright[i][prev] || restrictright[i][prev].indexOf(item)>=0;
													});
												}
												let cursor = new Cursor(classes,new CXProduct(collections,filter),projection,classVars);
												if(select.firstCount) {
													cursor.first(select.firstCount).then((rows) => {
														resolve(new Cursor(classes,rows));
													});
												} else if(select.randomCount) {
													cursor.random(select.randomCount).then((rows) => {
														resolve(new Cursor(classes,rows));
													});
												} else if(select.sampleSpec) {
													cursor.sample(select.sampleSpec.confidence,select.sampleSpec.range).then((rows) => {
														resolve(new Cursor(classes,rows));
													});
												} else {
													resolve(cursor,matches);
												}
												return null;
											}
										}).catch((e) => {
											console.log(e);
										});
									});
								}
							}
						}
					}
				}
			}
		}
		update(classVars) {
			var db = this;
			return {
				set(values) {
					return {
						where(pattern) {
							return {
								exec() {
									return new Promise((resolve,reject) => {
										let updated = {},
											promises = [];
										db.select().from(classVars).where(pattern).exec().then((cursor,matches) => {
											let vars = Object.keys(classVars);
											promises.push(cursor.forEach((row) => {
												row.forEach((object,i) => {
													let classVar = vars[i],
														activated;
													if(values[classVar])  {
														Object.keys(values[classVar]).forEach((property) => {
															let value = values[classVar][property];
															if(value && typeof(value)==="object") {
																let sourcevar = Object.keys(value)[0];
																if(classVars[sourcevar]) {
																	let j = vars.indexOf(sourcevar);
																	value = row[j][value[sourcevar]];
																}
															}
															activated = (activated===false || typeof(object[property])==="undefined" ? false : db.activate);
															if(object[property]!==value) {
																object[property] = value;
																updated[object[db.keyProperty]] = true;
															}
														});
														if(!activated) {
															promises.push(db.save(object).exec());
														}
													}
												});
											}));
										});
										Promise.all(promises).then(() => {
											resolve(Object.keys(updated).length);
										});
									});
								}
							}
						}
					}
				}
			}
		}
		when(whenPattern) {
			var db = this;
			return {
				from(classVars) {
					return {
						select(projection) {
							let pattern = new db.Pattern(projection,classVars,whenPattern);
							//	promise = new Promise((resolve,reject) => { pattern.resolver = resolve; pattern.rejector = reject; });
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
							return {
								then(f) {
									Object.defineProperty(pattern,"action",{configurable:true,writable:true,value:f});
								}
							}
						}
					}
				}
			}
		}
	}
	ReasonDB.prototype.save = ReasonDB.prototype.insert;
	ReasonDB.LocalStore = LocalStore;
	ReasonDB.MemStore = MemStore;
	ReasonDB.LocalForageStore = LocalForageStore;
	ReasonDB.IronCacheStore = IronCacheStore;
	ReasonDB.RedisStore = RedisStore;
	ReasonDB.MemcachedStore = MemcachedStore;
	if(typeof(module)!=="undefined") {
		module.exports = ReasonDB;
	}
	if(typeof(window)!=="undefined") {
		window.ReasonDB = ReasonDB;
	}
})();