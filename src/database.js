import {cartesianAsyncGenerator} from "./cartesianAsyncGenerator.js";

import {ConstraintViolationError} from "./errors.js";

import {deepEqual} from "./deepEqual.js";

import {Edge} from "./Edge.js";

import {enhanceGenerators} from "./enhanceGenerators.js";

import {GeoPoint} from "./GeoPoint.js";

import {generx} from "./generx.js";

import {mergeObjects} from "./mergeObjects.js";

import {genId} from "./genId.js";

import {isSoul} from "./isSoul.js";

import {LFRUStorage} from "./LFRUStorage.js";

import {MemoryStorage} from "./MemoryStorage.js";

import {predicates} from "./predicates.js";

import {stemmer} from "./stemmer.js";

import {Referencer} from "./referencer.js";

Referencer.register(GeoPoint);

import {tokenize} from "./tokenize.js";

import {trigrams} from "./trigrams.js";

//sql-like

import {Delete} from "./sql-like/delete.js";

import {Insert} from "./sql-like/insert.js";

import {Select} from "./sql-like/select.js";

import {Update} from "./sql-like/update.js";

import {STOPWORDS} from "./stopwords.js";

const indexableDate = (date,full,object) => { // create a datelike object with extra keys for indexing
		if(full==="full") {
			return {
				time: date.getTime(),
				day: date.getUTCDay(),
				date: date.getUTCDate(),
				hours: date.getUTCHours(),
				milliseconds: date.getUTCMilliseconds(),
				minutes: date.getUTCMinutes(),
				month: date.getUTCMonth(),
				seconds: date.getUTCSeconds(),
				year: date.getUTCFullYear()
			}
		}
		return {
			time: date.getTime()
		}
	},
	flatten = (object) => { // flatten and Array or a regular object into a single level array
		let objects = [];
		for(const key in object) {
			const value = object[key],
				type = typeof(value);
			if(value && type==="object" && key!=="_") {
				if(!value.atomic) objects = objects.concat(flatten(value));
				if(value["#"]) object[key] = value["#"];
			}
		}
		if(object["#"]) objects.push(object);
		return objects;
	},
	removeKeys = (object,keys) => { // recursively remove keys from an object
		let removed;
		Object.keys(object).forEach(key => {
			if(keys.includes(key)) {
				if(!removed) removed = {};
				removed[key] = object[key];
				delete object[key];
			}
			if(object[key] && typeof(object[key])==="object") {
				const childremoved = removeKeys(object[key],keys);
				if(childremoved) {
					if(!removed) removed = {};
					removed[key] = childremoved;
				}
			}
		})
		return removed;
	},
	resolveFor = (db,object,resolvers={}) => {
		Object.keys(resolvers).forEach(resolverKey => {
			if(typeof(resolvers[resolverKey])==="object") {
				if(resolvers[resolverKey].$compute) {
					object[resolverKey] = resolvers[resolverKey].$compute.call(object);
				}
				if(resolvers[resolverKey].$default && object[resolverKey]==null) {
					object[resolverKey] = resolvers[resolverKey].$default;
				}
				const value = object[resolverKey];
				if(value && typeof(value)==="object") {
					resolveFor(value,resolvers[resolverKey]);
				}
				if(resolvers[resolverKey].$valid) {
					if(typeof(resolvers[resolverKey].$valid)==="function") {
						resolvers[resolverKey].$valid(value,resolverKey,object);
					} else {
						try {
							db.predicates.$valid.call(value,resolvers[resolverKey].$valid);
						} catch(error) {
							error = new ConstraintViolationError(`${resolverKey} ${error.message}`);
							if(resolvers[resolverKey].$valid.onError) {
								resolvers[resolverKey].$valid.onError(error,value,resolverKey,object);
							} else {
								throw error;
							}
						}
					}
				}
			}
		});
		Object.keys(object).forEach(key => {
			if(resolvers[key] && typeof(resolvers[key])==="object") {
				if(object[key] && typeof(object[key])==="object") {
					object[key] = resolveFor(db,object[key],resolvers[key]);
				}
				if(resolvers[key] && resolvers[key].$as) {
					object[resolvers[key].$as] = object[key];
					delete object[key];
				}
			}
		})
		return object;
	}

