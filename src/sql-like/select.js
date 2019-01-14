import {cartesianAsyncGenerator} from "../cartesianAsyncGenerator.js";

import {generx} from "../generx.js";

//import {Statement} from "./statement.js"

const isGenerator = f => {
		const proto = Object.getPrototypeOf(f);
		return proto===Object.getPrototypeOf(function* () {}) ||
			proto===Object.getPrototypeOf(async function* () {});
	},
	removeJoins = (pattern,keys) => {
		let result = {};
		Object.keys(pattern).forEach(key => {
			if(pattern[key] && typeof(pattern[key])==="object") {
				Object.keys(pattern[key]).forEach(childKey => {
					if(keys.includes(childKey)) {
						result[key] = "$true!"; // major cross-module coupling to database match compiler
					} else {
						result[key] = removeJoins(pattern[key],keys);
					}
				})
			} else {
				result[key] = pattern[key];
			}
		});
		return result;
	},
	// merge objects where there are sub-object matches across joined entities
	mergeJoins = (pattern,data,target={},root=target,path=[]) => {
		let joined;
		Object.keys(pattern).forEach(key => {
			const value = pattern[key],
				type = typeof(value),
				parentkey = path[path.length-1];
			if(value==="$") {
				if(data[parentkey] && data[parentkey][key]!==undefined) {
					const targetpath = path.slice(0,path.length-1);
					let node = root,
						nodekey,
						lastpredicate,
						lastpredicatekey;
					while((nodekey = targetpath.shift())) {
						if(nodekey[0]==="$") {
							lastpredicate = node;
							lastpredicatekey = nodekey;
						}
						node = node[nodekey];
					}
					lastpredicate[lastpredicatekey] = data[parentkey][key];
					delete lastpredicate[parentkey];
				}
				joined = target;
			} else if(value && type==="object") {
				path.push(key);
				if(!mergeJoins(value,data,target[key]={},root,path)) {
					delete target[key];
				} else {
					joined = true;
				}
				path.pop(key);
			}
		});
		return joined;
	},
	lazyCrossProduct = function*(sets) {
	  var p=[],max=sets.length-1,lens=[];
	  for (var i=sets.length;i--;) lens[i]=sets[i].length;
	  function* dive(d){
	    var a=sets[d], len=lens[d];
	    if (d==max) for (var i=0;i<len;++i) { p[d]=a[i]; yield p; }
	    else        for (var i=0;i<len;++i) p[d]=a[i], yield* dive(d+1);
	    p.pop();
	  }
	  for(const product of dive(0)) {
	  	yield product;
	  }
	};
	
	async function* doJoin(lname,data,target,on) {
		const rights = target.name==="select" ? target : Select(db).from(target);
				rname = Object.keys(rights.queries)[0];
			for await(const right of rights()) {
				let targets = {[lname]:left,[rname]:right},
					match = on ? await on(targets) : targets;
				if(match && typeof(match)==="object") {
					yield Object.assign({},{[lname]:match[lname]},{[rname]:match[rname]});
				}
			}
	};
	
