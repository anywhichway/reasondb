const computeStats = (spec={},value) => {
		Object.keys(spec).forEach(key => {
			if(typeof(spec[key])==="function") {
				spec[key].call(spec[key],value);
			} else if(value && typeof(value)==="object" && value[key]!==undefined) {
				computeStats(spec[key],value[key]);
			}
		})
	},
	resetStats = (spec={}) => {
		Object.keys(spec).forEach(key => {
			if(typeof(spec[key])==="function") {
				if(spec[key].reset) spec[key].reset.call(spec[key]);
			} else {
				resetStats(spec[key]);
			}
		})
	},
	forceableStats = (spec={}) => {
		return Object.keys(spec).some(key => {
			if(key==="$") {
				return !spec[key].running;
			} 
			if(spec[key] && typeof(spec[key])==="object") {
				return forceableStats(spec[key]);
			}
		})
	};

import {zscore} from "./zscore.js";

	//Add every, forEach, map, reduce, some, etc. capability to generators
export function generx(f) {
		const generator = f(""),
			proto = Object.getPrototypeOf(generator),
			async = Object.getPrototypeOf(async function* () {}()).constructor===proto.constructor;
		if(async) {
			proto.every = async function(f) {
				let i = 0;
				for(;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done && !(await f(item,i,this))) return 0;
				}
				for await(const item of this) {
					if(!(await f(item,i++,this))) return 0;
				}
				return i;
			}
			proto.find = async function(f) {
				let i = 0;
				for(;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done && await f(item,i,this)) return item;
				}
				for await(const item of this) {
					if(await f(item,i++,this)) return item;
				}
			}
			proto.findIndex = async function(f) {
				let i = 0;
				for(;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done && await f(item,i,this)) return i;
				}
				for await(const item of this) {
					if(await f(item,i,this)) return i;
					i++;
				}
			}
			proto.forEach = async function(f) {
				for(let i=0;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done) await f(item,i,this);
				}
				for await(const item of this) {
					await f(item,this.length,this)
				}
				return this.length;
			}
			proto.includes = async function(value) {
				let i = 0;
				for(;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done && item===value) return true;
				}
				for await(const item of this) {
					if(item===value) return true;
				}
				return false;
			}
			proto.indexOf = async function(value) {
				let i = 0;
				for(;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done && item===value) return i;
				}
				for await(const item of this) {
					if(item===value) return i;
					i++;
				}
				return -1;
			}
			proto.keys = function() {
				const me = this;
				let generator = async function*() {
					let i = 0;
					for(;me.resolved && i<me.length;i++) {
						yield i;
					}
					for await(const item of me) {
						yield i;
						i++;
					}
				}
				generator = generx(generator);
				return generator();
			}
			proto.lastIndexOf = async function(value) {
				let i = 0,
					last = -1;
				for(;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done && item===value) last = i;
				}
				for await(const item of this) {
					if(item===value) last = i;
					i++;
				}
				return last;
			}
			proto.map = async function(f) {
				const result = [];
				let i = 0;
				for(;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done) result.push(await f(item,i,this));
				}
				for await(const item of this) {
					result.push(await f(item,i++,this));
				}
				return result;
			}
			proto.random = async function(size) {
				const all = [],
					results = [],
					sampled = {};
				await this.forEach(item => all.push(item));
				while(results.length<size && results.length<all.length) {
					const index = Math.trunc(Math.random() * all.length);
					if(!sampled[index]) {
						sampled[index] = true;
						results.push(all[index]);
					}
				}
				return results;
			}
			/*
			n = ((cv*stdev)/me)^2
			The “s” is the standard deviation. 
			The “E” is the desired margin of error. 
			The cv is the critical value from the ztable for a 95% CI.
		  */
			proto.sample = async function({me=.05,ci=.999,key}) {
				const all = [],
					results = [],
					sampled = {};
				let sum = 0,
					count = 0;
				await this.forEach(item => { const value = key ? item[key] : item; all.push(value); sum += value; count++ });
				const avg = sum / count,
					variance = all.reduce((accum,value) => Math.abs(avg - value),0) / count,
					stdev = Math.sqrt(variance),
					cv = zscore(ci),
					minsize = ((cv*stdev)/me)^2,
					size = Math.max(minsize,1);
				while(results.length<size && results.length<all.length) {
					const index = Math.trunc(Math.random() * all.length);
					if(!sampled[index]) {
						sampled[index] = true;
						results.push(all[index]);
					}
				}
				if(minsize<results.length) {
					Object.defineProperty(results,"valid",{value:true});
				}
				return results;
			}
			proto.reduce = async function(f,accum) {
				let initialized = accum!==undefined,
					i = 0;
				for(;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done) {
						if(initialized) {
							accum = await f(accum,item,i,this);
						} else {
							accum = item;
							initialized = true;
						}
					}
				}
				for await(const item of this) {
					if(initialized) {
						accum = await f(accum,item,i++,this);
					} else {
						accum = item;
						initialized = true;
					}
				}
				return accum;
			}
			proto.reverse = function() {
				const me = this;
				let generator = async function*() {
					const items = [];
					for(;me.resolved && !me.done;i++) {
						const item = await me[i];
						if(!me.done) items.unshift(item);
					}
					for await(const item of me) {
						items.unshift(item);
					}
					for(const item of items) yield item;
				}
				generator = generx(generator);
				if(this.stats||this.seek) generator = generator.withMemory(this);
				return generator();
			}
			proto.sort = function(f) {
				const me = this;
				let generator = async function*() {
					const items = [];
					for(;me.resolved && !me.done;i++) {
						const item = await me[i];
						if(!me.done) items.push(item);
					}
					for await(const item of me) {
						items.push(item);
					}
					items.sort(f);
					for(const item of items) yield item;
				}
				generator = generx(generator);
				if(this.stats||this.seek) generator = generator.withMemory(this);
				return generator();
			}
			proto.slice = function(begin=0,end) {
				const me = this;
				let generator = async function*() {
					let i = 0;
					for(;me.resolved && !me.done;i++) {
						const item = await me[i];
						if(i<begin) { i++; continue; }
						if(i===end) return;
						i++;
						yield item;
					}
					for await(const item of me) {
						if(i<begin) { i++; continue; }
						if(i===end) return;
						i++;
						yield item;
					}
				}
				generator = generx(generator);
				if(this.stats||this.seek) generator = generator.withMemory(this);
				return generator();
			}
			proto.some = async function(f) {
				let i = 0,
					length = this.length;
				for(;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done && await f(item,i,this)) return true;
				}
				for await(const item of this) {
					if(await f(item,i++,this)) return true;
				}
			}
			proto.values = async function() {
				const values = [];
				for(;this.resolved && !this.done;i++) {
					const item = await this[i];
					if(!this.done) {
						if(item && typeof(item)==="object" && item instanceof Edge) {
							let value = item._value;
							if(isSoul(value)) {
								value = await item.db.getObject(value);
								if(value!==undefined) values.push(value);
							} else {
								values.push(value);
							}
						} else if(item!==undefined) {
							values.push(item);
						}
					}
				}
				for await(const item of this) {
					if(item && typeof(item)==="object" && item instanceof Edge) {
						let value = item._value;
						if(isSoul(value)) {
							value = await item.db.getObject(value);
							if(value!==undefined) values.push(value);
						} else {
							values.push(value);
						}
					} else if(item!==undefined) {
						values.push(item);
					}
				}
				return values;
			}
			proto.withMemory = function({stats,seek}={}) {
				const me = this;
				if(stats) {
					this.stats = stats;
					this.force = forceableStats(stats);
				}
				if(seek) this.seek = seek;
				Object.defineProperty(this,"resolved",{configurable:true,value: new Proxy([],{
					async get(target,property) {
						if(me.length===0) { // force full resolution
							let next;
							do {
								 next = await me.next();
							} while(next && !next.done);
						}
						return me[property];
					}
				})});
				if(this.force) {
					this.resolved[0]; // resolves entire generator
				} else if(seek) {
					return new Proxy(this,{
						async get(target,property) {
							const index = parseInt(property),
								length = target.length;
							if(!isNaN(index) && index>=length) {
								let i = length - 1;
								while(i++<index) {
									const next = await target.next();
									if(next && next.done) break;
								}
								return target[index];
							}
							return target[property];
						}
					})
				}
				return this;
			}
		} else {
			proto.every = function(f) {
				let i = 0;
				for (const item of this) {
					add(this,item);
					if(!( f(item,i++,this))) return 0;
				}
				return i;
			}
			proto.find = function(f) {
				let i = 0;
				for (const item of this) {
					if( f(item,i++,this)) return item;
				}
			}
			proto.findIndex = function(f) {
				let i = 0;
				for (const item of this) {
					add(this,item);
					if( f(item,i,this)) return i;
					i++;
				}
			}
			proto.forEach = function(f) {
				let i = 0;
				for (const item of this) {
					add(this,item);
					f(item,i++,this)
				}
				return i;
			}
			proto.includes = function(value) {
				let i = 0;
				for (const item of this) {
					add(this,item);
					if(item===value) return true;
				}
				return false;
			}
			proto.indexOf = function(value) {
				let i = 0;
				for (const item of this) {
					add(this,item);
					if(item===value) return i;
					i++;
				}
				return -1;
			}
			proto.keys = function() {
				const me = this;
				let generator = function*() {
					let i = 0;
					for (const item of me) {
						add(this,item);
						yield i;
						i++;
					}
				}
				generator = generx(generator);
				return generator();
			}
			proto.lastIndexOf = function(value) {
				let i = 0,
					last = -1;
				for (const item of this) {
					add(this,item);
					if(item===value) last = i;
					i++;
				}
				return last;
			}
			proto.map = function(f) {
				const result = [];
				let i = 0;
				for (const item of this) {
					add(this,item);
					result.push( f(item,i++,this));
				}
				return result;
			}
			proto.random = function(size) {
				const all = [],
					results = [],
					sampled = {};
				this.forEach(item => all.push(item));
				while(results.length<size && results.length<all.length) {
					const index = Math.trunc(Math.random() * all.length);
					if(!sampled[index]) {
						sampled[index] = true;
						results.push(all[index]);
					}
				}
				return results;
			}
			proto.reduce = function(f,accum) {
				let initialized = accum!==undefined,
					i = 0;
				for (const item of this) {
					add(this,item);
					if(initialized) {
						accum = f(accum,item,i++,this);
					} else {
						accum = item;
						initialized = true;
					}
				}
				return accum;
			}
			proto.reverse = function() {
				const me = this;
				let generator = function*() {
					const items = [];
					for (const item of me) {
						add(me,item);
						items.unshift(item);
					}
					if(this.values) this.values.reverse();
					for(const item of items) yield item;
				}
				generator = generx(generator);
				if(this.stats||this.seek) generator = generator.withMemory(this);
				return generator();
			}
			proto.sort = function(f) {
				const me = this;
				let generator = function*() {
					const items = [];
					for (const item of me) {
						add(this,item);
						items.push(item);
					}
					if(this.values) this.values.sort();
					items.sort(f);
					for(const item of items) yield item;
				}
				generator = generx(generator);
				if(this.stats||this.seek) generator = generator.withMemory(this);
				return generator();
			}
			proto.slice = function(begin=0,end) {
				const me = this;
				let generator = function*() {
					let i = 0;
					for (const item of me) {
						add(me,item);
						if(i<begin) { i++; continue; }
						if(i===end) return;
						i++;
						yield item;
					}
				}
				generator = generx(generator);
				if(this.stats||this.seek) generator = generator.withMemory(this);
				return generator();
			}
			proto.some = function(f) {
				let i = 0;
				for (const item of this) {
					if( f(item,i++,this)) return true;
				}
			}
			proto.values = function() {
				const values = [];
				for (const item of this) {
					add(this,item);
					if(item && typeof(item)==="object" && item instanceof Edge) {
						let value = item._value;
						if(isSoul(value)) {
							value = item.db.getObject(value);
							if(value!==undefined) values.push(value);
						} else {
							values.push(value);
						}
					} else if(item!==undefined) {
						values.push(item);
					}
				}
				return values;
			}
			proto.withMemory = function({stats,seek}={}) {
				const me = this;
				if(stats) {
					this.stats = stats;
					this.force = forceableStats(stats);
				}
				if(seek) this.seek = seek;
				Object.defineProperty(this,"resolved",{configurable:true,value: new Proxy([],{
					get(target,property) {
						if(me.length===0) { // force full resolution
							let next;
							do {
								 next = me.next();
							} while(next && !next.done);
						}
						return me[property];
					}
				})});
				if(this.force) {
					this.resolved[0]; // resolves entire generator
				} else if(seek) {
					return new Proxy(this,{
						get(target,property) {
							const index = parseInt(property),
								length = target.length;
							if(!isNaN(index) && index>=length) {
								let i = length - 1;
								while(i++<index) {
									const next = target.next();
									if(next && next.done) break;
								}
								return target[index];
							}
							return target[property];
						}
					})
				}
				return this;
			}
		}
		const proxy = new Proxy(f,{
			apply(target,thisArg,argumentsList) {
	      const base = target.call(thisArg,...argumentsList),
	       basenext = base.next;
	      let generator = base,
	      	length = 0;
	      base.next = function next() {
	       const next = generator===base
	         ? basenext.call(base) // generator is the original one
	         : generator.next(); // generator is the reset one
	         if(next instanceof Promise) {
	        	 const l = length;
	        	 if(base.resolved) base[l] = next;
	        	 next.then(next => {
	        		 if(!next.done) {
	        			 if(base.resolved) {
		        				if(base.stats) computeStats(base.stats,next.value);
		        				base[l] = next.value;
		        			}
	        			 length++;
	        		 }
	        		 base.done = next.done;
	        		 return next.value;
	        	 })
	        	 next.catch((e) => {
	        		 base.done = true;
	        		 console.log(e);
	        		 throw e;
	        	 })
	         } else {
	        	 if(!next.done) {
	        		 if(base.resolved) {
		        			if(this.stats) computeStats(this.stats,next.value);
	        			 	base[length] = next.value;
		        		 }
	        		 length++;
	        	 }
	        	 base.done = next.done;
	        }
	        return next;
	      }
	    	Object.defineProperty(base,"length",{get:function() { return length}});
	      // define reset to use the original arguments to create
	      // a new generator and assign it to the generator variable
	      Object.defineProperty(generator,"reset",{
	        enumerable:false,
	        value: () => 
	          {
	          	generator =  target.call(thisArg,...argumentsList);
	          	Object.defineProperty(target,"generator",{enumerable:false,configurable:true,value:generator});
	          	delete base.done;
	          	if(base.stats) resetStats(base.stats)
	          	while(length) {
	          		delete this[length-1];
	          		length--;
	          	}
	          	// need to reset stats
	          }
	      });
	      // return the generator, which now has a reset method
	      return generator;
	    }
		});
		return proxy;
	}
