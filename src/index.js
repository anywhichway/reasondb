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
		_uuid = require("node-uuid");
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
	
	Date.indexKeys = [];
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
		}
		forEach(f) {
			let cursor = this,
				promises = [],
				i = 0;
			function rows() {
				let row = cursor.get(i);
				if(row) {
					let result = f(row,i,cursor);
					if(!(result instanceof Promise)) {
						result = Promise.resolve(result);
					}
					promises.push(result);
				}
				i++;
				if(i < cursor.cxproduct.length) {
					rows();
				}
			}
			rows();
			return Promise.all(promises);
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
		count() {
			let cursor = this,
				i = 0;
			cursor.forEach((row) => {
				i++;
			});
			return i;
		}
		get(rowNumber) { // should this be async due to put below?
			let me = this;
			if(rowNumber>=0 && rowNumber<me.cxproduct.length) {
					let row = me.cxproduct.get(rowNumber);
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
						if(row) {
							row.forEach((item) => {
								if(item.constructor.index) {
									let db = item.constructor.index.__metadata__.store.db();
									item.constructor.index.index(item,false,db.activate); // activate objects right before returning
								}
							});
						}
						return row;
					}
			}
		}
		get maxCount() {
			return this.cxproduct.length;
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
							if(!fired[patternId] && cursor.count()>0) { 
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
			Object.defineProperty(this,"__metadata__",{value:{store:store,name:cls.name}});
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
					indexkeys = indexkeys.slice(0,i).concat(Object.keys(object));
				}
			} else {
				indexkeys = Object.keys(object);
			}
			return indexkeys.filter((key) => {
				return typeof(object[key])!=="function";
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
		async delete(object) {
			let index = this,
				store = index.__metadata__.store,
				keyProperty = store.__metadata__.keyProperty,
				id = object[keyProperty];
			return new Promise((resolve,reject) => {
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
					resolve(true);
				});
			});
		}
		flush(key) {
			let desc = Object.getOwnPropertyDescriptor(this,key);
			if(desc) {
				this[key] = false;
			}
		}
		get(key,init) {
			let index = this,
				value = this[key];
			if(!value) {
				if(init) {
					value = this[key] = {};
				}
				return new Promise((resolve,reject) => {
					index.__metadata__.store.get(key).then((storedvalue) => {
						if(typeof(storedvalue)!=="undefined") {
							value = this[key] = storedvalue;
						}
						resolve(value);
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
		async load() {
			let me = this;
			if(!me.__metadata__.loaded) {
				try {
					let keyvalues =  await me.__metadata__.store.load();
					keyvalues.forEach((kv) => {
						me[kv[0]] = kv[1];
					});
				} catch(e) {
					console.log(e);
				}
				me.__metadata__.loaded = true;
			}
			return me.__metadata__.loaded;
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
			let nodes = [];
			for(var i=0;i<keys.length;i++) {
				let key = keys[i];
				if(key!=="$class" && !classVars[key]) {
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
				let childnodes = [];
				nodes.forEach((node,i) => {
					if(!subobjects[i]) { return; }
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
					let promises = [];
					nodes.forEach((node,i) => { // db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
						let join = joins[i];
						if(!join) { return true; }
						promises.push(join.rightIndex.get(join.rightProperty));
					});
					Promise.all(promises).then((rightnodes) => { // variable not used, promises just ensure nodes loaded for matching
						if(!results[classVar]) {
							results[classVar] = Object.keys(index).filter((item) => { return item.indexOf("@")>0; });
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
								results[join.rightVar] = Object.keys(join.rightIndex).filter((item) => { return item.indexOf("@")>0; });
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
										//results[join.rightVar] = (results[join.rightVar] ? intersection(results[join.rightVar],innerrightids) : innerrightids);
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
				id = object[keyProperty] = object.constructor.name +  "@" + (_uuid ? _uuid.v4() : uuid.v4());
			}
			if(index[id]!==object) {
				index[id] = object;
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
				store = index.__metadata__.store,
				keyProperty = store.keyProperty(),
				db = store.db(),
				id = object[keyProperty],
				cls = object.constructor,
				promises = [];
			if(object.constructor.reindexCalls) {
				object.constructor.reindexCalls.forEach((fname) => {
					let f = object[fname];
					if(!f.reindexer) {
						object[fname] = function() {
							let me = this;
							f.call(me,...arguments);
							index.index(me,true,db.activate).then(() => {
								stream(me,db);
							});
						}
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
						ikey = instance[keyProperty],
						oldvalue = get.value,
						oldtype = typeof(oldvalue),
						type = typeof(value);
					if(oldtype==="undefined" || oldvalue!=value) {
						if(type==="undefined") {
							delete get.value;
						} else {
							get.value = value;
						}
						return new Promise((resolve,reject) => {
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
									if(!value[keyProperty]) {
										value[keyProperty] = value.constructor.name +  "@" + (_uuid ? _uuid.v4() : uuid.v4());
									}
									if(!node[value[keyProperty]]) {
										node[value[keyProperty]] = {};
									}
									let idvalue = value[keyProperty];
									if(!node[idvalue][type]) {
										node[idvalue][type] = {};
									}
									node[idvalue][type][id] = true;
									let promise = (first ? Promise.resolve() : index.__metadata__.store.set(instance[keyProperty],instance,true));
									promise.then(() => { 
										index.put(value).then(() => {
											index.save(key).then(() => {
												if(!first) { // first handled by insert
													index.__metadata__.store.set(instance[keyProperty],instance,true)
													stream(object,db);
												}
												resolve(true);
											});
										});
										return null;
									}).catch((e) => {
										delete node[idvalue][type][id];
									});
								} else if(type!=="undefined") {
									if(!node[value]) {
										node[value] = {};
									}
									if(!node[value][type]) {
										node[value][type] = {};
									}
									node[value][type][id] = true;
									let promise = (first ? Promise.resolve() : index.__metadata__.store.set(instance[keyProperty],instance,true));
									promise.then(() => { 
										index.save(key).then(() => {
											if(!first) { // first handled by insert
												index.__metadata__.store.set(instance[keyProperty],instance,true)
												stream(object,db);
											}
											resolve(true);
										});
										return null;
									}).catch((e) => {
										delete node[idvalue][type][id];
									});
								}
							});
						});
					}
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
					index.__metadata__.store.set(object[keyProperty],object,true);
					promises.push(set.call(object,value,true));
				}
			});
			return Promise.all(promises).catch((e) => { console.log(e); });
		}
		async save(key) {
			let node = this[key];
			if(node) {
				try {
					return await this.__metadata__.store.set(key,node);
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
					value[keyProperty] = id = value.constructor.name +  "@" + (_uuid ? _uuid.v4() : uuid.v4());
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
		// add cache support to prevent loops
		async restore(json,recurse,cache={}) { 
			let me = this,
				type = typeof(json);
			if(json && type==="object") {
				let key = json[me.keyProperty()],
					keys = Object.keys(json),
					keymap = {},
					promises = [];
				if(typeof(key)==="string") {
					let parts = key.split("@"),
						cls = me.__metadata__.scope[parts[0]];
					if(!cls) {
						try {
							me.__metadata__.scope[parts[0]] = cls = Function("return " + parts[0])();
						} catch(e) {
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
						if(cls.fromJSON) {
							return Promise.resolve(cls.fromJSON(object));
						}
						let instance = Object.create(cls.prototype);
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
					} else if(cls.fromJSON) {
							return Promise.resolve(cls.fromJSON(json));
					} else {
						let instance = Object.create(cls.prototype);
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
		async load() {
			let me = this,
				keyvalues = [];
			Object.keys(me).forEach((key) => {
				let value = false;
				if(key.indexOf("@")===-1) {
					value = me[key];
				}
				keyvalues.push([key,value]);
			});
			return keyvalues;
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
				this.__metadata__.storage = new LocalStorage(db.name + "/" + name);
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
		async get(key) {
			let value = this.__metadata__.storage.getItem(key+".json");
			if(value!=null) {
				this[key] = true;
				try {
					return await this.restore(JSON.parse(value));
				} catch(e) {
					console.log(e);
				}
			}
		}
		async load(force) {
			let me = this,
				storage = this.__metadata__.storage,
				promises = [];
			for(var i=0;i<storage.length;i++) {
				let key = storage.key(i).replace(".json",""),
					value = false;
				if((force || !me[key]) && key.indexOf("@")===-1) {
					try {
						value = await me.get(key);
					} catch(e) {
						console.log(e);
					}
				}
				me[key] = true;
				promises.push(Promise.resolve([key,value]));
			}
			return Promise.all(promises);
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
		async load(force) {
			let me = this,
				storage = this.__metadata__.storage,
				promises = [];
			for(var i=0;i<storage.length;i++) {
				let key = storage.key(i).replace(".json",""),
					value = false;
				if((force || !me[key]) && key.indexOf("@")===-1) {
					try {
						value = await me.get(key);
					} catch(e) {
						console.log(e);
					}
				}
				me[key] = true;
				promises.push(Promise.resolve([key,value]));
			}
			return Promise.all(promises);
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
		constructor(name,keyProperty="@key",storageType=MemStore,shared=true,clear=false,activate=true) { // make the additional args part of a config object, add a config option for active or passive objects
			let db = this;
			db.name = name;
			db.keyProperty = keyProperty;
			db.storageType = storageType;
			db.clear = clear;
			db.shared = shared;
			db.classes = {};
			db.activate = activate;
			
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
					result.projection = me.projection;
					result.classVars = me.classNames;
					result.when = me.when;
					result.then = me.then+"";
					return result;
				}
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
			}*/
			if(shared) {
				Array.index = Object.index;
				db.Array = Array;
				Date.index = Object.index;
				db.Date = Date;
				db.Pattern.index = Object.index;
			} else {
				delete Array.index;
				delete Date.index;
				delete db.Pattern.index;
				db.index(Array,keyProperty,storageType,clear);
				db.index(Date,keyProperty,storageType,clear);
				db.index(db.Pattern,keyProperty,storageType,clear);
			}
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
			if(!cls.index) { 
				cls.index = (db.shared && cls!==Object ? Object.index : new Index(cls,keyProperty,db,storageType,clear));
				db.classes[cls.name] = cls;
			}
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
											let cnt = 0;
											if(cursor.count()>0) {
												Object.keys(cursor.classVarMap).forEach((classVar) => {
													let i = cursor.classVarMap[classVar],
														cls = classVars[classVar];
													cursor.cxproduct.collections[i].forEach((object) => {
														cls.index.delete(object);
														cnt++;
													})
												});
											}
											resolve(cnt);
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
						as(ascls) {
							let me = this;
							return {
								exec() {
									return me.exec(ascls);
								}
							}
						},
						exec(ascls) {
							return new Promise((resolve,reject) => {
								let instance,
									thecls = (ascls ? ascls : object.constructor);
								if(object instanceof thecls) {
									instance = object;
								} else if(thecls.fromJSON) {
									instance = thecls.fromJSON(object);
								} else {
									instance = Object.create(thecls.prototype);
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
					return this.into(object.constructor).exec(object.constructor);
				}
			}
		}
		select(projection) {
			var db = this;
			return {
				sample(confidence,range) {
					let me = this;
					return {
						from(classVars) {
							return me.from(classVars,confidence,range);
						}
					}
				},
				from(classVars,confidence,range) {
					return {
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
								exec(ordering) {
									return new Promise((resolve,reject) => {
										let matches = {},
											restrictright = {},
											matchvars = [],
											promises = [];
										Object.keys(pattern).forEach((classVar) => {
											let restrictions;
											if(!classVars[classVar] || !classVars[classVar].index) { 
												return;
											}
											matchvars.push(classVar);
											if(classVar===restrictVar) {
												restrictions = [instanceId];
											}
											promises.push(classVars[classVar].index.match(pattern[classVar],restrictions,classVars,matches,restrictright,classVar));
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
												Object.keys(matches).forEach((classVar) => {
													vars.push(classVar);
													if(classVars[classVar] && matches[classVar]) {
														promises.push(classVars[classVar].index.instances(matches[classVar],classVars[classVar]));
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
													// if confidence and range are used, we will have to generate a more resolved cursor
													resolve(new Cursor(classes,new CXProduct(collections,filter),projection,classVarMap),matches);
												});
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
									pattern.action = f;
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
	if(typeof(module)!=="undefined") {
		module.exports = ReasonDB;
	}
	if(typeof(window)!=="undefined") {
		window.ReasonDB = ReasonDB;
	}
})();