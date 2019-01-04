import {cartesianAsyncGenerator} from "./cartesianAsyncGenerator.js";

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

import {promisify} from "./promisify.js";

import {stemmer} from "./stemmer.js";

import {Referencer} from "./referencer.js";

Referencer.register(GeoPoint);

import {tokenize} from "./tokenize.js";

import {trigrams} from "./trigrams.js";

//sql-like

import {Delete} from "./sql-like/delete.js";

import {Insert} from "./sql-like/insert.js";

import {Select} from "./sql-like/select.js";



function indexableDate(date,full,object) {
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
}

function ensureStorageInterface(storage,options={}) {
	if(!storage) throw new Error("Storage option not provided");
	const propertyMap = {}; // used by WebWorker Proxy
	loop:
	for(const key of ["get","set","remove"]) {
		if(typeof(storage[`${key}Item`])==="function") {
			if(options.promisify) promisify(storage[`${key}Item`],storage);
			continue;
		}
		if(typeof(storage[key])==="function") {
			if(options.promisify) promisify(storage[key],storage);
			storage[`${key}Item`] = async function(...args) {
				return await storage[key].call(this,...args)
			}
			propertyMap[`${key}Item`] = key;
			continue;
		} else if(key==="remove") {
			for(const altkey of ["del","delete"]) {
				if(typeof(storage[altkey])==="function") {
					if(options.promisify) promisify(storage[altkey],storage);
					storage[`${key}Item`] = async function(...args) { return storage[altkey].call(this,...args); }
					propertyMap[`${key}Item`] = altkey;
					break loop;
				}
			}
		}
		throw new Error(`Missing ${key} or ${key}Item`);
	}
	if(options.workerArgumentsList && typeof(window.Worker)!=="undefined" && storage!==MEMORYSTORAGE && storage!==localStorage) {
		return new WorkerProxy("../worker-proxy.js",storage,{argumentList:options.workerArgumentList,instanceVariable:options.workerInstanceVariable,cname:options.workerName,propertyMap})
	}
	return storage;
}