const SCHEMA = {
	Array:{ctor:Array},
	Date:{ctor:Date},
	Function:{ctor:Function},
	Object:{ctor:Object},
	GeoPoint:{ctor:GeoPoint}
}

const MEMORYSTORAGE = new MemoryStorage();

export class Database {
	static async(f) {
		return function(...args) {
			setTimeout(() => f(...args));
			if(args.length===0) return true;
			return args[0];
		}
	}
	static get memoryStorage() {
		return MEMORYSTORAGE;
	}
	static get predicates() {
		return predicates;
	}
	constructor(options={}) {
		enhanceGenerators(this,["get","match","matchObjects","matchPath"],{all:[Edge.prototype.value,Edge.prototype.on,Edge.prototype.secure,Edge.prototype.patch,Edge.prototype.put]});
		options = Object.assign({},options);
		if(!options.authenticate) options.authenticate = () => true;
		if(!options.storage) options.storage = MEMORYSTORAGE;
		this.schema = Object.assign({},SCHEMA,options.schema);
		this.predicates = Object.assign({},predicates,options.predicates);
		if(options.cache) this.cache = typeof(options.cache)==="object" ? options.cache : new LFRUStorage();
		Object.defineProperty(this,"options",{value:options});
		Object.freeze(this.options);
		if(options.onready) this.onready = options.onready;
		this.remote = options.remote||[];
		this.initialized = new Promise(async resolve => {
			const storage = options.storage;
			if(options.clear) await this.clear();
			if(options.authenticate) await options.authenticate.call(this);
			const root = await storage.getItem("/");
			if(!root) await storage.setItem("/",Edge.stringify(new Edge(this)));
			await this.secure();
			this.expire();
			if(options.listen) this.listen(options.listen,options);
			resolve();
			if(this.onready) this.onready.call(this);
		});
	}
	arbitrate(updated,current) {
		//console.log(updated)
		const usoul = updated._,
			utime = usoul.modifiedAt.getTime(),
			ucreated = usoul.createdAt.getTime(),
			csoul = current._,
			ctime = csoul.modifiedAt.getTime(),
			ccreated = csoul.createdAt.getTime(),
			now = Date.now();
	// if the time on the updated objects is the same as the time on the current version
	// and the version of the update is the same as the current version
	// and the update was originally created the same time as the current version
	// and the updated object is identical to the current version of the object
	// then just return, no update is necessary
	if(utime===ctime && usoul.version===csoul.version
			&& usoul.createdAt===csoul.createdAt && deepEqual(updated,current)) {
		return;
	}
	// if the time of the update is in the future
	// then schedule it for the future to avoid real time skew or time spoofing
	if(utime - now > 0) {
		setTimeout(() => this.putItem(updated),utime - now);
		return; 
	}
	// if the time on the updated object is before the time on the current version
	// then just return, no update necessary because current version is more recent
	if(utime<ctime) {
		return;
	}
	// if the time on the updated object is after the time on the current version
	// then update the version of the updated soul to the maximum version and use it
	if(utime>ctime) {
		usoul.version = Math.max(usoul.version,csoul.version);
		return updated;
	}
	// if version and update time are the same (very rare)
	if(usoul.version===csoul.version && utime===ctime) {
		// if update is more recently created
		// return the object to be used as the update
		if(ucreated>ccreated) { 
			return updated;
		}
		// if current is more recently created
		// then just return, no update necessary 
		if(ccreated>ucreated) { 
			return; // throw away
		}
		// if key is lexically greater (arbitrary but consistent approach)
		// then update the version of the updated soul to the maximum version and use it
		if(usoul["#"]>=csoul["#"]) { 
			usoul.version = Math.max(usoul.version,csoul.version); 
			return updated; // use the update (abitrary but consistent approach)
		}
	}
	// otherwise something very odd has happened
	// e.g. different version numbers but same update or create times
	// ignore the update

	}
	async bless(json,atomic=json._?json._.atomic:undefined,metadata=json["_"],expireAt) {
		if(!metadata || metadata["#"]!==json["#"]) {
			if(!metadata) metadata = {};
			json._ || Object.defineProperty(json,"_",{enumerable:false,configurable:true,writable:false,value:metadata}); // writable:false
			//if(!metadata["#"]) metadata["#"] = json.constructor.name+"@"+(json instanceof Date ? json.getTime() : genId());
			if(!metadata["#"]) metadata["#"] = Referencer.generateId(json);
			if(atomic) metadata.atomic = true;
			if(expireAt) metadata.expireAt = expireAt;
			Object.defineProperty(json,"#",{enumerable:false,configurable:true,get() { return metadata["#"]; },set() {;}});
			if(!metadata.version) this.version(json,{atomic:true});
		}
		for(const key in metadata) {
			if(key!=="#") {
				const value = metadata[key];
				if(isSoul(value)) metadata[key] = await this.getObject(value);
			}
		}
		if(!atomic) {
			for(const key in json) {
				key==="_" || !json[key] || typeof(json[key])!=="object" || await this.bless(json[key]);
			}
		}
		return json;
	}
	async clear() {
		const storage = this.options.storage;
		await storage.clear();
		await storage.setItem("/",JSON.stringify(await this.Edge()));
	}
	compile(value,{indexDates,inline}={}) {
		if(value==="*") return () => true;
		const type = typeof(value);
		if(type==="string") {
			if(inline && value.indexOf("=>")>1) {
				try {
					const result = Function("return " + value)(),
						type = typeof(result);
					if(type==="function") {
						return result;
					}
					if(type==="object" && result instanceof RegExp) {
						return (arg) => result.test(arg);
					}
				} catch(e) {
					;
				}
			}
			return value;
		}
		if(value && type==="object") {
			if(value instanceof Date) {
				return indexDates ? indexableDate(value,indexDates) : "Date@"+value.getTime();
			}
			//if(value instanceof Coordinates) {
			//	
			//}
			const keys = Object.keys(value),
				pname = keys.length>0 && keys[0][0]==="$" ? keys[0] : null,
				test = this.predicates[pname],
				arg = value[pname];
				let tokens;
				if(typeof(arg)==="string" && arg!=="$true!") {
					tokens = {};
					tokens.words = tokenize(arg).filter(token => !STOPWORDS.includes(token));
					tokens.stems = tokens.words.map(token => stemmer(token)),
					tokens.trigrams = trigrams(tokens.stems).filter(gram => !STOPWORDS.includes(gram));
				}
				if(pname && test) {
					if(keys.filter(key => key[0]==="$").length>1) throw new JOQULARTypeError(`Property values can contain only one predicate test: ${JSON.stringify(keys)}`);
					if(test.length<=2) return Function("test","arg","tokens",`return function ${pname}(x) { return arg==="$true!" || test.bind(this)(x,arg,tokens); }`)(test,arg,tokens);
					if(!Array.isArray(arg)) throw new JOQULARTypeError(`Predicate ${pname} expected array as argument and recieved ${arg}`);
					return Function("test","arg",`return function ${pname}(x) { return test.bind(this)(x,...arg); }`)(test,arg);
				}
		}
		return value;
	}
	delete() {
		return new Delete(this);
	}
	async Edge(config={},force) {
		let edge;
		if(!force && this.cache) {
			edge = this.cache.getItem(config.path||"/");
		}
		if(edge) return edge;
		edge = await this.options.storage.getItem(config.path||"/");
		if(edge) {
			edge = Object.assign(Object.create(Edge.prototype),Edge.parse(edge));
			Object.defineProperty(edge,"db",{value:this});
			if(this.cache) {
				this.cache.setItem(config.path||"/",edge);
			}
			return edge;
		}
		edge = new Edge(this,config);
		if(!this.cache) {
			this.options.storage.setItem(config.path||"/",Edge.stringify(edge));
		}
		return edge;
	}
	expire(interval) {
			interval || (interval=this.options.expirationInterval);
			const expireData = async () => {
				if(interval>0) {
					const start = Date.now();
					for await(const object of this.match({expireAt:{time:{$lte:start}}})) {
						//console.log("deleting ",id);
						await this.removeItem(object["#"]);
					}
					const end = Date.now(),
						duration = end - start;
						if(duration>=interval) {
							this.expire();
						} else {
							setTimeout(() => this.expire(),interval-duration);
						}
				}
			};
		expireData();
	}
	async* get(path) {
		if(typeof(path)==="string" && (path.startsWith("http://") || path.startsWith("https://"))) {
			const response = await fetch(path),
				value = response.json();
			if(value.edges && typeof(value.edges)==="object") {
				value.path = path;
				yield await this.Edge(value);
			} else {
				yield await this.Edge({path,value});
			}
			return;
		}
		const parts = Array.isArray(path) ? path : path.split("/");
		if(parts[0]==="") parts.shift();
		if(parts.length===1 && isSoul(parts[0])) {
			yield {edges:{[parts[0]]:true}};
			return;
		}
		const root = await this.Edge();
		for await(const last of root.get(parts.shift(),undefined,parts)) {
			yield last;
		}	
	}
	get GeoPoint() {
		return GeoPoint;
	}
	async getItem(key,{local}={}) {
		this.remote.forEach(remote => {
			if(remote.source) {
				remote.server.getItem(key).then(value => {
					if(value!==undefined) {
						this.setItem(key,value,{local:true});
					}
				})
			}
		})
		const data = await this.options.storage.getItem(key);
		if(data!=null) {
			return await this.restore(JSON.parse(data));
		}
	}
	async getObject(id,{partial,read,nocache,local}={}) {
		if(!id) return;
		let object = Referencer.dereference(id);
		if(Referencer.isValueKeyed(object)) {
			return object;
		}
		let remoted;
		if(!local) {
			this.remote.forEach(remote => {
				if(remote.source) {
					remoted || new Promise(resolve => remoted = resolve);
					remote.server.getObject(id).then(async object => {
						if(object!=null) {
							this.putItem(await this.bless(object),{local:true,nocache});
							remoted(object);
						}
					})
				}
			})
		}
		if(!read) {
			object = this.cache ? this.cache.getItem(id) : undefined;
			if(object) {
				return await this.restore(object,{partial,read}); // limit down to partial
			}
		}
		let data = await this.options.storage.getItem(id);
		if(!data) {
			if(remoted) return await remoted;
		} else {
			object = await this.restore(typeof(data)==="string" ? JSON.parse(data) : data,{partial,read});
			return !nocache && this.cache ? this.cache.setItem(id,object) : object;
		}
	}
	getPaths(value,{ctor=value.constructor,indexDates}={},path,allpaths=[],parent={},schema,key) { // gets paths for both regular objects and match patterns
		const options = this.options,
			type = typeof(value);
		if(type==="string") {
			if(isSoul(value)) {
				path.push(value);
				allpaths.push(path);
			} else {
				const currentpath = path.slice();
				path.push(`"${value}"`);
				allpaths.push(path);
				if((!schema || (options.explicitSearchable && schema.searchable[key]) || (!options.explicitSearchable && schema.searchable[key]!==false)) && value.indexOf(" ")>=0) {
					const tokens = tokenize(value).filter(token => !STOPWORDS.includes(token)),
						stems = tokens.map(token => stemmer(token)),
						tris = trigrams(stems).filter(gram => !STOPWORDS.includes(gram));
					currentpath.push("$fulltext");
					stems.forEach(stem => {
						const nextpath = currentpath.slice();
						nextpath.push(`"${stem}"`);
						nextpath.push(parent["#"]);
						allpaths.push(nextpath);
					});
					tris.forEach(tri => {
						const nextpath = currentpath.slice();
						nextpath.push(`"${tri}"`);
						nextpath.push(parent["#"]);
						allpaths.push(nextpath);
					});
				}
			}
		} else if(value && type==="object") {
				schema = this.getSchema(value);
				path || (path=[typeof(ctor)==="string" ? ctor : ctor.name]);
				if(value["#"] && allpaths.length>0) {
					const nextpath = path.slice();
					nextpath.push(value["#"]);
					allpaths.push(nextpath);
				}
				const keys = Object.keys(value);
				for(const key of keys) { // this will also handle Arrays
					if(!schema || (options.explicitIndex && (schema.index[key])) || (options.explicitSearchable && (schema.searchable[key])) || (!options.explicitIndex && schema.index[key]!==false)) {
						const nextpath = path.slice(),
							part = this.compile(value[key],{indexDates,inline:this.options.inline}), // handle predicates, e.g. ${eq: 2}
							type = typeof(part);
						if(type!=="undefined") {
							if(value[key] instanceof Date && part && type==="object" && !(part instanceof Date)) {
								part[`Date@${value[key].getTime()}`] = value["#"];
							}
							if(key==="$self") {
								nextpath.push(part);
							} else {
								nextpath.push(this.compile(key,{indexDates,inline:this.options.inline})); // handle functions as keys, e.g. {[key => /someregexp/]: <somevalue>}
								this.getPaths(part,{indexDates},nextpath,allpaths,value,schema,key);
							}
						}
					}
				}
		} else {
			path.push(value);
			allpaths.push(path);
		}
		return allpaths;
	}
	getSchema(object) {
		const ctor = object.constructor,
			cname = ctor.name,
			spec = this.schema[cname],
			schema = spec && spec.schema ? spec.schema : ctor.schema; // this is not correct
			if(schema) {
				if(!schema.ctor) schema.ctor = ctor;
				return Object.assign({index:{},searchable:{},integrity:{},management:{},security:{},validation:{}},schema);
			}
	}
	async graph(object,{ctor,indexDates,leaf}={}) {
		const root = await this.Edge();
		for(let path of this.getPaths(object,{ctor,indexDates})) {
			if(leaf) path.push(leaf);
			const fullpath = path.slice();
			const key = path.shift();
			for await(const edge of root.get(key,undefined,path)) {	
				await edge.save();
			}
		}
		await root.save();
		return object;
	}
	insert(...objects) {
		return new Insert(this,objects);
	}
	join(...args) {
		const me = this,
			test = args.pop(),
			patterns = args;
		return (generx(async function*() {
			const generators = [];
			for(const pattern of patterns) {
				generators.push(() => me.match(pattern));
			}
			for await (const next of cartesianAsyncGenerator(...generators)) {
				if(test(next)) yield next;
			}
		})());
	}
	async* match(pathOrObject,{ctor,partial,read,local}={}) {
		//console.log("match",pathOrObject,{ctor,partial});
		const type = typeof(pathOrObject),
			found = {};
		//console.log(type);
		if(type==="string") {
			for await(const id of this.matchPath(pathOrObject,{partial,read})) {
				const object = await this.getObject(id,{partial:partial ? pathOrObject : null,read});
				if(object) {
					found[id] = true;
					yield object;
				}
			}
		} else if(pathOrObject && type==="object") {
			//console.log(pathOrObject)
			const resolvers = removeKeys(pathOrObject,["$as","$compute","$default","$valid"]);
			for await(const id of this.matchObjects(pathOrObject,ctor)) {
				//console.log(id)
				const object = await this.getObject(id,{partial:partial ? pathOrObject : null,read});
				if(object) {
					found[id] = true;
					yield resolveFor(this,object,resolvers);
				}
			}
		}
		if(!local) {
			const cursorid = Math.random();
			for(const remote of this.remote) {
				if(remote.source) {
					let object;
					do {
						object = await remote.server.match(cursorid,pathOrObject,{ctor,partial});
						if(object) {
							this.putItem(await this.bless(object),{local:true});
						}
					} while(object);
				}
			}
		}
	}
	async* matchObjects(object,ctor) {
		let ids;
		for(let path of this.getPaths(object,{ctor})) {
			let pathids;
			await this.get(path).forEach(edge => {
				if(!pathids) pathids = {};
				//union
				Object.assign(pathids,edge.edges);
			});
			if(!pathids) return;
			if(!ids) {
				ids = pathids;
			} else {
				let newids = {};
				// intersection
				for(const id in pathids) {
					if(ids[id]) newids[id] = id;
				}
				ids = newids;
			}
		}
		for(const id in ids) yield id;
	}
	async* matchPath(path) {
		let pathids;
		await this.get(path).forEach(edge => {
			if(!pathids) pathids = {};
			// union
			Object.assign(pathids,edge.edges);
		});
		if(!pathids) return;
		for(const id in pathids) yield id;
	}
	async putItem(object,{force,unique,indexDates,reactive,expireAt,atomic=object._?object._.atomic:undefined,source,local}=this.options) {
		const id = object["#"];
		if(id) {
			const existing = await this.getObject(id,{read:true,nocache:true,local:true});
			if(existing) {
				if(unique) throw new ConstraintViolationError(`${id} already exists`);
				object = this.arbitrate(object,existing);
				if(!object) return;
				const oldvalues = mergeObjects(existing,object);
				if(oldvalues) {
					await this.bless(oldvalues,true,existing._); // make it look like a full object
					for(const key in object._) existing._[key] = object._[key];
					object = existing;
					await this.ungraph(oldvalues,{leaf:id});
				}
				if(!force) this.version(object,{expireAt,atomic});
			}
		}
		await this.saveObject(object,{indexDates,expireAt,atomic,source,local});
		const target = Object.assign({},object);
		target._ = object._; // expose metadata
		for(const key of ["createdAt","expireAt","modifiedAt"]) {
			if(target._[key]) target._[key] = this.compile(target._[key]);
		}
		if(!local) {
			this.remote.forEach(remote => {
				if(remote.sink) {
					remote.server.putItem(target); // eliminates undefined values
				}
			})
		}
		await this.graph(object,{indexDates,leaf:object["#"]}); // save adds id if missing
		if(reactive) return this.reactor(object);
		return object;
	}
	reactor(object) {
		const db = this;
		return new Proxy(object,{
			get(target,property) {
				const value = target[property];
				if(value && typeof(value)==="object" && (!value._ || !value._.atomic)) {
					return db.reactor(value);
				}
				return value;
			},
			set(target,property,value) {
				const oldvalue = target[property];
				target[property] = value;
				// need to handle object values
				db.get(`${target.constructor.name}/${property}/${oldvalue}`).forEach(async edge => edge.removeEdge(target["#"]))
					.then(() => {
						db.get(`${target.constructor.name}/${property}/${value}`).forEach(async edge => {
								edge.edges[target["#"]] = true;
								await edge.save();
						});
				});
				return true;
			}
		});
	}
	async removeItem(objectOrKey,{local}={}) {
		if(!local) {
			this.remote.forEach(remote => {
				if(remote.sink) {
					remote.server.removeItem(objectOrKey)
				}
			})
		}
		if(typeof(objectOrKey)==="string") {
			if(isSoul(objectOrKey)) {
				objectOrKey = await this.getObject(objectOrKey);
			} else {
				await this.options.storage.removeItem(objectOrKey); // enhance to handle paths
				return
			}
		}
		if(objectOrKey && objectOrKey["#"]) {
			if(this.cache) this.cache.removeItem(objectOrKey["#"]);
			await this.options.storage.removeItem(objectOrKey["#"]); // only handles atomic?
			await this.ungraph(objectOrKey._,{indexDates:true,leaf:objectOrKey["#"]});
			await this.ungraph(objectOrKey,{leaf:objectOrKey["#"]});
		}
	}
	async restore(data,{partial,read}={}) {
		const storage = this.options.storage;
		if(typeof(data)==="string") {
			if(isSoul(data)) {
				return this.getObject(data,{partial});
			}
			return Referencer.dereference(data);
		} 
		if(data && typeof(data)==="object" && data["#"]) {
			const [cname,id] = data["#"].split("@"),
				object = cname==="Array" ? [] : (cname==="Date" ? new Date(parseInt(id)) : Object.create(this.schema[cname].ctor.prototype)),
				keys = Object.keys(data);
			if(!keys.includes("_")) keys.push("_");
			for(const key of keys) {
				if(key==="_") {
					if(data._) {
						for(const key in data._) {
							key==="#" || (data._[key] = await this.restore(data._[key]));
						}
					}
					await this.bless(object,data._ ? data._.atomic : false,data._); // should it be data._atomic
				} else if(key!=="#" && (!partial || partial[key]!==undefined)) {
					let value = data[key];
					for await(const node of this.get(`${cname}/${key}`)) { // will only loop once since no wild cards
						value = await node.aclRead(value);
						if(value===undefined) continue;
						value = await node.callback(node.onget,value);
					}
					if(value!==undefined) {
						object[key] = await this.restore(value,{partial,read});
					}
				}
			}
			return object;
		}
		return data;
	}
	async saveObject(object,options={}) {
		const {expireAt,atomic,source}=options;
		await this.serializable(object,{expireAt,atomic,save:true,explode:true});
	}
	async secure(path,{read,write,expires,authorized=[]}={}) {
		if(arguments.length<2) {
			for(const cname in this.schema) {
					const schema = this.schema[cname];
					if(schema.secure) {
						for(const path in schema.secure) {
							await this.secure(`${cname}/${path}`,schema.secure[path]);
						}
					}
			}
		} else {
			return this.get(path).forEach(async edge => { edge.unsecure=true; edge.secure({read,write,expires},...authorized); });
		}
	}
	select(...columns) { // "cname", {tname: "cname",as: "alias}
		return Select(this,...columns);
	}
	async serializable(object,{expireAt,atomic=object && object._?object._.atomic:undefined,save,explode}=this.options,recursing) {
		if(!object) return;
		const target = {},
			original = object["#"] ? await this.getObject(object["#"],{read:true,nocache:true,local:true}) : {},
			same = deepEqual(object,original),
			cname = object.constructor.name;
			if(!this.schema[cname]) {
				this.schema[cname] = {ctor:object.constructor};
			}
			await this.bless(object,atomic,object._,expireAt);
			for(const key in object) {
				if(key==="_") continue;
				let value = object[key],
					type = typeof(value);
				for await(const node of this.get(`${cname}/${key}`)) { // will only loop once since no wild cards
					const original = await this.getObject(object["#"],{local:true});
					value = await node.aclWrite(value,original ? original[key] : undefined);
					//value = await node.callback(node.onget,value);
					type = typeof(value);
				}
				if(value && type==="object") {
					if(Referencer.isValueKeyed(value,"#")) {
						target[key] = Referencer.generateId(value);
					} else if(!value._ || !value._.atomic){
						target[key] = (await this.serializable(value,{expireAt,atomic:value._?value._.atomic:atomic,save,explode,local:true},true)) || value;
					}
				} else {
					target[key] = Referencer.generateId(value);
				}
				//else if(value===Infinity) target[key] = "@Infinity";
				//else if(value===-Infinity) target[key] = "@-Inifinity";
				//else if(typeof(value)==="number" && isNaN(value)) target[key] = "@NaN";
				//else if(value!==undefined) target[key] = value;
			}
			if(object._) {
				//if(save && !same) this.version(object,{expireAt,atomic});
				if(atomic && object._atomic===undefined) object._.atomic = true;
				target["#"] = object["#"];
				target._ = Object.assign({},object._);
				for(const key of ["createdAt","expireAt","modifiedAt"]) {
					if(target._[key]) target._[key] = this.compile(target._[key]);
				}
				if(save && !same && target["#"]) {
					await this.options.storage.setItem(target["#"],JSON.stringify(target));
					if(this.cache) this.cache.setItem(object["#"],object);
					await this.graph(object._,{ctor:object.constructor,indexDates:true,leaf:object["#"]}); //"full"
				}
			}
			return !recursing || atomic || !explode ? target : target["#"];
	}
	async setItem(key,value,{local}={}) {
		const type = typeof(value),
			serializable = await this.serializable(value,{explode:true,local}),
			result = await this.options.storage.setItem(key,JSON.stringify(serializable));
		if(value && type==="object" && this.options.indexAllObjects) {
			await this.putItem(value,{local});
		} else if(!local) {
			const target = value && type==="object" ? Object.assign({},value) : value;
			if(value && type==="object" && value._) target._ = value._; // expose metadata
			this.remote.forEach(remote => {
				if(remote.sink) {
					remote.server.setItem(key,target);
				}
			})
		}
		return result;
	}
	update(ctorOrClassName) {
		return new Update(this,ctorOrClassName);
	}
	async ungraph(object,{indexDates,leaf}={}) {
		const root = await this.Edge();
		for(let path of this.getPaths(object,{indexDates})) {
			if(leaf) path.push(leaf);
			const key = path.shift();
			for await(const edge of root.get(key,undefined,path)) {
					const parent = await edge.parent();
					if(parent) await parent.removeEdge(edge.key);
			}
		}
	}
	version(object,{expireAt=object._?object._.expireAt:undefined}={}) { //,atomic=object._?object._.atomic:undefined
		const metadata = object._;
		if(!metadata) return;
		if(!metadata.version) metadata.version = 0;
		if(!metadata.createdAt) metadata.createdAt = new Date();
		if(expireAt) metadata.expireAt = expireAt;
		metadata.modifiedAt = new Date(); 
		metadata.version++;
		//if(!atomic && !metadata.atomic) Object.keys(object).forEach(key => key==="_" || !object[key] || typeof(object[key])!=="object" || this.version(object[key]))
	}
}

