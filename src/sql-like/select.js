import {enhanceGenerators} from "../enhanceGenerators.js";

import {cartesianAsyncGenerator} from "../cartesianAsyncGenerator.js";

import {generx} from "../generx.js";

//import {Statement} from "./statement.js"

const isGenerator = f => {
		const proto = Object.getPrototypeOf(f);
		return proto===Object.getPrototypeOf(function* () {}) ||
			proto===Object.getPrototypeOf(async function* () {});
	},
	nameFunction = (f,name) => {
		return Function("f,",`return function ${name}(...args) { return f.call(this,...args); }`)(f);
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

export function Select(db,...columns) {
	let groupBy,
		projection;
	const cols = columns.reduce((accum,spec) => Object.assign(accum,spec),{});
	async function* select() {
		const sets = [],
			keys = Object.keys(select.queries);
		for(const key of keys) {
			const query = select.queries[key],
				objects = [];
			sets.push(objects);
			for await(const item of query()) {
				if(item) {
					if(columns.length>0) {
						const result = {};
						Object.keys(item).forEach(target => {
							const colspec = cols[target];
							if(colspec) {
								Object.keys(colspec).forEach(key => {
									const value = item[target][key],
										alias = typeof(colspec[key])==="string" ? colspec[key] : colspec[key].as || key;
									result[alias] = value!=null ? value : colspec[key].default;
								})
							}
						});
						Object.keys(result).forEach(key => {
							const value = result[key];
							if(typeof(value)==="function") {
								result[key] = value(Object.assign({},item,result));
							}
						});
						if(keys.length===1) {
							yield result;
						} else {
							objects.push(result);
						}
					} else {
						if(keys.length===1) {
							yield item;
						} else {
							objects.push(item);
						}
					}
				}
			}
		}
		if(keys.length>1) {
			for(const product of lazyCrossProduct(sets)) {
				const data = product.reduce((accum,object) => Object.assign(accum,object),{}),
					resolved = {};
				keys.forEach(key => {
					if(!mergeJoins(select.where[key],data,resolved[key]={})) {
						delete resolved[key];
					}
				});
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
	}
	select.queries = {};
	select.from = (...sources) => {
		sources.forEach(source => {
			if(Array.isArray(source)) {
				//targets.push(source);
			} else if(typeof(source)==="object") {
				 Object.keys(source).forEach(key => {
					 select.queries[key] = source[key];
				 })
			} else {
				select.queries[source.name] = source;
			}
		});
		Object.keys(select.queries).forEach(key => {
			const target = select.queries[key];
			let query;
			if(isGenerator(target)) {
				query = nameFunction(target,key);
			} else if(Array.isArray(target)) {
				query = nameFunction(async function*() {
					for await(const item of target) {
						yield item; // do we need await in case an array of Promises
					}
				},key);
			} else if(typeof(target)==="function") {
				query = async function*() {
					for await(const edge of db.get(`/${target.name}/#`)) {
						for(const id in edge.edges) {
							yield db.getObject(id);
						}
					}
				}
				query.instanceOf = target;
			}
			if(query) {
				select.queries[key] = query;
			}
		});
		
		const generator = generx(select);
		generator.groupBy = function(groupings) {
			
		}
		generator.where = function(pattern) {
			const me = this,
				keys = Object.keys(select.queries);
			select.where = pattern;
			for(const key of keys) {
				if(pattern[key]) {
					const ctor = select.queries[key].instanceOf;
					select.queries[key] = async function*() {
						if(ctor) {
							if(pattern[key].$self) {
								const self = pattern[key].$self;
								pattern[key].$self = {$and:{}};
								Object.assign(pattern[key].$self.$and,self,{$instanceof:cname});
							} else {
								pattern[key].$self = {$instanceof:ctor};
							}
						}
						for await(const item of db.match(removeJoins(pattern[key],keys))) {
							yield {[key]:item};
						}
					}
				}
			}
			const results = this();
			results.groupBy = groups => {
				
			}
			return results;
		}
		generator.join = function(target) {
			const me = this,
				rights = target.name==="select" ? target : Select(db).from(target),
				lname = Object.keys(me.queries)[0],
				rname = Object.keys(rights.queries)[0];
			let filter,
				joined = async function*() {
					for await(const left of me()) {
						for await(const right of rights()) {
							let targets = {[lname]:left,[rname]:right},
								match = filter ? await filter(targets) : targets;
							if(match && typeof(match)==="object") {
								yield Object.assign({},{[lname]:match[lname]},{[rname]:match[rname]});
							}
						}
					}
				};
			joined = generx(joined);
			joined.natural = 	function(...properties) {
				this.on(item =>  {
					let keys;
					if(properties.length>0) {
						keys = properties;
					} else {
						keys = Object.keys(item[lname]).map(key => item[rname][key]!==undefined);
					}
					return keys.every(key => {
						item[lname][key]===item[rname][key];
					});
				});
				return this();
			};
			joined.on = function(test) {
				filter = test;
				return this();
			};
			return joined;
		}
		generator.cross = generx(async function*(target) {
			const rights = target.name==="select" ? target : Select(db).from(target),
				lname = Object.keys(select.queries)[0],
				rname = Object.keys(rights.queries)[0],
				query = async function*() {
					for await(const [left,right] of cartesianAsyncGenerator(select(),rights())) {
						let targets = {[lname]:left,[rname]:right},
							match = filter ? await filter(targets) : targets;
						if(match && typeof(match)==="object") {
							yield Object.assign({},{[lname]:match[lname]},{[rname]:match[rname]});
						}
					}
				};
			return query();
		});
		return generator;
	}
	return select;
}

/*
export class Select extends Statement {
	constructor(db,...columns) { // source, [source,key,alias]
		super(db);
		this.columns = columns.map(spec => Array.isArray(spec) ? (spec.length===3 ? {source:spec[0],key:spec[1],alias:spec[2]||spec[1]} : {key:spec[1],alias:spec[2]||spec[1]}) : {key:spec,alias:spec})
		enhanceGenerators(this,["exec"]);
	}
	from(source) {
		this.source = source; // source could be aliased
		return this;
	}
	as(name) {
		this.name = name;
		return this;
	}
	where(pattern) { // {<key>:<value>} || {<alias>.<key>:<value}
		if(typeof(this.source)==="function") {
			this.query = () => {
				pattern = Object.assign({},pattern);
				if(pattern.$self) {
					const self = pattern.$self;
					pattern.$self = {$and:{}};
					Object.assign(pattern.$self.$and,self,{$instanceof:this.source});
				} else {
					pattern.$self = {$instanceof:this.source}
				}
				return this.db.match(pattern);
			}
		} else {
			Object.keys(pattern).forEach(key => {
				
			})
		}
		return this;
	}
	join(ctorOrSelect,alias) {
		return new Join(this.db,this,ctorOrSelect);
	}
	cross(ctorOrSelect,alias) {
		return new CrossJoin(this.db,this,ctorOrSelect);
	}
	async* exec() {
		let query = this.query
		if(!query) {
			const db = this.db,
				cname = this.source.name; /// should be sources, then need to join?
			query = async function*() {
				for await(const edge of db.get(`/${cname}/#`)) {
					for(const id in edge.edges) {
						yield db.getObject(id);
					}
				}
			}
		}
		for await(const item of query()) {
			if(this.projection) {
				item = Object.assign({},item);
				Object.keys
			} else {
				yield item;
			}
		}
	}
}

class AbstractJoin {
	alias(left,right,leftName,rightName) {
		if(leftName) {
			left = Object.keys(left).reduce((accum,key) => { accum[`${leftName}.${key}`] = left[key]; return accum; },{})
		}
		if(rightName) {
			right = Object.keys(right).reduce((accum,key) => { accum[`${rightName}.${key}`] = right[key]; return accum; },{})
		}
		return {left,right};
	}
}

export class Join extends AbstractJoin {
	constructor(db,left,right) {
		super(db);
		this.left = left;
		this.right = right;
		enhanceGenerators(this,["exec"]);
	}
	natural(...properties) {
		if(properties.length===0) {
			Object.keys(this.left).forEach(key => {
				if(this.right[key]!==undefined) properties.push(key);
			})
		}
		if(properties.length===0) {
			this.unnatural = true;
		} else {
			this.on((left,right) =>  {
				return properties.every(property => left[property]===right[property]);
			})
		}
		return this;
	}
	on(filter) {
		this.filter = filter;
		return this;
	}
	async* exec() {
		if(this.unnatural) return;
		for await(const left of this.left.exec()) {
			if(left) {
				for await(const right of this.right.exec()) {
					if(right) {
						let match = this.filter ? await this.filter(left,right) : {left,right};
						if(match && typeof(match)==="object") {
							const aliased = this.alias(match.left,match.right,this.left.name,this.right.name);
							yield Object.assign({},aliased.left,aliased.right);
						}
					}
				}
			}
		}
	}
}

export class CrossJoin extends AbstractJoin {
	constructor(db,left,right) {
		super(db);
		this.left = left;
		this.right = right;
		enhanceGenerators(this,["exec"]);
	}
	on(filter) {
		this.filter = filter;
		return this;
	}
	async* exec() {
		for await(const [left,right] of cartesianAsyncGenerator(this.left.exec.bind(this.left),this.right.exec.bind(this.right))) {
			let match = this.filter ? await this.filter(left,right) : {left,right};
			if(match && typeof(match)==="object") {
				const aliased = this.alias(match.left,match.right,this.left.name,this.right.name);
				yield Object.assign({},aliased.left,aliased.right);
			}
		}
	}
}*/