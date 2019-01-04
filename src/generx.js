
	//Add every, forEach, map, reduce, some, etc. capability to generators
export function generx(f) {
		const generator = f(""),
			proto = Object.getPrototypeOf(generator),
			async = Object.getPrototypeOf(async function* () {}()).constructor===proto.constructor;
		if(async) {
			proto.every = async function(f) {
				let i = 0;
				for(;this.length>=0 && !this.done;i++) {
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
				for(;this.length>=0 && !this.done;i++) {
					const item = await this[i];
					if(!this.done && await f(item,i,this)) return item;
				}
				for await(const item of this) {
					if(await f(item,i++,this)) return item;
				}
			}
			proto.findIndex = async function(f) {
				let i = 0;
				for(;this.length>=0 && !this.done;i++) {
					const item = await this[i];
					if(!this.done && await f(item,i,this)) return i;
				}
				for await(const item of this) {
					if(await f(item,i,this)) return i;
					i++;
				}
			}
			proto.forEach = async function(f) {
				for(let i=0;this.length>=0 && !this.done;i++) {
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
				for(;this.length>=0 && !this.done;i++) {
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
				for(;this.length>=0 && !this.done;i++) {
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
					for(;i<me.length;i++) {
						yield i;
					}
					for await(const item of me) {
						yield i;
						i++;
					}
				}
				generator = enhanceGenerator(generator);
				return generator();
			}
			proto.lastIndexOf = async function(value) {
				let i = 0,
					last = -1;
				for(;this.length>=0 && !this.done;i++) {
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
				for(;this.length>=0 && !this.done;i++) {
					const item = await this[i];
					if(!this.done) result.push(await f(item,i,this));
				}
				for await(const item of this) {
					result.push(await f(item,i++,this));
				}
				return result;
			}
			proto.reduce = async function(f,accum) {
				let initialized = accum!==undefined,
					i = 0;
				for(;this.length>=0 && !this.done;i++) {
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
					for(;me.length>=0 && !me.done;i++) {
						const item = await me[i];
						if(!me.done) items.unshift(item);
					}
					for await(const item of me) {
						items.unshift(item);
					}
					for(const item of items) yield item;
				}
				generator = enhanceGenerator(generator);
				return generator();
			}
			proto.sort = function(f) {
				const me = this;
				let generator = async function*() {
					const items = [];
					for(;me.length>=0 && !me.done;i++) {
						const item = await me[i];
						if(!me.done) items.push(item);
					}
					for await(const item of me) {
						items.push(item);
					}
					items.sort(f);
					for(const item of items) yield item;
				}
				generator = enhanceGenerator(generator);
				return generator();
			}
			proto.slice = function(begin=0,end) {
				const me = this;
				let generator = async function*() {
					let i = 0;
					for(;me.length>=0 && !me.done;i++) {
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
				return generator();
			}
			proto.some = async function(f) {
				let i = 0,
					length = this.length;
				for(;this.length>=0 && !this.done;i++) {
					const item = await this[i];
					if(!this.done && await f(item,i,this)) return true;
				}
				for await(const item of this) {
					if(await f(item,i++,this)) return true;
				}
			}
			proto.values = async function() {
				const values = [];
				for(;this.length>=0 && !this.done;i++) {
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
			proto.withMemory = function() {
				Object.defineProperty(this,"length",{get:function() { return values.length}});
				const values = [],
					proxy = new Proxy(this,{
						get(target,key) {
							const value = target[key];
							if(key==="next") {
								return async function next() {
										const result = await value.call(target.generator);
										if(result.done) {
											target.done = true;
										} else {
											values.push(result.value);
										}
										return result;
								}
							}
							if(typeof(key)==="string" || typeof(key)==="number") {
								const index = parseInt(key);
								if(!isNaN(index)) {
									if(index<values.length) return values[index];
									let delta = (index - values.length) + 1,
										value;
									while(delta--) {
										value = target.next().then(result => {
											if(result.done) {
												target.done = true;
											} else {
												values.push(result.value);
											}
											return result.value;
										});
									}
									return value;
								}
							}
							return value;
						}
					});
				return proxy;
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
				generator = enhanceGenerator(generator);
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
				generator = enhanceGenerator(generator);
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
				generator = enhanceGenerator(generator);
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
				generator = enhanceGenerator(generator);
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
			proto.withMemory = function() {
				Object.defineProperty(this,"length",{get:function() { return values.length}});
				const values = [],
					proxy = new Proxy(this,{
						get(target,key) {
							const value = target[key];
							if(key==="next") {
								return function next() {
										const result = value.call(target.generator);
										if(result.done) {
											this.done = true;
										} else {
											values.push(result.value);
										}
										return result;
								}
							}
							if(typeof(key)==="string" || typeof(key)==="number") {
								const index = parseInt(key);
								if(!isNaN(index)) {
									if(index<values.length) return values[index];
									let delta = (index - values.length)  + 1,
										result = {};
									while(delta--) {
										result = target.generator.next();
										if(result.done) {
											this.done = true;
											return result.value;
										} else {
											values.push(result.value);
										}
									}
									return result.value;
								}
							}
							return value;
						}
					});
				return proxy;
			}
		}
		const proxy = new Proxy(f,{
			apply(target,thisArg,argumentsList) {
	      const base = target.call(thisArg,...argumentsList),
	       basenext = base.next;
	      let generator = base;
	      base.next = function next() {
	       return generator===base
	         ? basenext.call(base) // generator is the original one
	         : generator.next(); // generator is the reset one
	      }
	      // define reset to use the original arguments to create
	      // a new generator and assign it to the generator variable
	      Object.defineProperty(generator,"reset",{
	        enumerable:false,
	        value: () => 
	          {
	          	generator =  target.call(thisArg,...argumentsList);
	          	Object.defineProperty(target,"generator",{enumerable:false,configurable:true,value:generator});
	          	delete base.done;
	          }
	      });
	      // return the generator, which now has a reset method
	      return generator;
	    }
		});
		return proxy;
	}
