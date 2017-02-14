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
		_uuid = r("uuid");
	}
	 
	Object.defineProperty(Array.prototype,"fastForEach",{value: function(f) {
		const len = this.length;
		if(f.length===1) {
			for(let i in this) { i < len && f(this[i]); }
		} else {
			for(let i=0;i<len;i++) { f(this[i],i,this); }
		}
	}});
	
	const removePunctuation = (str) => {
		str.replace(/\.\s|;\s|\,\s|\!\s|\:\s/," ");
		if([";",",",".","!",":"].indexOf(str[str.length-1])>=0) {
			return str.substring(0,str.length-1);
		}
		return str;
	}
	
	const continueTokens = (tokens,stopTokens) => {
		const continuable = [];
		for(let i=0;i<tokens.length;i++) {
			let str = tokens[i];
			if(stopTokens.indexOf(str)===-1) {
				continuable.push(str.replace(/[aeiou<>"'\{\}\[\]\(\)]/g,"").toLowerCase()); // \-\=\+\*\~
			}
		}
		return continuable;
	}
	const trigrams = (tokens) => {
		const grams = [],
			str = tokens.join("");
		for(let i=0;i<str.length-2;i++) {
			grams.push(str.substring(i,i+3));
		}
		return grams;
	}
	
	const asynchronize = async (value) => {
		if(value instanceof Promise) {
			return value;
		}
		return Promise.resolve(value);
	}
	
	class Activity {
		constructor(abort=(()=>{})) {
			const me = this;
			me.steps = [];
			me.abort = (result) => { me.aborted=true; abort(result); };
			me.reset();
		}
		exec(i=0,value) {
			if(this.aborted) { return; }
			const me = this,
				step = me.steps[i],
				steps = (Array.isArray(step) ? step : (step ? [step] : []));
			steps.every((step) => {
				if(!step) {
					console.log("WARNING: undefined Activity step");
					return;
				}
				if(step instanceof Promise || (step.constructor.name==="Promise" && typeof(step.then)==="function")) {
					step.then((result) => {
						return me.complete(i,result);
					});
					return false;
				} else {
					let result = step(value,me.abort);
					if(result instanceof Promise || (result && result.constructor.name==="Promise" && typeof(result.then)==="function")) {
						result.then((result) => {
							return me.complete(i,result);
						});
						return false;
					}
					me.complete(i,result);
					return true;
				}
			});
			return me.promise;
		}
		reset() {
			const me = this;
			me.aborted = false;
			me.results = [];
			me.promise = new Promise((resolve,reject) => {
				me.resolve = resolve;
				me.reject = reject;
			});
		}
		step(f) {
			if(f) {
				this.steps.push(f);
			}
			return this;
		}
		complete(i,result) {
			const me = this;
			if(i<me.steps.length-1) {
				if(typeof(result)!=="undefined") {
					me.results[i] = result;
				}
				me.exec(i+1,result)
			} else {
				me.resolve(me.results);
			}
		}
	}

	Array.indexKeys = ["length","$max","$min","$avg","*"];
	Array.reindexCalls = ["push","pop","splice","reverse","fill","shift","unshift"];
	Array.fromJSON = function(json) {
		const array = [];
		Object.keys(json).fastForEach((key) => {
			array[key] = json[key];
		});
		return array;
	}
	Object.defineProperty(Array.prototype,"$max",{enumerable:false,configurable:true,
		get:function() { let result; this.fastForEach((value) => { result = (result!=null ? (value > result ? value : result) : value); }); return result;},
		set:function() { }
	});
	Object.defineProperty(Array.prototype,"$min",{enumerable:false,configurable:true,
		get:function() { let result; this.fastForEach((value) => { result = (result!=null ? (value < result ? value : result) : value); }); return result;},
		set:function() { }
	});
	Object.defineProperty(Array.prototype,"$avg",{enumerable:false,configurable:true,
		get:function() { 
			let result = 0, count = 0; 
			this.fastForEach((value) => {
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
		const dt = new Date(json.time);
		Object.keys(json).fastForEach((key) => {
			if(key!=="time") {
				dt[key] = json[key];
			}
		});
		return dt;
	}
	Object.getOwnPropertyNames(Date.prototype).fastForEach((key) => {
		if(key.indexOf("get")===0) {
			const name = (key.indexOf("UTC")>=0 ? key.slice(3) : key.charAt(3).toLowerCase() + key.slice(4)),
				setkey = "set" + key.slice(3),
				get = function() { return this[key](); },
				set = function(value) { if(Date.prototype[setKey]) { Date.prototype[setKey].call(this,value); } return true; }
			Object.defineProperty(Date.prototype,name,{enumerable:false,configurable:true,get:get,set:set});
			Date.indexKeys.push(name);
			if(Date.prototype[setkey]) {
				Date.reindexCalls.push(setkey);
			}
		}
	});
	
	function intersector(objects) {
		return function intersection() {
			var min = Infinity, // length of shortest array argument
				shrtst = 0, // index of shortest array argument
				set = (objects ? new Set() : {}),
				rslt = [], // result
				mxj = arguments.length-1;
			for(var j=0;j<=mxj;j++) { // find index of shortest array argument
				var l = arguments[j].length;
				if(l<min) {
					shrtst = j;
					min = l;
				}
			}
			var shrt = arguments[shrtst],
				mxi = shrt.length;
			for(var i=0;i<mxi;i++) { // initialize set of possible values from shortest array
				if(objects) { set.add(shrt[i]) } else { set[shrt[i]]=1 };
			}
			for(var j=0;j<=mxj;j++) { // loop through all array arguments
				var	array = arguments[j],
					mxk = array.length;
				for(var k=0;k<mxk;k++) { // loop through all values
					var item = array[k];
					if((objects && set.has(item)) || set[item]) { // if value is possible
						if(j===mxj) { // and all arrays have it (or we would not be at this point)
							rslt.push(item); // add to results
						}
					}
				}
			}
			return rslt;
		}
	}
	var intersection = intersector();
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
		const response = 50, pcn = probCriticalNormal(confidence / 100.0),
	     d1 = pcn * pcn * response * (100.0 - response),
	     d2 = (population - 1.0) * (margin * margin) + d1;
	    if (d2 > 0.0)
	     return Math.ceil(population * d1 / d2);
	    return 0.0;
	}
	
	function CXProduct(collections,filter) {
		this.collections = (collections ? collections : []);
		this.filter = filter;
		Object.defineProperty(this,"length",{set:function() {},get:function() { if(this.collections.length===0){ return 0; } if(this.start!==undefined && this.end!==undefined) { return this.end - this.start; }; var size = 1; this.collections.fastForEach((collection) => { size *= collection.length; }); return size; }});
		Object.defineProperty(this,"size",{set:function() {},get:function() { return this.length; }});
	}
	// there is probably an alogorithm that never returns null if index is in range and takes into account the restrict right
	CXProduct.prototype.get = function(index){
		const me = this, c = [];
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
		constructor(classes,cxProductOrRows,projection,classVars={},defered) { // v0.3.0
			const me = this;
			me.classes = classes;
			if(Array.isArray(cxProductOrRows)) {
				me.rows = cxProductOrRows;
			} else {
				me.cxproduct = cxProductOrRows;
			}
			me.projection = projection;
			me.classVarMap = {};
			me.classVars = classVars;
			me.defered = defered; // v0.3.0
			Object.keys(classVars).fastForEach((classVar,i) => {
				me.classVarMap[classVar] = i;
			});
		}
		async first(count) {
			return this.page(1,count);
		}
		async page(num,size) {
			const cursor = this,
				start = (num-1) * size,
				promises = [];
			if(start>=cursor.maxCount) {
				return [];
			}
			for(let i=0;i<cursor.maxCount;i++) {
				promises.push(cursor.get(i));
			}
			return Promise.all(promises).then((results) => {
				const rows = [];
				for(let i=start, j=0;i<results.length && j<size;i++) {
					let row = results[i];
					if(row) {
						rows.push(row);
						j++;
					}
				}
				return rows;
			});
		}
		async forEach(f) {
			const cursor = this;
			//return new Promise((resolve,reject) => {
				const promises = [],
					results = [];
				let i = 0;
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
				return Promise.all(promises).then((rows) => {
					return results; //resolve(results);
				});
				//resolve(promises);
			//});
		}
		async every(f) {
			const cursor = this;
			let	result = true;
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
			const cursor = this,
				done = {},
				results = [];
			let	maxcount = cursor.maxCount,	
				resolver,
				rejector;
			const promise = new Promise((resolve,reject) => { resolver = resolve; rejector = reject; }),
				select = () => {
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
			const cursor = this,
				done = {},
				results = [];
			let	resolver,
				rejector;
			const promise = new Promise((resolve,reject) => { resolver = resolve; rejector = reject; });
			cursor.count().then((population) => {
				const count = samplesize(confidence, margin,population),
					select = () => {
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
			const cursor = this;
			let result = false;
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
			const cursor = this;
			let i = 0;
			//return new Promise((resolve,reject) => {
				return cursor.forEach((row) => {
					i++;
				}).then(() => {
					return i; //resolve(i);
				});
			//});
		}
		async get(rowNumber) {
			const me = this;
			if(me.rows) {
				if(rowNumber<me.maxCount) {
					const instances = me.rows[rowNumber]; //v0.3.0
					let result;
					if(me.defered && !me.defered(instances)) {
						return result;
					}
					if(me.projection) {
						result = {};
						if(!Object.keys(me.projection).every((property) => {
							let colspec = me.projection[property];
							if(colspec && typeof(colspec)==="object") {
								let classVar = Object.keys(colspec)[0],
									key = colspec[classVar],
									col = me.classVarMap[classVar];
								if(instances[col]) {
									result[property] = instances[col][key];
									return true;
								}
							}
						})) {
							return undefined;
						}
					} else {
						result = instances;
					}
					return result;
				}
				return undefined; // should we throw an error?
			}
			//return new Promise((resolve,reject) => {
				const promises = [],
					vars = Object.keys(me.classVars);
				if(rowNumber>=0 && rowNumber<me.cxproduct.length) {
					const row = me.cxproduct.get(rowNumber);
					if(row) {
						row.fastForEach((id,col) => {
							let classVar = vars[col],
							cls = me.classVars[classVar];
							promises.push(cls.index.get(row[col]));
						});
						return Promise.all(promises).then((instances) => {
							let result;
							if(me.defered && !me.defered(instances)) {
								return; //resolve();
							}
							if(me.projection) {
								result = {};
								if(!Object.keys(me.projection).every((property) => {
									let colspec = me.projection[property];
									if(colspec && typeof(colspec)==="object") {
										let classVar = Object.keys(colspec)[0],
											key = colspec[classVar],
											col = me.classVarMap[classVar];
										if(instances[col]) {
											result[property] = instances[col][key];
											return true;
										}
									}
								})) {
									return; //resolve();
								}
							} else {
								result = [];
								if(!instances.every((instance) => {
									if(instance) {
										result.push(instance);
										return true;
									}
								})) {
									return; //resolve();
								}
							}
							return result; //resolve(result);
						});
					} else {
						return; //resolve();;
					}
				} else {
					return; //resolve();
				}
			//});	
		}
		get maxCount() {
			return (this.rows ? this.rows.length : this.cxproduct.length);
		}
	}
	function stream(object,db) {
		const fired = {},
			cls = object.constructor;
		Index.keys(object).fastForEach((key) => {
			if(db.patterns[cls.name] && db.patterns[cls.name][key]) {
				Object.keys(db.patterns[cls.name][key]).fastForEach((patternId) => {
					if(fired[patternId]) { return; }
					Object.keys(db.patterns[cls.name][key][patternId]).fastForEach((classVar) => {
						const pattern = db.patterns[cls.name][key][patternId][classVar],
							when = {};
						let projection;
						if(!pattern.action) { return; }
						if(pattern.projection) {
							projection = {};
							Object.keys(pattern.projection).fastForEach((key) => {
								if(key!==db.keyProperty) {
									projection[key] = pattern.projection[key];
								}
							});
						}
						Object.keys(pattern.when).fastForEach((key) => {
							if(key!==db.keyProperty) {
								when[key] = {};
								Object.keys(pattern.when[key]).fastForEach((wkey) => {
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
			const me = this;
			cls.index = me;
			me.cls = cls; // v0.3.0
			me.saveAsync = db.saveIndexAsync;
			me.keys = {};
			me.store = new StorageType(cls.name,keyProperty,db,clear);
			me.store.scope[cls.name] = cls;
			me.name = cls.name;
			me.pending = {};
		}
		static coerce(value,type) {
			const conversions = {
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
				if(object.constructor.skipKeys && object.constructor.skipKeys.indexOf(key)>=0) {
					return false;
				}
				if(object.constructor.deferKeys && object.constructor.deferKeys.indexOf(key)>=0) {
					return false;
				}
				return key!=="*";
			});
		}
		isInstanceKey(key) {
			if(key.indexOf(this.name+"@")===0) {
				return true;
			}
		}
		async clear() {
			const index = this,
				promises = [];
			Object.keys(index).fastForEach((key) => {
				promises.push(index.delete(key));
			});
			//return new Promise((resolve,reject) => {
				return Promise.all(promises).then(() => { return; });
			//});
		}
		async delete(id) {
			const index = this,
				store = index.store,
				keyProperty = store.keyProperty,
				pending = index.pending[id];
			function doit() {
				 return new Promise((resolve,reject) => {
					index.get(id,(object) => { 
						const promises = [];
						promises.push(store.delete(id,true).catch((e) => { console.log(e); }));
						if(object) {
							Index.keys(object).fastForEach((key) => {
								promises.push(new Promise((resolve,reject) => {
									index.get(key,(node) => {
										if(!node) { 
											resolve();
											return;
										}
										const value = object[key],
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
											index.save(key,()=>{ resolve(true); }).catch((e) => { console.log(e); });;
										} else if(type!=="undefined") {
											if(!node[value] || !node[value][type] || !node[value][type][id]) {
												resolve();
												return;
											}
											delete node[value][type][id];
											index.save(key).then(()=>{ resolve(true); }).catch((e) => { console.log(e); });
										}
									});
								}).catch((e) => { console.log(e); }));
							});
						}
						Promise.all(promises).then(() => {
							if(object) {
								delete object[keyProperty];
							}
							delete index.keys[id];
							resolve();
						}).catch((e) => {
							console.log(e);
						});
					}).catch((e) => {
						console.log(e);
					});
				});
			}
			if(pending) {
				//return new Promise((resolve,reject) => {
					return pending.then((result) => {
						if(typeof(result)!=="undefined") {
							let pending = doit();
							index.pending[id] = pending;
							return pending.then(() => {
								//console.log("deleted")
								return true; //resolve(true);
							});
						}
					});
				//});
			} else {
				const pending = index.pending[id] = doit();
				//return new Promise((resolve,reject) => {
					return pending.then((result) => {
						delete index.pending[id];
						return true; //resolve(true);
					});
				//});
			}
		}
		flush(key) {
			const index = this,
				indexkey = (this.isInstanceKey(key) ? key : index.name + "." + key),
				desc = Object.getOwnPropertyDescriptor(index.keys,indexkey);
			if(desc) {
				//index.keys[key] = false;
				//index.keys[indexkey] = false;
				delete index.keys[indexkey];
			}
		}
		async get(key,f,init) {
			const index = this,
				indexkey = (this.isInstanceKey(key) ? key : index.name + "." + key);
			let	promise = index.pending[key],
				value = index.keys[indexkey];
			if(promise) {
				return promise;
			}
			if(!value) {
				if(init) {
					value = index.keys[indexkey] = {};
				}
				let resolver,
					rejector;
				promise = index.pending[key] = new Promise((resolve,reject) => { resolver = resolve; rejector = reject; });
				let activity = new Activity(resolver)
					.step(() => index.store.get(indexkey))
					.step((storedvalue,abort) => {
						delete index.pending[key];
						let type = typeof(storedvalue);
						if(type==="undefined") {
							if(init) {
								value = index.keys[indexkey] = {};
							}
						} else {
							value = index.keys[indexkey] = storedvalue;
							if(type==="object" && index.isInstanceKey(key)) {
								return index.index(value,false,index.store.db.activate);
							}
						}
						return value;
					})
					.step(f)
					.step(resolver)
					.exec();
				return promise;
			}
			if(f) {
				f(value);
			}
			return Promise.resolve(value);
		}
		async index(object,reIndex,activate) {
			const index = this,
				store = index.store,
				cls = object.constructor,
				id = object[store.keyProperty];
			let	resolver,
				rejector;
			const promise = new Promise((resolve,reject) => { resolver = resolve; rejector = reject; });
			index.keys[id] = object;
			if(object.constructor.reindexCalls) {
				object.constructor.reindexCalls.fastForEach((fname) => {
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
			const indexed = (reIndex ? store.set(id,object,true) : Promise.resolve());
			indexed.then(() => {
				let activity = new Activity(resolver);
				Index.keys(object).fastForEach((key) => {
					let value = object[key],
						desc = Object.getOwnPropertyDescriptor(object,key);
					function get() {
						return get.value;
					}
					if(!reIndex) {
						get.value = value;
					}
					function set(value,first) {
						const instance = this,
							cls = instance.constructor,
							index = cls.index,
							store = index.store,
							indexkey = cls.name + "." + key,
							keyProperty = store.keyProperty,
							db = store.db,
							id = instance[keyProperty],
							oldvalue = get.value,
							oldtype = typeof(oldvalue);
						let	type = typeof(value);
						if(type==="undefined" && key[0]==="$") {
							return Promise.resolve(); // ignore set for undefined on pseudo predicate
						}
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
							return new Promise((resolve,reject) => {
									if(cls.fullTextKeys && cls.fullTextKeys.indexOf(key)>=0) {
										const oldtokens = (oldtype==="string" ? continueTokens(removePunctuation(oldvalue).split(" "),ReasonDB.stopWords) : []),
											newtokens = continueTokens(removePunctuation(value).split(" "),ReasonDB.stopWords);
										if(oldtokens.length>0 || newtokens.length>0) {
											index.get("$tokens",(node) => {
												const indexkey = cls.name + "." + "$tokens";
												node = (index.keys[indexkey] || (index.keys[indexkey]={}));
												oldtokens.fastForEach((token) => {
													if(node[token]) {
														delete node[token][id];
													}
												});
												newtokens.fastForEach((token) => {
													if(token.length>0) {
														node[token] || (node[token]={});
														node[token][id] || (node[token][id]=0);
														node[token][id]++;
													}
												});
												index.save("$tokens").then(() => {
													resolve(true);
												});
											});
										} else {
											resolve(true);
										}
									}
								
									index.get(key,(node) => {
										node = index.keys[indexkey]; // re-assign since 1) we know it is loaded and initialized, 2) it may have been overwritten by another async
										if(!instance[keyProperty]) { // object may have been deleted by another async call!
											if(node[oldvalue] && node[oldvalue][oldtype]) {
												delete node[oldvalue][oldtype][id];
											}
											resolve(true);
											return;
										} 
										if(value && type==="object") {
											const ocls = value.constructor;
											if(!ocls.index) {
												db.index(ocls);
											}
											ocls.index.put(value).then(() => {
												const okey = value[keyProperty],
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
												const promise = (first ? Promise.resolve() : store.set(id,instance,true));
												promise.then(() => { 
													index.save(key,() => { 
														resolve(true);
														if(!first) {
															stream(object,db);
														}
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
											if(node[oldvalue] && node[oldvalue][oldtype] && node[oldvalue][oldtype][id]) {
												delete node[oldvalue][oldtype][id];
												restorable = true;
											}
											const promise = (first ? Promise.resolve() : store.set(id,instance,true));
											promise.then(() => { 
												index.keys[key] = node;
												index.save(key,() => {
													resolve(true);
													//console.log(first,node,key,value,type)
													if(!first) {
														stream(object,db);
														//console.log(node,key,value,type)
													}
												}).catch((e) => {
													console.log(e);
												});
											}).catch((e) => {
												delete node[value][type][id];
												if(restorable) {
													node[oldvalue][oldtype][id] = true;
												}
											});
										}
									},true);
							});
						} else {
							return Promise.resolve(true);
						}
					}
					const writable = desc && !!desc.configurable && !!desc.writable;
					if(activate && desc && writable && !desc.get && !desc.set) {
						delete desc.writable;
						delete desc.value;
						desc.get = get;
						desc.set = set;
						Object.defineProperty(object,key,desc);
					}
					if(reIndex) {
						activity.step(() => set.call(object,value,true) );
					}
				});
				activity.step(() => resolver(object)).exec();
			});
			return promise;
		}
		async instances(keyArray,cls) {
			const index = this,
				results = [];
			for(let i=0;i<keyArray.length;i++) {
				try {
					await index.get(keyArray[i],(instance) => {
						if(!cls || instance instanceof cls) {
							results.push(instance);
						} 
					});
				} catch(e) {
					console.log(e);
				}
			}
			return results;
		}
		async match(pattern,classVars={},classMatches={},restrictRight={},classVar="$self",parentKey,nestedClass) {
			const me = this,
				keys = Object.keys(pattern).filter((key) => { return key!="$class" && (!me.cls.deferKeys || me.cls.deferKeys.indexOf(key)===-1); }),
				literals = {},
				tests = {},
				nestedobjects = {},
				joinvars = {},
				joins = {},
				cols = {},
				nodes = [];
			//console.log(keys)
			let results = classMatches,
				currentclass = (pattern.$class ? pattern.$class : (nestedClass ? nestedClass : (classVars[classVar] ? classVars[classVar] : Object)));
			if(typeof(currentclass)==="string") {
				try {
					currentclass = new Function("return " + currentclass)();
				} catch(e) {
					return Promise.resolve([]);
				}
			}
			let	index = currentclass.index,
				keyProperty = currentclass.name + "." + index.store.keyProperty;
			Object.keys(classVars).fastForEach((classVar,i) => {
				cols[classVar] = i;
				if(!results[classVar]) { results[classVar] = null; }
				if(!restrictRight[i]) { restrictRight[i] = {}; };
			});
			for(let i=0;i<keys.length;i++) {
				const key = keys[i];
				if(!classVars[key]) {
					try {
						nodes.push(await index.get(key));
					} catch(e) {
						console.log(e);
					}
				}
			}
			//return new Promise((resolve,reject) => { // db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
				nodes.every((node,i) => {
					const key = keys[i],
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
					Object.keys(value).fastForEach((key) => {
						if(classVars[key]) {
							const rightClass = (nestedClass ? nestedClass : classVars[key]),
								rightKeyProperty = rightClass.index.store.keyProperty,
								rightProperty = value[key];
							joins[i] = {rightVar:key, rightClass, rightKeyProperty, rightProperty, test:Index.$eeq};
							return;
						}
						if(key[0]==="$") {
							const testvalue = value[key],
								test = Index[key];
							if(typeof(test)==="function") {
								if(testvalue && typeof(testvalue)==="object") {
									const second = Object.keys(testvalue)[0];
									if(classVars[second]) {
										const rightClass= (nestedClass ? nestedClass : classVars[second]),
											rightKeyProperty = rightClass.index.store.keyProperty,
											rightProperty = testvalue[second];
										return joins[i] = {rightVar:second, rightClass, rightKeyProperty, rightProperty, test};
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
				if(results[classVar] && results[classVar].length===0) { return []; } //resolve([]); return
				let exclude = [];
				nodes.every((node,i) => {
					if(!literals[i]) { return true; }
					const key = keys[i],
						value = pattern[key],
						type = typeof(value);
					if(type==="undefined") {
						Object.keys(node).fastForEach((testValue) => {
							Object.keys(node[testValue]).fastForEach((testType) => {
								const ids = Object.keys(node[testValue][testType]);
								if(ids.length===0) {
									delete node[testValue][testType];
								} else {
									exclude = exclude.concat(ids);
								}
							});
						});
						return true;
					}
					if(!node[value] || !node[value][type]) { 
						results[classVar] = []; 
						return false;
					}
					const ids = Object.keys(node[value][type]).filter((id) => { 
						return !currentclass || id.indexOf(currentclass.name+"@")===0; 
					});
					results[classVar] = (results[classVar] ? intersection(results[classVar],ids) : ids);
					return results[classVar].length > 0;
				});
				if(results[classVar] && results[classVar].length===0) { return [];  } //resolve([]); return;
				nodes.every((node,i) => {
					if(!tests[i]) { return true; }
					const key = keys[i],
						predicate = pattern[key],
						testname = Object.keys(predicate)[0],
						value = predicate[testname],
						type = typeof(value),
						test = Index[testname];
					let	ids = [];
					if(type==="undefined" && (testname==="$eq" || testname==="$eeq")) {
						Object.keys(node).fastForEach((testValue) => {
							Object.keys(node[testValue]).fastForEach((testType) => {
								const tempids = Object.keys(node[testValue][testType]);
								if(tempids.length===0) {
									delete node[testValue][testType];
								} else {
									exclude = exclude.concat(tempids);
								}
							});
						});
						return true;
					}
					if(testname==="$search") {
						if(currentclass.fullTextKeys && currentclass.fullTextKeys.indexOf(key)>=0) {
							const tokens = continueTokens(removePunctuation(value).split(" "),ReasonDB.stopWords);
							if(tokens.length>0) {
								let matchids;
								tokens.fastForEach((token) => {
									const index = currentclass.index,
										indexkey = currentclass.name + "." + "$tokens";
									if(index.keys[indexkey][token]) {
										const tempids = Object.keys(index.keys[indexkey][token]);
										if(tempids.length===0) {
											delete index.keys[indexkey][token];
										} else {
											matchids = (matchids ? intersection(matchids,tempids) : tempids); 
										}
									}
								});
								if(matchids) {
									results[classVar] = (results[classVar] ? intersection(results[classVar],matchids) :  matchids);
									return results[classVar].length > 0;
								}
							}
						}
						return false;
					} else {
						Object.keys(node).fastForEach((testValue) => {
							Object.keys(node[testValue]).fastForEach((testType) => {
								if(test(Index.coerce(testValue,testType),value)) {
									const tmpids = Object.keys(node[testValue][testType]);
									if(tmpids.length===0) {
										delete node[testValue][testType];
									} else {
										ids = ids.concat(tmpids);
									}
								}
							});
						});
						ids = ids.filter((id) => { return !currentclass || id.indexOf(currentclass.name+"@")===0; });
						results[classVar] = (results[classVar] ? intersection(results[classVar],ids) :  intersection(ids,ids));
						return results[classVar].length > 0;
					}
				});
				if(results[classVar] && results[classVar].length===0) { return [];  } // resolve([]); return;
				const promises = [],
					childnodes = [],
					nestedtypes = [];
				nodes.fastForEach((node,i) => {
					if(!nestedobjects[i]) { return; }
					const key = keys[i],
						nestedobject = pattern[key];
					Object.keys(node).fastForEach((key) => {
						if(key.indexOf("@")>0) {
							const parts = key.split("@"),
								clsname = parts[0];
							if(!nestedtypes[clsname]) {
								nestedtypes[clsname] = [];
							}
							childnodes.push(node);
							nestedtypes.push(new Function("return " + clsname)());
						}
					});
					nestedtypes.fastForEach((nestedtype) => {
						promises.push(nestedtype.index.match(nestedobject,classVars,classMatches,restrictRight,classVar + "$" + nestedtype.name,key,nestedtype));
					});
				});
				return Promise.all(promises).then((childidsets) => {
					childidsets.every((childids,i) => {
						const node = childnodes[i],
							nestedtype = nestedtypes[i];
						let ids = [];
						childids.fastForEach((id) => {
							//if(clsprefix && id.indexOf(clsprefix)!==0) { return; } // tests for $class
							if(node[id]) {
								const tmpids = Object.keys(node[id][nestedtype.name]);
								if(tmpids.length===0) {
									delete node[id][nestedtype.name];
								} else {
									ids = ids.concat(tmpids);
								}
							}
						});
						ids = ids.filter((id) => { return !currentclass ||  id.indexOf(currentclass.name+"@")===0; });
						results[classVar] = (results[classVar] ? intersection(results[classVar],ids) : intersection(ids,ids));
						return results[classVar].length > 0;
					});
					if(results[classVar] && results[classVar].length===0) { return [];  } // resolve([]); return;
					let promises = [];
					
					nodes.fastForEach((node,i) => { // db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
						const join = joins[i];
						if(!join) { return true; }
						promises.push(join.rightClass.index.get(join.rightProperty))
						promises.push(join.rightClass.index.get(join.rightProperty));
					});
					return Promise.all(promises).then((rightnodes) => { // variable not used, promises just ensure nodes loaded for matching
						if(!results[classVar]) {
							results[classVar] = Object.keys(index.keys[keyProperty]).filter((id) => { return !currentclass || id.indexOf(currentclass.name+"@")===0; });;
						}
						nodes.every((node,i) => { // db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
							const join = joins[i]; // {rightVar: second, rightIndex:classVars[second].index, rightProperty:testvalue[second], test:test};
							if(!join) { return true; }
							if(cols[join.rightVar]===0) {
								return true;
							}
							let rightIndex = join.rightClass.index,
								rightKeyProperty = join.rightClass.name + "." + join.rightKeyProperty,
								rightProperty = join.rightClass.name + "." + join.rightProperty;
							if(!rightIndex.keys[rightProperty]) {
								results[classVar] = [];
								return false;
							}
							if(!results[join.rightVar]) {
								results[join.rightVar] = Object.keys(rightIndex.keys[rightKeyProperty]).filter((id) => { 
									return !currentclass || id.indexOf(rightIndex.name+"@")===0; 
								});
							}
							let leftids = [];
							Object.keys(node).fastForEach((leftValue) => {
								Object.keys(node[leftValue]).fastForEach((leftType) => {
									let innerleftids = Object.keys(node[leftValue][leftType]),
										innerrightids = [],
										some = false,
										pnode = rightIndex.keys[rightProperty];
									Object.keys(pnode).fastForEach((rightValue) => {
										let vnode = pnode[rightValue];
										Object.keys(vnode).fastForEach((rightType) => {
											if(join.test(Index.coerce(leftValue,leftType),Index.coerce(rightValue,rightType))) { 
												some = true;
												innerrightids = innerrightids.concat(Object.keys(vnode[rightType]));
											}
										});
									});
									if(some) {
										leftids = leftids.concat(innerleftids); // do we need to filter for class?
										innerrightids = intersection(innerrightids,innerrightids);// do we need to filter for class?
										innerleftids.fastForEach((id,i) => {
											restrictRight[cols[join.rightVar]][id] = (restrictRight[cols[join.rightVar]][id] ? intersection(restrictRight[cols[join.rightVar]][id],innerrightids) : innerrightids);  
										});
									}
								});
							});
							results[classVar] = (results[classVar] && leftids.length>0 ? intersection(results[classVar],leftids) : leftids);
							return results[classVar] && results[classVar].length > 0;
						});
						if(results[classVar] && results[classVar].length>0) { return results[classVar].filter((item) => { return exclude.indexOf(item)===-1; }); }
						return [];
					});
				});
			//});
		}
		async put(object) {
			const index = this,
				store = index.store,
				db = store.db,
				keyProperty = store.keyProperty;
			if(!object[keyProperty]) {
				let id = object.constructor.name +  "@" + (_uuid ? _uuid.v4() : uuid.v4());
				Object.defineProperty(object,keyProperty,{enumerable:true,configurable:true,value:id});
			}
			store.addScope(object);
			return index.index(object,true,db.activate);
		}
		async save(key,f) {
			const index = this,
				isinstance = index.isInstanceKey(key),
				indexkey = (isinstance ? key : index.name + "." + key),
				node = index.keys[indexkey];
			if(node) {
				if(index.saveAsync) {
					if(f) {
						f();
					}
					if(!index.save.pending) {
						index.save.pending = {};
					}
					if(index.save.pending[indexkey]) {
						clearTimeout(index.save.pending[indexkey]);
					}
					index.save.pending[indexkey] = setTimeout(() => {
						index.store.set(indexkey,node);
						delete index.save.pending[indexkey];
					});
					return Promise.resolve();
				}
				return index.store.set(indexkey,node).then(() => {
					if(f) {
						f();
					}
				}).catch((e) => {
					console.log(e);
				});
			}
			return Promise.resolve()
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
		return value && value.search && value.search(testValue)>=0;
	}
	Index.$contains = function(value,testValue) {
		if(!value) {
			return false;
		}
		if(value.indexOf) {
			return value.indexOf(testValue)>=0;
		}
		if(value.includes) {
			return value.includes(testValue);
		}
		return false;
	}
	Index.$in = function(value,testValue) {
		if(!testValue) {
			return false;
		}
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
		const end1 = testValue[0],
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
	Index.$search = function(value,testValue) {
		if(!value) {
			return false;
		}
		value = value.toLowerCase();
		const tokens = testValue.split(" ");
		return tokens.every((testValue) => value.indexOf(testValue)>=0);
	}
	
	class Store {
		constructor(name="Object",keyProperty="@key",db) {
			this.name = name;
			this.keyProperty = keyProperty;
			this.db = db;
			this.scope = {};
			this.ready = async function(clear) {
				if(this.ready.promised) {
					return this.ready.promised;
				}
				this.ready.promised = (clear && this.clear ? this.clear() : Promise.resolve());
				return this.ready.promised;
			}
			this.pending = {};
			this.data = {};
		}
		addScope(value) {
			const me = this;
			if(value && typeof(value)==="object") {
				me.scope[value.constructor.name] = value.constructor;
				Object.keys(value).fastForEach((property) => {
					me.addScope(value[property]);
				});
			}
		}
		delete(key,action = () => {}) {
			const me = this;
			let promise = me.pending[key];
			delete me.data[key];
			if(!promise) {
				promise = me.pending[key] = new Promise((resolve,reject) => {
					me.pending[key] = me.ready().then(() => action());
					me.pending[key].then(() => {
						delete me.pending[key];
						resolve();
					});
				});
				return promise;
			}
			//new Promise((resolve,reject) => {
				return promise.then(() => {
					me.pending[key] = me.ready().then(() => action());
					return me.pending[key].then(() => {
						delete me.pending[key];
						return; //resolve();
					});
				});
			//});
		}
		get(key,action = () => {}) {
			const me = this,
				result = me.data[key];
			let promise = me.pending[key];
			if(result) {
				return Promise.resolve(result);
			}
			if(!promise) {
				promise = me.pending[key] = new Promise((resolve,reject) => {
					me.pending[key] = me.ready().then(() => action());
					me.pending[key].then((result) => {
						if(result) {
							me.restore(result).then((result) => {
								me.data[key] = result;
								resolve(result);
							});
						} else {
							delete me.data[key];
							resolve(result);
						}
						delete me.pending[key];
					});
				});
				return promise;
			} 
			//return new Promise((resolve,reject) => {
				return promise.then(() => {
					me.pending[key] = me.ready().then(() => action());
					return me.pending[key].then((result) => {
						if(result) {
							return me.restore(result).then((result) => {
								me.data[key] = result;
								return result; //resolve(result);
							});
						} else {
							delete me.data[key];
							return result; //resolve(result);
						}
						delete me.pending[key];
					});
				});
			//});
		}
		normalize(value,recursing) {
			const me = this,
				type = typeof(value),
				keyProperty = me.keyProperty;
			let	result;
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
					if(json instanceof Date) {
						result.time = json.getTime();
					}
					Object.keys(json).fastForEach((key,i) => {
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
			const me = this,
				type = typeof(json);
			if(json && type==="object") {
				let key = json[me.keyProperty],
					keys = Object.keys(json),
					keymap = {};
				if(typeof(key)==="string") {
					const parts = key.split("@");
					let	cls = me.scope[parts[0]];
					if(!cls) {
						try {
							me.scope[parts[0]] = cls = Function("return " + parts[0])();
						} catch(e) {
							const promises = [];
							keys.fastForEach((property,i) => {
								keymap[i] = property;
								promises.push(me.restore(json[property],true,cache));
							});
							//new Promise((resolve,reject) => {
								return Promise.all(promises).then((results) => {
									results.fastForEach((data,i) => {
										json[keymap[i]] = data;
									});
									return json; //resolve(json);
								});
							//});
							
						}
					}
					if(keys.length===1) {
						let object;
						try {
							object = await cls.index.get(key);
						} catch(e) {
							console.log(e);
						}
						
						if(object instanceof cls) {
							return Promise.resolve(object);
						}
						if(cls.fromJSON && object) {
							const instance = cls.fromJSON(object);
							instance[cls.index.store.keyProperty] = key;
							return Promise.resolve(instance);
						}
						const instance = Object.create(cls.prototype);
						if(typeof(object)==="undefined") {
							instance[cls.index.store.keyProperty] = key;
							return Promise.resolve(instance);
						}
						const promises = [];
						if(object && typeof(object)==="object") {
							Object.keys(object).fastForEach((property,i) => {
								keymap[i] = property;
								promises.push(me.restore(object[property],true,cache));
							});
						}
						//new Promise((resolve,reject) => {
						return Promise.all(promises).then((results) => {
								results.fastForEach((data,i) => {
									instance[keymap[i]] = data;
								});
								return instance; //resolve(instance);
							});
						//});
					} else if(json instanceof cls) {
							const promises = [];
							keys.fastForEach((property,i) => {
								keymap[i] = property;
								promises.push(me.restore(json[property],true,cache).catch((e) => { console.log(e); }));
							});
							//new Promise((resolve,reject) => {
								return Promise.all(promises).then((results) => {
									results.fastForEach((data,i) => {
										json[keymap[i]] = data;
									});
									return json; //resolve(json);
								});
							//});
					} else if(cls.fromJSON) {
							return Promise.resolve(cls.fromJSON(json));
					} else {
						const instance = Object.create(cls.prototype),
							promises = [];
						keys.fastForEach((property,i) => {
							keymap[i] = property;
							promises.push(me.restore(json[property],true,cache));
						});
					//return new Promise((resolve,reject) => {
						return Promise.all(promises).then((results) => {
								results.fastForEach((data,i) => {
									instance[keymap[i]] = data;
								});
								return instance; //resolve(instance);
							});
					//	});
					}
				}
			}
			return Promise.resolve(json);
		}
		set(key,value,normalize,action = () => {}) {
			const me = this;
			let promise = me.pending[key];
			me.data[key] = value;
			if(!promise) {
				promise = me.pending[key] = new Promise((resolve,reject) => {
					me.pending[key] = me.ready().then(() => action(normalize ? me.normalize(value) : value));
					me.pending[key].then((result) => {
						delete me.pending[key];
						resolve();
					});
				});
				return promise;
			} 
			//return new Promise((resolve,reject) => {
				return promise.then(() => {
					me.pending[key] = me.ready().then(() => action(normalize ? me.normalize(value) : value));
					return me.pending[key].then((result) => {
						delete me.pending[key];
						return; //resolve();
					});
				});
			//});
		}
	}	
	class MemStore extends Store {
		constructor(name,keyProperty,db) {
			super(name,keyProperty,db);
			this.data = {};
		}
		async clear() {
			const me = this;
			Object.keys(me.data).fastForEach((key) => {
				delete me.data[key];
			});
			return true;
		}
		async delete(key) {
			if(this.data[key]) {
				delete this.data[key];
				return true;
			}
			return false;
		}
		async get(key) {
			return this.data[key];
		}
		async set(key,value) {
			this.data[key] = value;
			return true;
		}
	}
	class LocalStore extends Store {
		constructor(name,keyProperty,db,clear) {
			super(name,keyProperty,db);
			if(typeof(window)!=="undefined") {
				this.storage = window.localStorage;
			} else {
				const r = require,
					LocalStorage = r("./LocalStorage.js").LocalStorage;
				this.storage = new LocalStorage(db.name + "/" + name);
			}
			if(clear) {
				this.storage.clear();
			}
		}
		async clear() {
			this.storage.clear();
			return true;
		}
		async delete(key) {
			return super.delete(key,() => new Promise((resolve,reject) => {
				this.storage.removeItem(key+".json");
				resolve(true);
			}));
		}
		async get(key) {
			let me = this;
			return super.get(key,() => new Promise((resolve,reject) => {
				let value = me.storage.getItem(key+".json");
				if(!value) {
					resolve();
				} else {
					resolve(JSON.parse(value));
				}
			}));
		}
		async set(key,value,normalize) {
			let me = this;
			return super.set(key,value,normalize,(normalized) => new Promise((resolve,reject) => {
				me.storage.setItem(key+".json",JSON.stringify(normalized));
				resolve(true)
			}));
		}
	}
	class LocalForageStore extends Store {
		constructor(name,keyProperty,db,clear) {
			super(name,keyProperty,db);
			if(typeof(window)!=="undefined") {
				//window.localforage.config({name:"ReasonDB"})
				this.storage = window.localforage;
			} else {
				return new LocalStore(name,keyProperty,db,clear);
			}
			if(clear) {
				this.storage.clear();
			}
		}
		async clear() {
			try {
				await this.storage.clear();
			} catch(e) {
				console.log(e);
			}
			return true;
		}
		async delete(key) {
			const me = this;
			return super.delete(key, () => new Promise((resolve,reject) => {
				me.storage.removeItem(key+".json").then(() => {
					resolve(true);
				});
			}));
		}
		async get(key) {
			const me = this;
			return super.get(key, () => new Promise((resolve,reject) => {
				me.storage.getItem(key+".json").then((result) => {
					if(!result) {
						resolve();
					} else {
						resolve(result);
					}
				})
			}));
		}
		async set(key,value,normalize) {
			const me = this;
			return super.set(key,value,normalize,(normalized) => new Promise((resolve,reject) => {
				 me.storage.setItem(key+".json",normalized).then(() => {
					 resolve(true);
				 })
			}));
		}
	}
	class ReasonDB {
		constructor(name,keyProperty="@key",storageType,clear=false,activate=true,options={}) { // make the additional args part of a config object, add a config option for active or passive objects
			const db = this;
			if(typeof(storageType)==="undefined") {
				storageType=MemStore;
				console.log("WARNING: Defaulting to MemStore");
			}
			db.name = name;
			db.keyProperty = keyProperty;
			db.storageType = storageType;
			db.clear = clear;
			db.classes = {};
			db.activate = activate;
			Object.keys(options).fastForEach((key) => {
				db[key] = options[key];
			});
			
			delete Object.index;
			db.index(Object,keyProperty,storageType,clear);
			
			db.Pattern = class Pattern {
				constructor(projection,classVars,when,then) {
					const me = this;
					me.projection = projection;
					me.classNames = {};
					Object.defineProperty(me,"classVars",{configurable:true,writable:true,value:classVars});
					Object.keys(classVars).fastForEach((classVar) => {
						me.classNames[classVar] = me.classVars[classVar].name;
					});
					Object.defineProperty(me,"when",{configurable:true,writable:true,value:when});
					Object.defineProperty(me,"then",{configurable:true,writable:true,value:then});
					Pattern.index.put(me);
				}
				toJSON() {
					const me = this,
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
			const db = this;
			keyProperty = (keyProperty ? keyProperty : db.keyProperty);
			storageType = (storageType ? storageType : db.storageType);
			clear = (clear ? clear : db.clear);
			if(!cls.index || clear) { 
				cls.index = new Index(cls,keyProperty,db,storageType,clear);
				db.classes[cls.name] = cls;
			}
			return cls.index;
		}
		delete() {
			const db = this;
			return {
				from(classVars) {
					return {
						where(pattern) {
							return {
								exec() {
									//return new Promise((resolve,reject) => {
										return db.select().from(classVars).where(pattern).exec().then((cursor) => {
											return cursor.count().then((count) => {
												if(count>0) {
													const promises = [];
													Object.keys(cursor.classVarMap).fastForEach((classVar) => {
														const i = cursor.classVarMap[classVar],
															cls = classVars[classVar];
														cursor.cxproduct.collections[i].fastForEach((id) => {
															promises.push(cls.index.delete(id).catch((e) => { console.log(e); }));
														});
													});
													return Promise.all(promises).then((results) => {
														return results; //resolve(results);
													}).catch((e) => { console.log(e); });
													return;
												}
												return []; //resolve([]);
											}); 
										});
									//});
								}
							}
						}
					}
				}
			}
		}
		insert() {
			const db = this,
				objects = [].slice.call(arguments,0);
			return {
				into(cls) {
					let classes;
					if(arguments.length===1) {
						classes = new Array(...objects);
						classes.fastForEach((object,i) => {
							classes[i] = cls;
						});
					} else {
						classes = [].slice.call(...arguments,0);
					}
					return {
						exec() {
							const activity = new Activity();
							objects.fastForEach((object,i) => {
								const cls = classes[i];
								if(!cls.index) {
									db.index(cls);
								}
								activity.step(() => {
										let instance;
										if(object instanceof cls) {
											instance = object;
										} else if(cls.fromJSON) {
											instance = cls.fromJSON(object);
										} else {
											instance = Object.create(cls.prototype);
											Object.defineProperty(instance,"constructor",{configurable:true,writable:true,value:cls});
											Object.keys(object).fastForEach((key) => {
												instance[key] = object[key];
											});
										}
										if(!cls.index) {
											cls.index = db.index(cls);
										}
										return cls.index.put(instance);
									});
							});
							activity.step(() => {
								activity.results.fastForEach((instance) => {
									stream(instance,db);
								});
							});
							return activity.exec();
						}
					}
				},
				exec() {
					const classes = [];
					objects.fastForEach((object) => {
						classes.push(object.constructor);
					})
					return this.into(...classes).exec();
				}
			}
		}
		select(projection) {
			const db = this;
			return {
				first(count) {
					const me = this;
					me.firstCount = count;
					return {
						from(classVars) {
							return me.from(classVars);
						}
					}
				},
				random(count) {
					const me = this;
					me.randomCount = count;
					return {
						from(classVars) {
							return me.from(classVars);
						}
					}
				},
				sample(confidence,range) {
					const me = this;
					me.sampleSpec = {confidence:confidence, range:range};
					return {
						from(classVars) {
							return me.from(classVars);
						}
					}
				},
				from(classVars) {
					const select = this;
					return {
						where(pattern,restrictVar,instanceId) {
							return {
								orderBy(ordering) { // {$o: {name: "asc"}}
									const me = this;
									me.ordering = ordering;
									return {
										exec() {
											return me.exec();
										}
									}
								},
								limit(count) {
									const me = this;
									select.limit = count;
									return {
										page(offset) {
											select.page = offset;
											return {
												exec() {
													return me.exec();
												}
											}
										},
										exec() {
											return me.exec();
										}
									}
								},
								exec(ordering) {
									return new Promise((resolve,reject) => {
										const matches = {},
											restrictright = {},
											matchvars = [],
											activity = new Activity();
										if(typeof(pattern)==="function") {
											const classes = [];
											Object.keys(classVars).fastForEach((key) => {
												classes.push(classVars[key]);
											});
											asynchronize(pattern(...classes)).then((rows) => {
												const cursor = new Cursor(classes,rows,projection,classVars);
												if(select.limit>=0) {
													cursor.page(select.page||1,select.limit).then((rows) => {
														resolve(new Cursor(classes,rows));
													});
												} else if(select.firstCount) {
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
													resolve(cursor); // ,matches
												}
											});
										} else {
											Object.keys(pattern).fastForEach((classVar) => {
												if(!classVars[classVar]) { 
													return;
												}
												if(!classVars[classVar].index) {
													db.index(classVars[classVar]);
												}
												matchvars.push(classVar);
												activity.step(() => classVars[classVar].index.match(pattern[classVar],classVars,matches,restrictright,classVar));
											});
											activity.step(() => {
												let pass = true;
												activity.results.every((result,i) => {
													if(result.length===0) {
														pass = false;
													}
													return pass;
												});
												if(!pass) {
													resolve(new Cursor([],new CXProduct([]),projection,{}),matches);
												} else {
													const classes = [],
														collections = [],
														promises = [],
														vars = [],
														classVarMap = {},
														filter = (row,index,cxp) => {
															return row.every((item,i) => {
																if(!item) {
																	return false;
																}
																if(i===0 || !restrictright[i]) {
																	return true;
																}
																let prev = row[i-1];
																return !restrictright[i][prev] || restrictright[i][prev].indexOf(item)>=0;
															});
														},
														defered = (row) => {
															return row.every((item,i) => {
																const cls = classes[i],
																classVar = matchvars[i];
																if(classVar) {
																	const deferkeys = (cls.deferKeys ? cls.deferKeys : []),
																		textkeys = (cls.fullTextKeys ? cls.fullTextKeys : []),
																		keys = deferkeys.concat(textkeys);
																	return keys.every((key) => {
																		if(pattern[classVar] && pattern[classVar][key]) {
																			const predicate = pattern[classVar][key],
																				testname = Object.keys(predicate)[0],
																				value = predicate[testname],
																				test = Index[testname];
																			return test(item[key],value);
																		}
																		return true;
																	});
																}
																return true;
															});
														};
													Object.keys(classVars).fastForEach((classVar) => {
														if(matches[classVar]) {
															collections.push(matches[classVar]);
															classes.push(classVars[classVar]);
														}
													});
													const cursor = new Cursor(classes,new CXProduct(collections,filter),projection,classVars,defered);
													if(select.limit>=0) {
														cursor.page(select.page||1,select.limit).then((rows) => {
															resolve(new Cursor(classes,rows));
														});
													} else if(select.firstCount) {
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
											}).exec();
										}
									});
								}
							}
						}
					}
				}
			}
		}
		update(classVars) {
			const db = this;
			return {
				set(values) {
					return {
						where(pattern) {
							return {
								exec() {
									//return new Promise((resolve,reject) => {
										const updated = {},
											promises = [];
										return db.select().from(classVars).where(pattern).exec().then((cursor,matches) => {
											const vars = Object.keys(classVars);
											promises.push(cursor.fastForEach((row) => {
												row.fastForEach((object,i) => {
													const classVar = vars[i];
													let activated;
													if(values[classVar])  {
														Object.keys(values[classVar]).fastForEach((property) => {
															let value = values[classVar][property];
															if(value && typeof(value)==="object") {
																const sourcevar = Object.keys(value)[0];
																if(classVars[sourcevar]) {
																	const j = vars.indexOf(sourcevar);
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
										return Promise.all(promises).then(() => {
											return Object.keys(updated).length; //resolve(Object.keys(updated).length);
										});
									//});
								}
							}
						}
					}
				}
			}
		}
		when(whenPattern) {
			const db = this;
			return {
				from(classVars) {
					return {
						select(projection) {
							const pattern = new db.Pattern(projection,classVars,whenPattern);
							//	promise = new Promise((resolve,reject) => { pattern.resolver = resolve; pattern.rejector = reject; });
							Object.keys(whenPattern).fastForEach((classVar) => {
								if(classVar[0]!=="$") { return; }
								const cls = classVars[classVar];
								if(!db.patterns[cls.name]) { db.patterns[cls.name] = {}; }
								Object.keys(whenPattern[classVar]).fastForEach((property) => {
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
	ReasonDB.stopWords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves"];
	ReasonDB.Store = Store;
	ReasonDB.MemStore = MemStore;
	ReasonDB.LocalStore = LocalStore;
	ReasonDB.LocalForageStore = LocalForageStore;
	ReasonDB.Activity = Activity;
	if(typeof(module)!=="undefined") {
		module.exports = ReasonDB;
	}
	if(typeof(window)!=="undefined") {
		window.ReasonDB = ReasonDB;
	}
})();