Database.prototype.listen = () => { ; };
if(typeof(module)!=="undefined") {
	Database.prototype.listen = function(port,options) {
		const me = this,
			FOS = require("fos"),
	  	fos = new FOS(
	  			{
	  				getItem: async (key,options) => {
	  					const value = await me.getItem(key,options),
	  						type = typeof(value),
	  						target = value && type==="object" ? Object.assign({},value) : value;
	  						if(value && type==="object" && value._) target._ = value._; // expose metadata
	  						return target;
	  				},
	  				getObject: async (id,options) => {
	  					const value = await me.getObject(id,options),
	  						target = value ? Object.assign({},value) : null;
	  					if(value && value._) target._ = value._; // expose metadata
	  					return target;
	  				},
	  				removeItem: me.removeItem.bind(me),
	  				putItem: me.putItem.bind(me),
	  				setItem: me.setItem.bind(me),
	  				match: async (generatorId,...args) => {
	  					//console.log(generatorId,...args)
	  					let generator = fos.generators[generatorId];
	  					if(!generator) generator = fos.generators[generatorId] = me.match(...args);
	  					const next = await generator.next();
	  					//console.log("next",generatorId,args,next)
	  					if(next.done) setTimeout(() => delete fos.generators[generatorId]);
	  					//console.log(next.value,next.value ? next.value._ : null)
	  					const target = next.value ? Object.assign({},next.value) : next.value;
	  					if(next.value && next.value._) target._ = next.value._;
	  					return target;
	  				}
	  			},
	  			{allow:"*",name:"ReasonDBServer"}
	  	);
		if(options.static) fos.static("/",{location:options.static});
		fos.listen(port);
	}
}