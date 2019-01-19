import {enhanceGenerators} from "./enhanceGenerators.js";

import {getNextEdge} from "./getNextEdge.js";

import {clone} from "./clone.js";

import {mergeObjects} from "./mergeObjects.js";

import {isSoul} from "./isSoul.js";

export class Edge {
	static parse(string) {
		return JSON.parse(string,(_,value) => {
		  if(typeof(value)==="string" && value.indexOf("Function@")===0) {
		  	return Function("return " + value.substring(9))();
		  }
		  return value;
		});
	}
	static stringify(edge) {
		return JSON.stringify(edge,(_,value) => {
		  if(typeof(value)==="function") {
		  	return "Function@" + value;
		  }
		  return value;
		});
	};
	constructor(db,config) {
		config || (config={path:"/"});
		Object.assign(this,config);
		if(!this.path) this.path = "/";
		
		if(!this.edges) this.edges = {};
		if(!this.acls) this.acls = {
				r: { //read
					a: {}, // allow
					d: { } // deny
				},
				w: { // write
					a: {}, // allow
					d: {} // deny
				}
		}
		Object.defineProperty(this,"db",{enumerable:false,configurable:false,writable:false,value:db});
		enhanceGenerators(this,["get"],{all:[this.merge,this.patch,this.value,this.on,this.off,this.secure,this.remove]});
		if(db.cache) {
			db.cache.setItem(this.path,this);
		}
	}
	async aclRead(value) {
		const acls = this.acls,
			id = await this.db.options.authenticate();
	// explicitly allowed || all allowed and not denied || no ACL
		if(acls.r.a[id] || (acls.r.a["*"] && !acls.r.d[id]) || (Object.keys(acls.r.a).length===0 && Object.keys(acls.r.d).length===0)) return value;
	}
	async aclWrite(value,oldValue) {
		const acls = this.acls,
		id = await this.db.options.authenticate();
		// explicitly allowed || all allowed and not denied || no ACL
		if(acls.w.a[id] || (acls.w.a["*"] && !acls.w.d[id]) || (Object.keys(acls.w.a).length===0 && Object.keys(acls.w.d).length===0)) return value;
		if(oldValue===undefined) {
			const error = new Error(`Write access denied: ${this.path}`);
			if(this.db.options.onError) this.db.options.onError(error)
			else throw error;
		}
		return oldValue;
	}
	async add(value,options) {
		const oldvalue = Array.isArray(this._value) ? this._value.slice() : this._value;
		if(!Array.isArray(this._value)) {
			if(this._value===undefined) this._value = [];
			else this._value = [this._value];
		}
		const len = this._value.length;
		if(!this._value.some(item => deepEqual(item,value))) this._value.push(value);
		if(this.onchange && this._value.length!==len) {
			this._value = this.callbacks(this.onchange,this._value,oldvalue);
		}
		await this.save(options);
		return this;
	}
	async callback(callbacks,value,previousvalue) {
		if(callbacks) {
			for(const f of callbacks) {
				const replacementvalue = await f.call(this,value,previousvalue);
				if(replacementvalue===undefined) break;
				if(typeof(replacementvalue)!=="object" || !(replacementvalue && replacementvalue instanceof Promise)) {
					value = replacementvalue;
				}
			}
		}
		return value;
	}
	compile(key) {
		if(typeof(key)==="string") {
			if(key==="$_") {
				return {key:() => true};
			}
			if(key[0]==="/") {
				try {
					const regexp = Function("return " + key)();
					return {key:(key) => {
							return regexp.test(key);
						}
					}
				} catch(e) {
					; // ignore
				}
			}
			const parts = key.split(":");
			let result = key,
				condition = parts[0].trim();
			if(condition==="*") {
				result = {key:() => true};
			} else if(condition[0]==="(" || condition.indexOf("function ")===0) {
				result = {key:Function(`return ${condition}`).call(this)};
			} else if (condition[0]==="$" && this.db.predicates[condition.substring(0,condition.indexOf("("))]) {
				const op = condition.substring(0,condition.indexOf("(")),
					value = condition.substring(condition.indexOf("(")+1,condition.lastIndexOf(")"));
				result = {key: Function(`return value => this.db.predicates["${op}"](value,${value})`).call(this)};
			} else {
				for(const op of ["<=","<","===","==","!==","!=",">=",">"]) { // > must come after >=
					if(condition.indexOf(op)===0) {
						result = {key:Function(`return value => value ${condition}`).call(this)};
						break;
					}
				}
			}
			if(parts.length===1) return result;
			if(typeof(result)!=="object") result = {key:parts[0]};
			condition = parts[1].trim();
			if(condition.indexOf("=>")===0) {
				result.test = Function(`return ${parts[0]} => ${parts[0]}${condition}`).call(this);
				return result;
			}
			if(condition[0]==="(" || condition.indexOf("function ")===0) {
				result.test = Function(`return ${condition}`).call(this);
				return result;
			}
			if(condition[0]==="$" && this.db.predicates[condition.substring(0,condition.indexOf("("))]) {
				const op = condition.substring(0,condition.indexOf("(")),
					value = condition.substring(condition.indexOf("(")+1,condition.lastIndexOf(")"));
				result.test = Function(`return value => this.db.predicates["${op}"](value,${value})`).call(this);
				return result;
			} 
			for(const op of ["<=","<","===","==","!==","!=",">=",">"]) {
				if(condition.indexOf(op)===0) {
					result.test = Function(`return value => value ${condition}`).call(this);
					return result;
				}
			}
			result.test = Function(`return value => value===value`).call(this);
			return result;
		}
		return key;
	}
	async delete(options={}) { // deletes value not the node
		let value = await this.callback(this.ondelete,undefined,this._value);
		if(value===undefined) return this;
		value = await this.callback(this.onchange,undefined,this._value);
		if(value===undefined) return this;
		delete this._value;
		await this.save(options);
		return this;
	}
	async* get(key,test,path=[]) {
		if(key==="..") {
			yield await this.parent();
		} else {
			const type = typeof(key);
			if(test===undefined && type==="string") {
				const compiled = this.compile(key);
				if(compiled!==key) {
					key = compiled.key;
					test = compiled.test;
				}
			}
			if(typeof(key)==="function") {
				for(const edgekey in this.edges) {
					let value = edgekey;
					if(isSoul(value)) {
						const object = await this.db.getObject(value);
						if(object) value = object;
						else continue;
					} else {
						try {
							value = JSON.parse(value);
						} catch(e) {
							;
						}
					}
					if(await key.call(this,value)) {
						if(this.yield) {
							for(const edge of this.yield) {
								if(this.aclRead(true)) yield edge;
							}
							delete this.yield;
							return;
						} else {
							const next = await getNextEdge(this,edgekey);
							if(test && !test(next._value)) return;
							if(next) {
								if(!this.db.options.cache) {
									await this.save({force:true});
								}
								await this.callback(this.onextend,next);
								if(path.length===0) {
									if(next.aclRead(true)) yield next;
								} else if(path.length===1 && path[0]===key && isSoul(key)) {
									path.pop();
									if(next.aclRead(true)) yield next;
								} else {
									const nextpath = path.slice();
									yield* next.get(nextpath.shift(),undefined,nextpath);
								}
							}
						}
					}
				}
			} else {
				const exists = this.edges[key];
				this.edges[key] = true;
				if(!this.db.options.cache) {
					await this.save({force:true});
				}
				const next = await getNextEdge(this,key);
				if(!exists) await this.callback(this.onextend,next);
				if(test && !test(next._value)) return;
				if(path.length===0) {
					if(next.aclRead(true)) yield next;
				} else if(path.length===1 && path[0]===key && isSoul(key)) {
					path.pop();
					if(next.aclRead(true)) yield next;
				} else {
					const nextpath = path.slice();
					yield* next.get(nextpath.shift(),undefined,nextpath);
				}
			}
		}
	}
	get key() {
		return this.path.split("/").pop();
	}
	async merge(value,options) {
		return this.value(value,true,options);
	}
	async on(callbacks) {
		for(const event in callbacks) {
			const ename = "on"+event;
			if(!this[ename]) {
				this[ename] = [];
			}
			if(!this[ename].includes(callbacks[event])) this[ename].push(callbacks[event])
		}
		if(!this.db.cache) await this.save({force:true});
		return this;
	}
	async off(callbacks) {
		for(const event in callbacks) {
			const ename = "on"+event;
			if(this[ename]) this[ename].map(callback => callbacks[event]+""!==callback+"");
		}
		if(!this.db.cache) await this.save({force:true});
		return this;
	}
	once(callback,options={wait:0}) {
		setTimeout(callback,options.wait,this._value,this);
		return this;
	}
	async put(value,{indexDates,expireAt,atomic,indexAllObjects}=this.db.options) {
		if(value && typeof(value)==="object" && indexAllObjects) {
			value = await this.db.putItem(value,{force:true,indexDates,expireAt,atomic});
		}
		if((value && typeof(value)==="object" && value["#"] ? value["#"] : value)!==this._value) {
			if(indexAllObjects) {
				const oldvalue = isSoul(this._value) ? await this.db.getObject(this._value,{read:true}) : this._value;
				if(!deepEqual(value,oldvalue)) {
					value = await this.callback(this.onchange,value,oldvalue);
				}
			} else {
				value = await this.callback(this.onchange,value,this._value);
			}
			this._value = value && typeof(value)==="object" && value["#"] ? value["#"] : value;
			await this.save({force:true});
		}
		return value;
	}
	async parent(read) {
		let edge;
		if(!read && this.db.cache) {
			edge = this.db.cache.getItem(this.parentKey) || await this.db.options.storage.getItem(this.parentKey);
		} else {
			edge = await this.db.options.storage.getItem(this.parentKey);
			if(edge) {
				edge = Object.assign(Object.create(Edge.prototype),Edge.parse(edge));
				Object.defineProperty(edge,"db",{value:this.db});
				if(this.db.cache) this.db.cache.setItem(this.parentKey,edge) 
			}
		}
		//if(edge) return await this.db.Edge(typeof(edge)==="string" ? JSON.parse(edge) : edge,read);
		return edge;
	}
	async patch(value,{indexDates,indexAllObjects,expireAt,atomic}=this.db.options) {
		if(value && typeof(value)==="object") {
			let oldvalue = isSoul(this._value) ? await this.db.getObject(this._value) : this._value;
			let changes,copy;
			if(oldvalue && typeof(oldvalue)==="object") {
				copy = clone(oldvalue);
				if(oldvalue._) this.db.bless(copy,oldvalue._.atomic,oldvalue._);
				changes = mergeObjects(copy,value);
			}
			if(changes) {
				const tobe = oldvalue||(Array.isArray(value) ? [] : {});
				oldvalue = clone(oldvalue);
				if(copy._) this.db.bless(oldvalue,copy._.atomic,copy._,expireAt);
				mergeObjects(tobe,value)
				value = await this.callback(this.onchange,tobe,oldvalue);
				if(value._ && value._.version) {
					this.db.version(value,{expireAt})
				}
				if(isSoul(this._value) && indexAllObjects) {
					value = await this.db.putItem(value,{force:value._||false,indexDates,expireAt,atomic});
				}
			}
		}
		this._value = value && typeof(value)==="object" && value["#"] ? value["#"] : value;
		await this.save({force:true});
		return value;
	}
	get parentKey() {
		const parts = this.path.split("/");
		parts.pop();
		return parts.length>0 ? parts.join("/") : "/";
	}
	async remove() {
		const parent = await this.parent();
		if(parent) {
			await parent.removeEdge(this.key(),this);
		}
	}
	async removeEdge(key,edge) {
		if(edge) {
			if(this.onremove && !this.callback(this.onremove,edge)) return;
		}
		delete this.edges[key];
		await this.save({force:true});
		await this.db.options.storage.removeItem(this.path+"/"+key);
		if(Object.keys(this.edges).length===0) {
			const parent = await this.parent();
			if(parent) await parent.removeEdge(this.key);
		}
	}
	async save({force,callback}={}) {
		if(!force && !this.dirty) return this;
		let edge = this;
		const parent = await edge.parent(),
			existingparent = await edge.parent(true);
		if(existingparent && !existingparent.edges[edge.key]) {
			edge = await edge.callback(parent.onextend,this);
		}
		if(!edge || typeof(edge)!=="object") return;
		delete edge.dirty;
		let promise = edge.db.options.storage.setItem(edge.path,Edge.stringify(edge));
		if(!promise || typeof(promise)!=="object" || !(promise instanceof Promise)) promise = Promise.resolve();
		promise.catch(e => { edge.dirty=true; throw e; });
		if(callback) {
			promise.then(() => callback({ok:true}))
			promise.catch(err => callback({err}));
		}
		await promise;
		if(parent) {
			parent.edges[edge.key] = true;
			await parent.save({force,callback});
		}
		return this;
	}
	async secure({read,write,expires},...entities) {
		entities.forEach(entity => {
			const id = typeof(entity)==="string" ? entity : entity["#"];
			if(read) {
				delete this.acls.r.d[id];
				this.acls.r.a[id] = expires && typeof(expires)==="object" && expires instanceof Date ? expires.getTime() : true;
			} else {
				delete this.acls.r.a[id];
				this.acls.r.d[id] = expires && typeof(expires)==="object" && expires instanceof Date ? expires.getTime() : true;
			}
			if(write) {
				delete this.acls.w.d[id];
				this.acls.w.a[id] = expires && typeof(expires)==="object" && expires instanceof Date ? expires.getTime() : true;
			} else {
				delete this.acls.w.a[id];
				this.acls.w.d[id] = expires && typeof(expires)==="object" && expires instanceof Date ? expires.getTime() : true;
			}
		});
		await this.save();
		return this;
	}
	async value(value,merge,{indexDates,indexAllObjects,expireAt,atomic}=this.db.options) {
		if(arguments.length>0) {
			if(this._value===undefined) {
				if(this.onnew && !this.callback(this.onnew,value)) return;
			}
			if(merge && value && typeof(value)==="object") {
				value = await this.patch(value,{indexDates,indexAllObjects,expireAt,atomic});
			} else {
				value = await this.put(value,{indexDates,indexAllObjects,expireAt,atomic});
			}
			return value;
		}
		value = this._value;
		if(isSoul(value)) value = await this.db.getObject(value);
		value =  this.callback(this.onget,value);
		return value;
	}
}