export function Select(db,...columns) {
		let stats, // gets set by from in conjuctions with columns
			_from, // gets set by from for use by join
			_select,
			patterns; // gets set by where
		const cols = columns.reduce((accum,spec) => Object.assign(accum,spec),{}),
			queries = {},
			aliases = [], // values get added by from function
			sets = [],
			exec = generx(async function* (joined) {
				// actually run the queries
				for(const alias of aliases) {
					const results = stats && stats[alias] ? queries[alias]().withMemory({stats:stats}) : queries[alias](),
						objects = [];
					sets.push(objects); // items added to objects in for loop
					for await(const item of results) {
						if(item && item[alias]) {
							const colspecs = cols[alias];
							if(colspecs) { // process column aliases and defaults
								const result = {};
								Object.keys(colspecs).forEach(colname => { // loop over specs and not item, in case spec provides default
									const value = item[alias][colname],
										colspec = cols[alias][colname];
									if(colspec) {
										const alias = typeof(colspec)==="string" ? colspec : colspec.as || colname;
										result[alias] = value!=null ? value : colspec.default;
									}
								});
								// resolve any functions
								for(const key in result) {
									const value = result[key];
									if(typeof(value)==="function") {
										result[key] = await value.call(results,Object.assign({},item,result));
									}
								}
								if(aliases.length===1) { // no join required, so just yield
									yield result[alias] && result[alias].constructor.name===alias ? result[alias] : result;
								} else {
									objects.push(result);
								}
							} else { // no column aliases or defaults
								if(aliases.length===1) {  // no join required, so just yield
									yield item[alias] && item[alias].constructor.name===alias ? item[alias] : item;
								} else {
									objects.push(item);
								}
							}
						}
					}
				}
				// process joins
				if(aliases.length>1) {
					for(const product of lazyCrossProduct(sets)) {
						const data = product.reduce((accum,object) => Object.assign(accum,object),{}),
							resolved = {};
						if(patterns) {
							aliases.forEach(alias => {
								if(patterns[alias] && !mergeJoins(patterns[alias],data,resolved[alias]={})) {
									delete resolved[alias];
								}
							});
						}
						const paths = db.getPaths(resolved);
						if(paths.every(path => {
							path.shift();
							let last = path.pop(),
								value = data,
								key;
							while((key = path.shift())) {
								if((value = value[key])==="undefined") return false;
							}
							if(value===last) return true;
							if(typeof(last)==="function") return last(value);
							return false;
						})) {
							yield data;
						}
					}
				}
			});
			function groupBy() {
				
			};
			function orderBy() {
				
			};
			if(!_select) _select = this;
		return {
			from(...sources) {
				// process sources, loop twice to simplify code
				// first collect into an object
				if(!_from && this && this.from) _from = this.from;
				const ctors = {},
					currentaliases = [];
				sources.forEach(source => {
					if(typeof(source)==="object") { // handle aliases, e.g. {p2: Person}
						 Object.keys(source).forEach(alias => {
							 queries[alias] = source[alias];
							 if(!isGenerator(source[alias])) ctors[alias] = source[alias];
							 if(!aliases.includes(alias)) aliases.push(alias);
							 currentaliases.push(alias);
						 })
					} else {
						ctors[source.name] = queries[source.name] = source;
						if(!aliases.includes(source.name)) aliases.push(source.name);
						currentaliases.push(source.name);
					}
				});
				// next, see if cursor memory needs to be turned on to support avg, etc.
				// if so, turn on, and set default to the running result
				const statmap = {
						min: function(value) {
							if(!this.reset) {
								this.reset = () => {
									delete this.value;
								}
								this.reset();
							}
							this.value = Math.min(this.value||0,value);
						},
						avg: function(value) {
							if(!this.reset) {
								this.reset = () => {
									this.count = 0;
									this.sum = 0;
									this.value = 0;
								}
								this.reset();
							}
							this.count++;
							this.sum += value;
							this.value = this.sum / this.count;
						},
						max: function(value) {
							if(!this.reset) {
								this.reset = () => {
									delete this.value;
								}
								this.reset();
							}
							this.value = Math.max(this.value||0,value);
						}
				}
				currentaliases.forEach(alias => {
					Object.keys(cols[alias]||{}).forEach(computedcolname => {
							const colspec = cols[alias][computedcolname];
							if(typeof(colspec)==="object") {
								Object.keys(colspec).forEach(key => {
									if(key==="$") {
										Object.keys(cols[alias][computedcolname][key]).forEach(stat => {
											const f = statmap[stat];
											if(f) {
												const colname = cols[alias][computedcolname][key][stat];
												if(!stats) stats = {};
												if(!stats[alias]) stats[alias] = {};
												if(!stats[alias][colname]) stats[alias][colname] = function(value) { f.call(this,value[colname]); }
												cols[alias][computedcolname].default = () => stats[alias][colname].value;
											}
										});
									}
								});
							}
					})
				});
				// next, handle top level vs subqueries (i.e. generators or arrays)
				currentaliases.forEach(alias => {
					const target = queries[alias];
					//if(isGenerator(target)) {
					if(target.exec) {
						queries[alias] = generx(async function*() {
							for await(const item of target.exec()) {
								const value = await item;
								yield {[alias]:value};
							}
						});
					} else if(Array.isArray(target)) { // a virtual table of the form [{key:value},{key:value}]
						queries[alias] = generx(async function*() {
							for await(const item of target) {
								const value = await item;
								yield {[alias]:value}; // do we need await in case an array of Promises
							}
						});
					} else if(typeof(target)==="function") { // target is a ctor
						 // get all instances of the object if no pattern, may get overwritten by where
						queries[alias] = generx(async function*() {
							for await(const edge of db.get(`/${target.name}/#`)) { 
								for(const id in edge.edges) {
									const value = await db.getObject(id);
									yield {[alias]:value};
								}
							}
						});
						queries[alias].instanceOf = target;
					}
				});
				return {
					where(pattern) {
						if(currentaliases.length===1 && !pattern[currentaliases[0]]) {
							pattern = {[currentaliases[0]]:pattern};
						}
						patterns = pattern;
						currentaliases.forEach((alias,i) => {
							if(pattern[alias]) {
								queries[alias] = generx(async function*() {
									for await(const item of db.match(removeJoins(pattern[alias],aliases),{ctor:ctors[alias]})) {
										yield {[alias]:item};
									}
								})
							}
						});
						return {
							groupBy,
							orderBy,
							exec: generx(
								async function*() {
									for await(const item of exec()) {
										yield item;
									}
								})
						}
					},
					natural() {
						return {
							join(target) {
								_from(target);
								return Object.assign({},_select,{
									exec: generx(
											async function*() {
												for await(let item of  exec()) {
													item = await item;
													const objects = Object.values(item);
													if(objects.every(object1 => { // for all objects
														return objects.every(object2 => { // compared to every other object
															if(object1===object2 || object1["#"]===object2["#"]) return true; // same object
															return Object.keys(object1).every(key => { // or key values of other undefined or same
																object2[key]===undefined || object2[key]===object1[key];
															})
														})
													})) yield item;
												}
											})
								})
							}
						}
					},
					join(target) {
						_from(target);
						return {
							on(filter) {
								return {
									exec: generx(
											async function*() {
												for await(const item of  exec()) {
													if(filter(await item)) yield item;
												}
											})
								}
							},
							using(...keys) {
								return {
									exec: generx(
											async function*() {
												for await(let item of  exec()) {
													item = await item;
													const objects = Object.values(item);
													if(objects.every(object1 => { // for all objects
														return objects.every(object2 => { // compared to every other object
															if(object1===object2 || object1["#"]===object2["#"]) return true; // same object
															return keys.every(key => {
																object2[key]===object1[key];
															})
														})
													})) yield item;
												}
											})
								}
							},
							exec: generx(
									async function*() {
										for await(const item of exec()) {
											yield item;
										}
									})
						}
					},
					exec: generx(
							async function*() {
								for await(const item of exec()) {
									yield item;
								}
							})
				}
			}
		}
	}