function flatten(object) {
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
	static get memoryStorage() {
		return MEMORYSTORAGE;
	}
	static get predicates() {
		return predicates;
	}
	constructor(options={}) {
		enhanceGenerators(this,["get","match","matchObjects","matchPath"],{all:[Edge.prototype.value,Edge.prototype.on,Edge.prototype.secure,Edge.prototype.patch,Edge.prototype.put]});
		this.options = options = Object.assign({},options);
		if(!options.authenticate) options.authenticate = () => true;
		let storage = options.storage;
		if(!storage) storage = options.storage = MEMORYSTORAGE;
		storage = options.storage = ensureStorageInterface(storage,this.options);
		this.schema = Object.assign({},SCHEMA,options.schema);
		this.predicates = Object.assign({},predicates,options.predicates);
		this.cache = new LFRUStorage();
		this.Edge = (config={},force) => {
			return new Edge(this,config,force);
		}
		if(options.onready) this.onready = options.onready;
		this.initialized = new Promise(async resolve => {
			const storage = this.options.storage;
			if(options.clear) await this.clear();
			if(options.authenticate) await options.authenticate.call(this);
			const root = await storage.getItem("/");
			if(!root) await storage.setItem("/",JSON.stringify(this.Edge()));
			await this.secure();
			this.expire();
			if(options.listen) this.listen(options.listen);
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
			now = Date.now(),
			future = utime - now,
			version = Math.max(usoul.version,csoul.version);
		if(deepEqual(updated,current) && utime===ctime && usoul.version===csoul.version && usoul.createdAt===csoul.createdAt) { // same
			return; // throw away by returning undefined
		}
		if(future>0) { // update is in the future
			setTimeout(() => this.putItem(updated),future); // so do it in the future
			return; 
		}
		if(utime<ctime) { // current version newer
			return; // throw away by returning undefined
		}
		if(utime>ctime) { // update is newer
			usoul.version = version; // update to max version
			return updated; // go ahead with merge
		}
		if(usoul.version===csoul.version && utime===ctime) { // version and update time are the same (very rare)
			if(ucreated>ccreated) { // if update is more recently created
				return updated; // use it
			}
			if(ccreated>ucreated) { // if current is more recently created
				return; // throw away
			}
			if(usoul["#"]>=csoul["#"]) { // else if key is lexically greater
				usoul.version = version; // update more recent to max version
				return updated; // use the update (abitrary but consistent approach)
			}
			return; // otherwise throw away
		}
	}
	async bless(json,atomic=json._?json._.atomic:undefined,metadata=json["_"],expireAt) {
		if(!metadata || metadata["#"]!==json["#"]) {
			if(!metadata) metadata = {};
			json._ || Object.defineProperty(json,"_",{enumerable:false,configurable:false,writable:true,value:metadata}); // writable:false
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
		const storage = this.options.storage,
			clear = storage.clear || storage.flush || storage.flushdb || storage.destroy || (() => true);
		await clear.call(storage);
		await storage.setItem("/",JSON.stringify(this.Edge()));
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
					tokens.words = tokenize(arg);
					tokens.stems = tokens.words.map(token => stemmer(token)),
					tokens.trigrams = trigrams(tokens.stems);
				}
				if(pname && test) {
					if(keys.length>1) throw new Error(`Property values can contain only one predicate test: ${JSON.stringify(keys)}`);
					if(test.length<=2) return Function("test","arg","tokens",`return function ${pname}(x) { return arg==="$true!" || test.bind(this)(x,arg,tokens); }`)(test,arg,tokens);
					if(!Array.isArray(arg)) throw new Error(`Predicate ${pname} expected array as argument and recieved ${arg}`);
					return Function("test","arg",`return function ${pname}(x) { return test.bind(this)(x,...arg); }`)(test,arg);
				}
		}
		return value;
	}
	delete() {
		return new Delete(this);
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
		if(path.indexOf("http://")===0 || path.indexOf("https://")===0) {
			const response = await fetch(path),
				value = response.json();
			if(value.edges && typeof(value.edges)==="object") {
				value.path = path;
				yield this.Edge(value);
			} else {
				yield this.Edge({path,value});
			}
			return;
		}
		const parts = Array.isArray(path) ? path : path.split("/");
		if(parts[0]==="") parts.shift();
		if(parts.length===1 && isSoul(parts[0])) {
			yield {edges:{[parts[0]]:true}};
			return;
		}
		const root = this.Edge();
		for await(const last of root.get(parts.shift(),undefined,parts)) {
			yield last;
		}	
	}
	get GeoPoint() {
		return GeoPoint;
	}
	async getItem(key) {
		const data = await this.options.storage.getItem(key);
		if(data!=null) {
			return await this.restore(JSON.parse(data));
		}
	}
	async getObject(id,{partial,read,nocache}={}) {
		if(!id) return;
		//const parts = id.split("@"); // should use dereference and singleton check
		//if(parts.length===2 && parts[0]==="Date") {
		//	return new Date(parseInt(parts[1]));
		//}
		let object = Referencer.dereference(id);
		if(Referencer.isValueKeyed(object)) {
			return object;
		}
		if(!read) {
			object = this.cache.getItem(id);
			if(object) {
				return await this.restore(object,{partial,read});
			}
		}
		const data = await this.options.storage.getItem(id);
		if(data) {
			object = await this.restore(typeof(data)==="string" ? JSON.parse(data) : data,{partial,read});
			this.getObjectRemote(id,data._);
			return nocache ? object : this.cache.setItem(id,object);
		}
		this.getObjectRemote(id);
	}
	async getObjectRemote(id,metadata) {
		this.getObjectRemote.memo || (this.getObjectRemote.memo={});
		if(!this.getObjectRemote.memo[id]) {
			this.getObjectRemote.memo[id] = true;
			for(const peername in this.options.peers) {
				//console.log(`Requesting ${peername}/${id}...`)
				//If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT
				fetch(`${peername}/${id}`)
					.then(async res => {
						if(res.ok) {
							console.log(await res.json());
							// update local database,
							// should have a way to verify version on server and not send if not needed by using headers
						} else {
							console.log(await res.text());
						}
					})
					.catch(e => console.log(e))
					.finally(() => {
						this.getObjectRemote.memo[id] = null;
					});
			}
		}
	}
	getPaths(value,{indexDates}={},path,allpaths=[],parent={},schema,key) { // gets paths for both regular objects and match patterns
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
					const tokens = tokenize(value),
						stems = tokens.map(token => stemmer(token)),
						tris = trigrams(stems);
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
				path || (path=[value.constructor.name]);
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
	async graph(object,{indexDates,leaf}={}) {
		const root = this.Edge();
		for(let path of this.getPaths(object,{indexDates})) {
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
	async* match(pathOrObject,{partial,read}={}) {
		const type = typeof(pathOrObject);
		if(type==="string") {
			for await(const id of this.matchPath(pathOrObject,{partial,read})) {
				const object = await this.getObject(id,{partial:partial ? pathOrObject : null,read});
				if(object) yield object;
			}
		} else if(pathOrObject && type==="object") {
			for await(const id of this.matchObjects(pathOrObject)) {
				const object = await this.getObject(id,{partial:partial ? pathOrObject : null,read});
				if(object) yield object;
			}
		}
	}
	async* matchObjects(object) {
		let ids;
		for(let path of this.getPaths(object)) {
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
	async putItem(object,{force,indexDates,reactive,expireAt,atomic=object._?object._.atomic:undefined,source}=this.options) {
		const id = object["#"];
		if(id) {
			const existing = await this.getObject(id,{read:true,nocache:true});
			if(existing) {
				object = this.arbitrate(object,existing);
				if(!object) return;
				const oldvalues = mergeObjects(existing,object);
				if(oldvalues) {
					this.bless(oldvalues,true,existing._); // make it look like a full object
					for(const key in object._) existing._[key] = object._[key];
					object = existing;
					await this.ungraph(oldvalues,{leaf:id});
				}
				if(!force) this.version(object,{expireAt,atomic});
			}
		}
		await this.saveObject(object,{indexDates,expireAt,atomic,source});
		await this.graph(object,{indexDates,leaf:object["#"]}); // save adds id if missing
		if(reactive) return this.reactor(object);
		return object;
	}
	reactor(object) {
		const db = this,
			root = db.Edge();
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
								edge.save();
						});
				});
				return true;
			}
		});
	}
	async removeItem(objectOrKey) {
		if(typeof(objectOrKey)==="string") {
			if(isSoul(objectOrKey)) {
				objectOrKey = await this.getObject(objectOrKey);
			} else {
				await this.options.storage.removeItem(objectOrKey); // enhance to handle paths
				return
			}
		}
		if(objectOrKey && objectOrKey["#"]) {
			this.cache.removeItem(objectOrKey["#"]);
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
			//if(data==="@Infinity") return Infinity;
			//if(data==="@-Infinity") return -Infinity;
			//if(data==="@NaN") return NaN;
			//if(data.indexOf("Date@")===0) return new Date(parseInt(data.substring("Date@".length)))
			//return data;
		} 
		if(data && typeof(data)==="object" && data["#"]) {
			const [cname,id] = data["#"].split("@"),
				object = cname==="Array" ? [] : (cname==="Date" ? new Date(parseInt(id)) : Object.create(this.schema[cname].ctor.prototype)),
				keys = Object.keys(data);
			keys.push("_");
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
		const {expireAt,atomic,source}=options,
			serializable = await this.serializable(object,{expireAt,atomic,save:true,explode:true});
		this.saveObjectRemote(serializable,{source});
	}
	async saveObjectRemote(object,{source}) {
		const id = object["#"];
		for(const peername in this.options.peers) {
			//console.log(`Saving ${peername}/${id} ...`);
			if(peername.indexOf(source)===0) continue;
			const body = JSON.stringify(object);
			fetch(`${peername}/${id}`,{method:"PUT",body,headers:{"Accept":"application/json;charset=utf-8","Content-Length":body.length}})
				.then(async res => {
					if(res.ok) {
						const txt = await res.text();
						if(txt!==body) {
							console.log("New data",body,txt);
						}
					} else {
						console.log(await res.text());
					}
				})
				.catch(e => console.log(e));
		}
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
			original = await this.getObject(object["#"],{read:true,nocache:true}),
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
					const original = await this.getObject(object["#"]);
					value = await node.aclWrite(value,original ? original[key] : undefined);
					//value = await node.callback(node.onget,value);
					type = typeof(value);
				}
				if(value && type==="object") {
					if(Referencer.isValueKeyed(value,"#")) {
						target[key] = Referencer.generateId(value);
					} else if(!value._ || !value._.atomic){
						target[key] = (await this.serializable(value,{expireAt,atomic:value._?value._.atomic:atomic,save,explode},true)) || value;
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
					this.cache.setItem(object["#"],object);
					await this.graph(object._,{indexDates:true,leaf:object["#"]}); //"full"
				}
			}
			return !recursing || atomic || explode ? target : target["#"];
	}
	async setItem(key,value) {
		const serializable = await this.serializable(value,{explode:true}),
			result = await this.options.storage.setItem(key,JSON.stringify(serializable));
		if(this.options.indexAllObjects && value && typeof(value)==="object") await this.putItem(value);
		return result;
	}
	async ungraph(object,{indexDates,leaf}={}) {
		const root = this.Edge();
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

if(typeof(module)!=="undefined") {
	const http = require("http"),
		NanoPipe = require("nano-pipe");
	
	class Server {
		constructor(options={}) {
		  async function use({match,handle}) {
		    // `match` and `handle` define a capability
		    // if `match` is true or the result of match
		    // and the inputs represented by `this` is true
		    if((match===true || match.call(this,this)) && handle) {
		      // then apply `handle` to the inputs
		      return handle.call(this,this);
		    }
		    // else just return the inputs
		    return this;
		  }
		  NanoPipe.pipeable(use);
		  this.handler = NanoPipe();
		  this.options = Object.assign({},options);
		}
		use(capability) {
		  // just tell the NanoPipe to use the provided capability
		  // as part of its pipe transformation process
		  // capability has the surface {match, handle}
		  this.handler = this.handler.use(capability);
		  return this; // return `this` to support chaining
		}
		run(port=8080) {
		  // create the server
		  this.httpServer = http.createServer((req,res) => {
		  	if(this.options.requestChangeLog) {
		  		const stream = this.options.requestChangeLog;
		  		req = new Proxy(req,{
		  			set(target,property,value) {
		  				let oldvalue = target[property];
		  				if(oldvalue===value) return true;
		  				target[property] = value;
		  				try { oldvalue = JSON.stringify(oldvalue); } catch(e) { olvalue  = "[object Circular Object]"; }
		  				try { value = JSON.stringify(value); } catch(e) { value  = "[object Circular Object]"; }
		  				if(property[0]!=="_") stream.log(`request.${property}=${value} was ${oldvalue}`);
		  				return true;
		  			}
		  		});
		  	}
		  	// handler is created in the constructor
		    // it will be the NanoPipe that provides the server functionality
		    // simply pipe all req, res pairs through the handler
		    this.handler.pipe([{req,res}]);
		  });
	    // start listening on the provided port
	    this.httpServer.listen(port, (err) => {
	      if (err) {
	        return console.log('something bad happened', err)
	      }
	      console.log(`server is listening on ${port}`);
		  })
		  return this; // returning 'this' will make the call chainable
		}
	}
	function route(matcher,handlers) {
		const match = function({req,res}) {
			if(req && !res.headersSent) {
				const type = typeof(matcher);
				if(type==="function") {
					if(matcher(req)) {
						if(route.trace || matcher.trace) console.log(`Route ${matcher.name} true ${req.url}`);
						return true;
					}
					if(route.trace) console.log(`Route ${matcher.name} false ${req.url}`)
				} else if(type==="object" && matcher && matcher instanceof RegExp) {
					if(matcher.test(req.url)) {
						if(route.trace) console.log(`Route ${matcher}.test("${req.url}") true ${req.url}`)
						return true;
					}
					if(route.trace) console.log(`Route ${matcher}.test("${req.url}") false ${req.url}`)
				} else if(type==="string") {
					if(req.url===matcher) {
						if(route.trace) console.log(`Route ${matcher}===${req.url} true ${req.url}`);
						return true;
					}
					if(route.trace) console.log(`Route ${matcher}===${req.url} false ${req.url}`);
				}
			}
		},
		handle = async function({req,res}) {
			const method = req.method.toLowerCase(),
				responder = handlers[method] || handlers.default,
				key = handlers[method] ? method : "default";
			if(responder) {
				if(route.trace || handle.trace.includes(key)) console.log(`Handler ${key} ${req.url}`);
				await responder.call(this,this);
			}
			return this;
		};
		handle.trace = ["get"];
		return {match,handle};
	}
	route.trace = 0;
	Database.prototype.listen = function(port) {
		const server = new Server({requestChangeLog:console}),
			db = this;
		server
				.use(route(function parseRemoteAddress() { return true; },
					{default: ({req}) =>
						{
							req.remoteAddress = (req.headers['x-forwarded-for'] || '').split(',').pop() || 
							req.connection.remoteAddress || 
							req.socket.remoteAddress || 
							req.connection.socket.remoteAddress
						}
					}))
				
				.use(route(function parseReferrer() { return true; },
				{default: ({req}) =>
					{
						req.referrer = req.headers.referer || req.headers['Referer'] || req.headers['Referrer'];  
					}
				}))
					
				.use(route(function setAccessControl() { return true; },
					{default: ({req,res}) => 
						{ // Access-Control-Allow-Origin, should look at peer list
							res.setHeader("Access-Control-Allow-Origin","*");
						}
					}))
					
				.use(route(function parseKey(req) { return req.url.indexOf("/data/")===0; },
					{default: ({req}) => 
						{
							const parts = req.url.split("/");
							req.key = parts.slice(2).join("/");
						}
					}))
					
				.use(route(function parseBody() { return true; },
					{put: async ({req,res}) => 
						{
							return new Promise(resolve => {
								let jsonString = '';

				        req.on('data', function (data) {
				            jsonString += data;
				            if(jsonString.length > 1e6) {
				            	jsonString = "";
			                res.writeHead(413, {'Content-Type': 'text/plain'}).end();
			                req.connection.destroy();
			                resolve();
				            }
				        });

				        req.on('end', function () {
										req.body = {
											json: async () => JSON.parse(jsonString),
											text: async () => jsonString
										}
										resolve(true);
				        });	
							});
						}
					}))
							
				.use(route(function getData(req) {
						return req.key!=null;
					},
					{
						options: ({req,res}) => 
						{
							const headers = {};
				      headers["Access-Control-Allow-Origin"] = "*"; // should add the peers
				      headers["Access-Control-Allow-Methods"] = "GET, PUT, DELETE, OPTIONS"; //POST, 
				      headers["Access-Control-Allow-Credentials"] = true;
				      headers["Access-Control-Max-Age"] = '86400'; // 24 hours
				      headers["Access-Control-Allow-Headers"] = "Content-Length, Content-Type, Accept, If-Modified-Since";
				      res.writeHead(200, headers);
				      res.end();
						},
						get: async function get({req,res})
						{ 
							if(isSoul(req.key)) {
								let object = await db.getObject(req.key);
								if(object) {
									object = await db.serializable(object,{explode:true});
									const data = JSON.stringify(object);
									res.setHeader("Content-Type","application/json;charset=utf-8");
									res.setHeader("Content-Length",data.length);
									res.end(data);
								}
								return;
							}
							const edge = await db.options.storage.get("/"+req.key);
							if(edge) {
								const data = JSON.stringify(edge);
								res.setHeader("Content-Type","application/json;charset=utf-8");
								res.setHeader("Content-Length",data.length);
								res.end(data);
							};
						},
						put: async function put({req,res})  
						{
							const json = await req.body.json(),
								id = json["#"],
								objects = flatten(json);
							for(const object of objects) {
								if(object) {
									// deserialize dates
									["createdAt","expireAt","modifiedAt"].forEach(key => {
										if(object._[key]) { // e.g. Date@1539853416193
											const seconds = parseInt(object._[key].substring("Date@".length));
											object._[key] = new Date(seconds);
										}
									});
									await db.putItem(object,{source:req.headers.referrer || req.headers.referer});
								}
							}
							const object = await db.getObject(id),
								serializable = await db.serializable(object,{explode:true}),
								txt = JSON.stringify(serializable);
							res.setHeader("Content-Type","application/json;charset=utf-8");
							res.setHeader("Content-Length",txt.length);
							res.end(txt);
						}
					}))
										
				.use(route((req)=>!req.headersSent,
					{get: ({req,res}) => 
						{
							res.statusCode = 404;
							res.end();
						}
					}))
				
				
		server.run(port);
		console.log(`${this.options.name||"AnyWhichWay Database"} started on ${port}`);
	}
}