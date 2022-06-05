import * as fs from "fs";
import * as path from "path";
import stream from "stream";
import cluster from "cluster";
import process from "process";
import os from "os";
import https from "https";
import http from "http";

const protocols = {http, https};

import LMDB from "lmdb";
import {v4 as uuidv4} from 'uuid';
import {deepEqual} from "fast-equals";
import EventIterator from "event-iterator";

import Txi from "./txi.js"; // todo replace with import from txi

import EVALUATORS from "./evaluators.js";
import Metadata from "./metadata.js";
import firstKey from "./first-key.js";
import Reference from "./reference.js";
import SchemaValidationError from "./schema-validation-error.js";
import PatternValidationError from "./pattern-validation-error.js";
import hasKeys from "./has-keys.js";
import * as JSON from "./json.js";
import {PARSER,DEFAULTCONTEXT} from "./parser.js";
import cartesian from "./cartesian.js";
import router from "./routes.js";
import RequestProxy from "./request-proxy.js";
import DataIsolate from "./data-isolate.js";
import ValueKey from "./value-key.js";
import IndexKey from "./index-key.js";

const flip = (flag, value) => {
    if (flag) return value;
    if (value === 1) return 0; // if flag is falsy and value is 1, return 0 (falsy)
    return 1;
}

class ReasonDB {
    constructor({name, encrypt, encryptionKey = (encrypt ? this.generateId("",{nodashes:true}) : undefined), overwrite, ...rest} = {}) {
        if (overwrite) {
            try {
                fs.unlinkSync(path.resolve(`../.storage/${name}/data.mdb`));
                fs.unlinkSync(path.resolve(`../.storage/${name}/lock.mdb`));
            } catch (e) {
                if (!["ENOENT", "EBUSY"].some(error => e.message.includes(error))) {
                    throw e;
                }
            }
        }
        this._lmdb = LMDB.open({
            path: `../.storage/${name}`,
            noMemInit: true,
            cache: true,
            pageSize: 8192,
            sharedStructuresKey: Symbol.for('structures'),
            encoder: {
                structuredClone: true
            },
            compression: true,
            useVersions: true,
            encryptionKey
        });
        this.setConfig({name, encryptionKey, ...rest});
        EVALUATORS.$isId = (...args) => {
            return this.isId(...args);
        }
        EVALUATORS.$isId.failureMessage = "Ids must be of the form &lt;classname&gt;@&lt;uuid&gt;}";
        EVALUATORS.$isUnique = (...args) => {
            return this.isUnique(...args);
        }
        EVALUATORS.$isUnique.instanceEvaluator = true;
        EVALUATORS.$matchSimilar = (...args) => {
            return this.matchSimilar(...args);
        }
        EVALUATORS.$matchSimilar.instanceEvaluator = true;
        EVALUATORS.$matchSimilar.subquery = true;
        EVALUATORS.$query = (...args) => {
            return this.selectQuery(...args);
        }
        EVALUATORS.$query.subquery = true;
        EVALUATORS.$query.validate = {
            select: {$optional: {$typeof: "string"}},
            from: {$typeof: "object"},
            on: {$optional: {$typeof: "string"}},
            aggregate: {$optional: {$typeof: "object"}}
        }
        EVALUATORS.$search = (...args) => {
            return this.search(...args);
        }
        EVALUATORS.$search.instanceEvaluator = true;

        JSON.register(DEFAULTCONTEXT.Duration);
    }

    static server({port = 8080, protocol = "http", ipAddress = "127.0.0.1", hostname = ipAddress, number} = {}) {
        const databases = {};
        const options = {
            key: fs.readFileSync("localhost-key.pem"),
            cert: fs.readFileSync("localhost.pem"),
        };
        this.listeners = {};
        if (cluster.isMaster) {
            console.log(`Master ${process.pid} is running`);

            // Fork workers.
            const numCPUs = number ? Math.min(Math.max(1,number-1),os.cpus().length) : os.cpus().length;
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on("exit", (worker, code, signal) => {
                console.log(`worker ${worker.process.pid} died ${code} ${signal}`);
                cluster.fork();
            });
        } else {
            const server = protocols[protocol].createServer(options, async (request, response) => {
                if (request.method === "OPTIONS") {
                    response.statusCode = 200;
                    response.statusMessage = "ok";
                    response.setHeader("Access-Control-Allow-Headers", "*");
                    response.setHeader("Access-Control-Allow-Origin", "*");
                    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD");
                    response.end("ok");
                    return;
                }
                const url = request.url;
                Object.defineProperty(request, "url", {
                    get() {
                        return this.parsedURL.href
                    }, set(url) {
                        return this.parsedURL = new URL(url);
                    }
                })
                request.url = `${protocol}://${hostname || ipAddress}:${port}${url}`;
                request = RequestProxy(request);
                const Response = function (body, {status = 200, statusText = "ok", headers} = {}) {
                    if (body == null) {
                        body = new stream.Writable({
                            highWaterMark: response.writableHighWaterMark,
                            objectMode: response.writableObjectMode
                        })
                    }
                    this.buffered = {
                        body,
                        status,
                        statusText,
                        headers
                    }
                }
                Response.prototype.end = async function () {
                    response.statusCode = this.buffered.status || 200;
                    response.statusMessage = this.buffered.statusText || "";
                    const headers = this.buffered.headers;
                    for (const key in headers) {
                        response.setHeader(key, typeof (headers.get) === "function" ? headers.get(key) : headers[key])
                    }
                    if (!this.buffered.body || typeof (this.buffered.body) !== "object") {
                        //response.setHeader("Content-Length",this.buffered.body.length+2);
                        response.write(this.buffered.body + "");
                    } else if (this.buffered.body) {
                        if (this.buffered.body.writableLength > 0) {
                            for await (const chunk of EventIterator.stream.call(this.buffered.body)) {
                                response.write(chunk);
                            }
                        } else if (this.buffered.body instanceof Object) {
                            response.write(JSON.stringify(this.buffered.body));
                        }
                    }
                    if (!response.finished) {
                        response.end();
                    }
                    return response;
                }
                const ctx = {Response, response, databases};
                let result;
                try {
                    result = await router.handle(request, ctx);
                    if (!result || (!(result instanceof Response) && result !== response)) {
                        throw new TypeError(`router returned invalid response ${result}`)
                    }
                } catch (e) {
                    response.status = 500;
                    response.write(e.message);
                }
                if (!response.finished) {
                    result && result !== response && !result.finished ? result.end() : response.end();
                }
            })
            console.log(`Listening on ${hostname}:${port}`);
            server.listen({port, host: hostname});
        }
    }

    async getConfig() {
        return this._lmdb.get(Symbol("DatabaseConfig"));
    }

    async setConfig(config) {
        const result = await this._lmdb.put(Symbol("DatabaseConfig"), config)
        if (!result) {
            throw new Error("Unable to configure database " + name);
        }
        return config;
    }

    async close() {
        return this._lmdb.close();
    }

    dispatch(condition, action, options) {
        if (action.log) {
            const expression = action.log.substring(2, action.log.length - 1),
                line = new Date() + ":" + PARSER.evaluate(expression, {condition, context: options})
            console.log(line);
        }
    }

    costOf(queryPattern,baseLength=0) {
        let cost = 0;
        for(const key in queryPattern) {
            const value = queryPattern[key],
                type = typeof(value);
            if(["booleab","number","undefined"].includes(type) || !value) {
                cost++
            } else if(type=="string") {
                if(key[0]==="$") {
                    const evaluator = EVALUATORS[key];
                    if(evaluator) {
                        if(evaluator.subquery) {
                            cost+= baseLength;
                        } else if(evaluator.instanceEvaluator) {
                            cost += 2;
                        } else {
                            cost += 1;
                        }
                        if(evaluator.validate) {
                            cost += 1;
                        }
                    }
                    } else if(key.includes("/")) {
                        const possibleregexp = key.substring(1),
                            parts = possibleregexp.split("/");
                        if(parts.length===3) {
                            try {
                                const regexp = new RegExp(parts[1],parts[2]);
                                cost += baseLength; // RegExp matches of keys are very expensive
                            } catch {
                              throw new PatternValidationError(queryPattern,`Malformed RegExp ${key}`);
                            }
                    } else {
                        cost += 1;
                    }
                } else {
                    cost += 2; // string cost more than boolean and number
                }
            } else if(type=="object") {
                if(value.__queryCost) {
                    cost += value.__queryCost
                } else {
                    cost += this.costOf(value,baseLength) + 1;
                    const firstkey = firstKey(value);
                    if(firstkey[0]==='$' && EVALUATORS[firstkey]) {
                        // bumps cost of object tests that will require loading object during query
                        // also sets base cost of evaluating a $ test
                        cost += 1;
                    }
                    Object.defineProperty(value,"__queryCost",{enumerable:false,value:cost});
                }
            }
        }
        return cost;
    }

    async compute(data, pattern, options = {}) {
        return this.match(data, pattern, {onFail: () => true, ...options});
    }

    async evaluate(expressioon, context) {
        return PARSER.evaluate(expressioon, context);
    }

    async evaluateDataIsolate(expression,context={}) {
        return (Function("context","with(context) { return " + expression + "}"))(DataIsolate(Object.assign({},context,DEFAULTCONTEXT)));
        //return (Function("context","with(context) { return " + expression + "}"))(Object.assign({},context,DEFAULTCONTEXT));
    }

    async exists(key) {
        return this.getItem(key, {exists: true});
    }

    extract(data, pattern) {
        return EVALUATORS.$extract(data, pattern);
    }

    generateId(kind,{nodashes}={}) {
        const id = kind ? `${kind}@${uuidv4()}` : uuidv4();
        if(nodashes) {
            return id.replaceAll("-","");
        }
        return id;
    }

    async getItemKey(_key) {
        const now = Date.now(),
            id = _key[0] === "/" ? _key.substring(1) : _key,
            // todo replace isId(key) with parseId which will deal with leading slash
            kinds = this.isId(id) ? [id.split("@")[0]] : ["string","number","boolean"];
        _key[0]==="/" || (_key = "/" + _key);
        for (const kind of kinds) {
            for (let {key, value} of this._lmdb.getRange({start: [kind, _key]})) {
                const [_kind, __key, expiration, dtime, ...rest] = key; // make sure stays in sync with put
                if (_kind !== kind) {
                    return;
                }
                if (__key !== _key) {
                    return;
                }
                if (dtime <= now) {
                    await this.unindex(value);
                    return;
                }
                if (expiration <= now) {
                    await this.unindex(value);
                    await this._lmdb.remove(key);
                    return;
                }
                return key;
            }
        }
    }

    async getItem(key, {exists} = {}) {
        key = await this.getItemKey(key);
        if(!key) {
            return;
        }
        if (exists) {
            return true;
        }
        const {value,version} = await this._lmdb.getEntry(key) || {version: 1};
        if (value && typeof (value) === "object") {
            value["^"] = new Metadata(version, key)
        }
        const schema = await this.getSchema(key[0]);
        if (schema) {
            if (schema.compute) {
                await this.compute(value, schema.compute);
            }
            if (schema.secure) {
                await this.secure(value, "read", schema.secure);
            }
        }
        if(this.isId(value)) {
            return await this.getItem(value, {exists})
        }
        return JSON.reconstruct.call(value);
    }

    async getClassNames() {
        const config = await this.getConfig();
        return Object.keys(config.schema || {});
    }

    getKind(data) {
        if (!data || typeof (data) !== "object") {
            return typeof(data);
        }
        return data["^"] ? data["^"].kind || data.constructor.name : data.constructor.name;
    }

    async* getReferencesFromIndex({path, kind, value}) {
        const now = Date.now(),
            keyarray = [path];
        if (kind) {
            keyarray.push(kind);
        }
        if (value) {
            keyarray.push(value);
        }
        for (const [_path, _kind, data, reference, expiration] of this._lmdb.getKeys({start: keyarray})) {
            if (_path !== path) {
                return;
            }
            if (expiration <= now) {
                return; // need to actually remove
            }
            if (kind && _kind !== kind) {
                return;
            }
            if (value && data !== value) {
                return;
            }
            yield reference;
        }
    }

    async getSchema(forClassName) {
        const config = await this.getConfig();
        return config.schema[forClassName]
    }

    async* getValuesFromIndex({path, kind, value}) {
        for await(const reference of this.getReferencesFromIndex({path, kind, value})) {
            const instance = await this.getItem(reference);
            if (instance) {
                yield instance;
            }
        }
    }

    // should be invoked before root object put since it mutates the object
    async index(data, {expiration, parentReference, path = "/", previousData, kind, unique = {}} = {}) {
        const type = typeof (data);
        if (data && type === "object") {
            kind = kind || this.getKind(data);
            const id = data["#"],
                reference = id ? new Reference(id) : id;
            if (reference && path === "/") {
                previousData = await this.getItem(reference.valueOf());
            }
            previousData ||= {};
            for (const key in data) {
                const keypath = path + "/" + key;
                if (key in unique && data[key] !== undefined) {
                    await this._lmdb.put(["unique", kind, keypath, id + "", expiration], data[key]);
                }
                data[key] = await this.index(data[key], {
                    kind,
                    unique: unique[key],
                    expiration,
                    parentReference: reference || parentReference,
                    path: keypath,
                    previousData: previousData[key]
                });

            }
            if (path !== "/") {
                const childkind = this.getKind(data);
                if (reference) {
                    await this.setItem(reference.valueOf(), data); // todo how dow we handle {expiration} for nested references
                } else if (childkind !== "Object" && !Array.isArray(data)) {
                    Metadata.create(data, {kind:childkind});
                }
                // special index key where data===reference to indicate there is an object at the path
                await this._lmdb.put(IndexKey({kind, path, data:reference, reference, expiration}), true)
            }
            return reference ? reference : data;
        }
        if (data !== undefined && parentReference) {
            const reference = parentReference.valueOf();
            if (previousData !== undefined && previousData !== data) {
                if (typeof (previousData) === "object") {
                    const remove = async (data, path) => {
                        if (data && typeof (data) === "object") {
                            if (!data["#"]) {
                                for (const key in data) {
                                    await remove(data[key], path + "/" + key);
                                }
                            }
                        } else {
                            for (const key of this._lmdb.getKeys({start: [kind, path, data, reference]})) {
                                if (key[0] !== path) {
                                    break;
                                }
                                await this._lmdb.remove(key);
                            }
                        }
                    }
                    await remove(previousData);
                } else {
                    await this._lmdb.remove([kind, path, previousData, reference]);
                    if (typeof (previousData) === "string") {
                        const indexpath = path + "...",
                            index = await this._lmdb.get(indexpath);
                        if (index) {
                            const txi = new Txi();
                            txi.setIndex(index, true);
                            await txi.remove(reference, previousData);
                            await this._lmdb.put(indexpath, txi.getIndex(true));
                        }
                    }
                }
            }
            // make sure the key array below stays in form sync with the query function
            await this._lmdb.put([kind, path, data, reference, expiration], true);
            if (type === "string" && !path.startsWith("//#")) {
                const indexpath = path + "...",
                    index = await this._lmdb.get(indexpath),
                    txi = new Txi();
                if (index) {
                    txi.setIndex(index, true);
                }
                await txi.index(reference, data, {update: true, expiration});
                await this._lmdb.put(indexpath, index || txi.getIndex(true));
            }
        }
        return data;
    }

    isId(value, b = true) {
        const result = typeof (value) === "string" && value.split("@").length === 2; // todo: add reg exp for uuid part that is second element
        return flip(b, result ? 1 : 0)
    }

    async isUnique(a, b = true, {path, target, kind = target.constructor.name, id = target["#"]}) {
        for (const {key, value} of this._lmdb.getRange({start: ["unique", path, kind]})) {
            const [unique, _kind, keypath, _id, expiration] = key;
            if (unique !== "unique" || keypath !== path || kind !== _kind) {
                break;
            }
            if (expiration <= Date.now() || !await this.exists(_id)) {
                await this._lmdb.remove([unique, keypath, kind, id, expiration]);
                return 1;
            }
            return flip(b, id === _id || !(deepEqual(a, value)) ? 1 : 0);
        }
        return flip(b, 1);
    }

    leaves(data) {
        return EVALUATORS.$leaves(data);
    }

    async match(data, pattern, options) {
        return EVALUATORS.$match(data, pattern, {context: {currentUser: this.currentUser}, ...options});
    }

    async* matchSimilar(a, {pattern, className, minScore = -Infinity, maxScore = Infinity, exclude, include}) {
        // todo add comopute resolver on data first?
        const remap = (data, {exclude, include}) => {
            return Object.entries(data).reduce((pattern, [key, value]) => {
                if (exclude && exclude[key]) {
                    return pattern;
                }
                if (include && !include[key]) {
                    return pattern;
                }
                if (key === "#" || key === "^") {
                    return pattern;
                }
                if (key[0] !== "$" && value && typeof (value) === "object" && !Array.isArray(value) && !(value instanceof Date) && value.constructor.name !== "DateTime") {
                    pattern[key] = remap(value, {
                        exclude: exclude ? exclude[key] : exclude,
                        include: include ? include[key] : include
                    });
                } else {
                    pattern[key] = {$evidence: {pattern: {$eeq: value}}};
                }
                return pattern;
            }, {});
        };
        const query = remap(pattern, {exclude, include}),
            results = [];
        let maxtestcount = 0;
        for await(const object of this.query(query, {kind: className})) {
            maxtestcount = Math.max(object["^"].testCount, maxtestcount);
            results.push(object);
        }
        for (const item of results.sort((a, b) => b["^"].matchCount - a["^"].matchCount)) {
            item["^"].testCount = maxtestcount;
            item["^"].matchCount = item["^"].matchCount;
            const score = item["^"].queryScore = item["^"].matchCount / item["^"].testCount;
            if (score >= minScore && score <= maxScore) {
                yield item;
            }
        }
    }

    optimizePattern(pattern = {}) {
        const entries = Object.entries(pattern);
        return entries.sort(([key1, value1], [key2, value2]) => {
            const type1 = typeof(value1),
                type2 = typeof(value2);
            let cost1 = 1,
                cost2 = 1;
            if(key1[0]==="$") {
                cost1 += this.costOf({[key1]:value1},entries.length);
                if(type1!=="object") {
                    cost1 += entries.length; // root level tests usually require table scans
                }
            } else if(type1==="object") {
                cost1 += this.costOf(value1);
            }
            if(key2[0]==="$") {
                cost2 += this.costOf({[key1]:value1},entries.length);
                if(type1!=="object") {
                    cost2 += entries.length; // root level tests usually require table scans
                }
            } else if(type2==="object") {
                cost2 += this.costOf(value1);
            }
            return cost1 - cost2;
        }).reduce((newPattern, [key, value]) => {
            newPattern[key] = value;
            return newPattern;
        }, Array.isArray(pattern) ? [] : {});
    }

    async postItem(object, {key, ...rest} = {}) {
        if(object.toObject) {
            const kind = object.constructor.name;
            object = object.toObject();
            Metadata.create(object,{kind});
        }
        if (!object["#"]) {
            const kind = object["^"] ? object["^"].kind || object.constructor.name : object.constructor.name;
            object["#"] = this.generateId(kind);
        } // todo handle extra key
        if(key==="/") {
            key = undefined;
        }
        return this.setItem(key || object["#"], object, {...rest});
    }

    async setItem(key, value, {
        expirationTtl,
        expiration = typeof (expirationTtl) === "number" ? Date.now() + expirationTtl : Infinity
    } = {}) {
        if (key && typeof (key) === "object") {
            value = key;
            key = value["#"];
            if(!this.isId(key)) {
                throw new SchemaValidationError({test:{$isId: true},target:value,property:"#"});
            }
        }
        key[0] === "/" || (key = "/" + key);
        try {
            return await this._lmdb.transaction(async () => {
                const type = typeof (value);
                let kind = type,
                    schema,
                    unique = {};
                if (type === "object") {
                    const idaskey = "/" + value["#"];
                    if(value["#"] && key!==idaskey) { // setting alternate key for an object
                        // save the reference to the key
                        await this.setItem(key,value["#"],{expiration,expirationTtl});
                        // save the object (this will do the indexing)
                        return await this.setItem(idaskey,value,{expiration,expirationTtl});
                    }
                    kind = this.getKind(value);
                    await this.register(value.constructor);
                    if (!key) {
                        if (!value["#"]) throw new SchemaValidationError({
                            target: value,
                            property: "#",
                            test: {$required: true},
                            message: "Object id required. Use POST if you want to automatically generate an id"
                        });
                        if (!this.isId(value["#"])) throw new SchemaValidationError({
                            target: value,
                            property: "#",
                            test: {$isId: true}
                        });
                        key = "/" + new Reference(value["#"]).valueOf();
                    }
                    schema = kind==="Schema" && value.forClassName==="Schema" ? undefined : await this.getSchema(kind);
                    if (schema && schema?.validate) {
                        const pattern = schema?.validate.pattern
                        if (!schema.validate.additionalProperties) {
                            const properties = pattern || {};
                            for (const key in value) {
                                if (!key in properties) {
                                    throw new SchemaValidationError({
                                        target: value,
                                        property: key,
                                        test: "additionalProperties"
                                    })
                                }
                            }
                        }
                        if (pattern) {
                            const getUnique = (pattern) => { // todo, have return and object?
                                if (pattern === "$isUnique") {
                                    return true;
                                }
                                if (!pattern || typeof (pattern) !== "object") {
                                    return {};
                                }
                                return Object.keys(pattern).reduce((unique, key) => {
                                    if (key === "$isUnique") {
                                        return true;
                                    }
                                    if (key.startsWith("$") && EVALUATORS[key]) {
                                        return getUnique(pattern[key]);
                                    }
                                    const value = pattern[key];
                                    if (value && typeof (value) === "object") {
                                        if ("$isUnique" in pattern[key]) {
                                            unique[key] = true;
                                        } else {
                                            let children;
                                            if (Array.isArray(pattern)) {
                                                children = pattern.reduce((unique, pattern) => getUnique(pattern));
                                            } else {
                                                children = getUnique(value);
                                            }
                                            if (children === true || hasKeys(children)) {
                                                unique[key] = children;
                                            }
                                        }
                                    }
                                    return unique;
                                }, {})
                            }
                            unique = getUnique(pattern);
                            try {
                                await this.validate(value, pattern || {});
                            } catch (e) {
                                // console.log("inner put",e);
                                throw e;
                            }

                        }
                    }
                }
                if (kind === "Schema") {
                    if (value.forClassName === "Schema") {
                        try {
                            await this.validate(value, value);
                        } catch (e) {
                            // console.log("inner put",e);
                            throw e;
                        }
                    }
                    await this.setSchema(value); // todo handle metadata and update tracking for schema;
                    return value;
                }
                if (value["#"]) {
                    await this.index(value, {expiration, unique});
                }
                let found,
                    metadata;
                const now = Date.now(),
                    userid = this?.currentUser?.["#"];
                // make sure to update metadata.js and get function if order or length of key array changes
                // todo make ValueKey({kind,key .. etc) as a pseudo constructor that returns and Array so ordering does not matter excep tin the constructor
                for (let [_kind, _key, expiration, dtime, storageLocale, btime, ctime, atime, mtime, ownedBy, createdBy, updatedBy] of this._lmdb.getKeys({start: [kind, key]})) {
                    if (_kind !== kind || _key !== key) {
                        break;
                    }
                    found = true;
                    let version;
                    if (schema && (schema?.manage?.versioning || schema?.manage?.timestampWrite || schema?.manage?.expiration?.updateTTLOnWrite)) {
                        if (schema?.manage?.versioning) {
                            version = ((await this._lmdb.getEntry([kind, key, expiration, dtime, storageLocale, btime, ctime, atime, mtime, ownedBy, createdBy, updatedBy]))?.version || 0) + 1;
                        }
                        await this._lmdb.remove([kind, key, expiration, dtime, storageLocale, btime, ctime, atime, mtime]);
                        if (schema?.manage?.timestampWrite) {
                            atime = now;
                            mtime = now;
                        }
                        if (schema.manage?.expiration?.updateTTLOnWrite) {
                            expiration = expiration + (schema.manage?.expiration.ttl || Infinity);
                        }
                    }
                    await this._lmdb.put([kind, key, expiration, dtime, storageLocale, btime, ctime, atime, mtime, ownedBy, createdBy, userid], value, version || 1);
                    if (value && type === "object") {
                        metadata = new Metadata(version || 1, [kind, key, expiration, dtime, storageLocale, btime, ctime, atime, mtime, ownedBy, createdBy, userid]);
                    }
                }
                if (!found) {

                    await this._lmdb.put(ValueKey({
                        kind, key, expiration,ownedBy:userid}), value, 1);
                    if (value && type === "object") {
                        metadata = new Metadata(1, [kind, key, expiration, Infinity, "us", now, now, now, now, userid, userid, userid]);
                    }
                }
                if (metadata) {
                    Metadata.create(value,metadata);
                    //value["^"] = metadata;
                }
                if (schema) {
                    if (schema.compute) {
                        await this.compute(value, schema.compute);
                    }
                    if (schema.secure) {
                        await this.secure(value, "create", schema.secure);
                    }
                }
                if(schema?.triggers) {
                    setTimeout(async () => {
                        for (const key in schema?.triggers || {}) {
                            const {on, dispatch} = schema.triggers[key];
                            if (on.put) {
                                if (await this.match(value, on.put)) {
                                    this.dispatch(on, dispatch, value);
                                }
                            }
                        }
                    })
                }
                return type==="object" ? JSON.reconstruct.call(value) : value;
            });
        } catch (e) {
            //console.log("put",e);
            throw e;
        }
    }

    async* query(pattern, {path = "/", matches, aggregates, keysOnly, kind} = {}) {
        if (path === "/") {
            const patterns = {};
            pattern = this.optimizePattern(pattern, {patterns});
            await this.validatePatterns(patterns);
        }
        if (!kind && (pattern.constructor.name !== "Object" || pattern.$kindof)) {
            kind = pattern.$kindof || this.getKind(pattern);
        }
        const kinds = kind ? [kind] : await this.getClassNames();
        for (const kind of kinds) {
            for (let property in pattern) {
                const value = pattern[property],
                    type = typeof (value);
                if (type === "function") { // sometimes patterns may be created in a way that exposes functions as enumerable;
                    continue;
                }
                const {evaluator,propertyEvaluator} = EVALUATORS.propertyEvaluator(property,value,EVALUATORS.evaluator(property[0] === "$" ? {[property]: value} : value));
                let propertypath = path;
                if(property[0]!=="$") {
                    propertypath = path + "/" + property;
                }
                let ids = {};
                if (value && type === "object" && !evaluator) {
                    for await(const lowermatches of this.query(value, {
                        path: propertypath,
                        matches,
                        kind,
                        keysOnly: true
                    })) {
                        ids = lowermatches; // the loop will run only once because keysOnly was passed
                    }
                } else if (evaluator && evaluator.subquery) {
                    for await(const row of await evaluator(null)) {
                        yield row;
                    }
                } else {
                    // if path is / then we are table scanning for all instances of kind, so just scan for their ids
                    const start = [kind];
                    if(!propertyEvaluator) {
                        start.push(propertypath == "/" ? "//#" : propertypath)
                    }
                    if (!evaluator) { // will a;ways have a value if proertyEvaluator has a value
                        start.push(value);
                    }
                    const now = Date.now(),
                        testedobjects = {};
                    let skippath,
                        skipreference;
                    // make sure the key array below stays in form sync with the index function
                    for (const [_kind, _path, data, reference, expiration] of this._lmdb.getKeys({start})) {
                        if(skippath===_path || skipreference===reference) {
                            continue; // reference sometimes coming up as infintity!
                        }
                        if(expiration<=now) {
                            await this._lmdb.remove([_kind, _path, data, reference, expiration]);
                            continue;
                        }
                        skippath = null;
                        skipreference = null;
                        if (_kind !== kind) {
                            break;
                        }
                        if(data===reference) {
                            const property = path.split("/").pop(),
                                target = await this.getItem(reference);
                            if(!target) {
                                await this._lmdb.remove( [_kind, _path, data, reference, expiration]);
                                continue;
                            }
                            const value = property ? property : target, // root query if _property===""
                                result = await evaluator(value, {
                                    property,
                                    target,
                                    path: _path,
                                    matches,
                                    kind,
                                    onFail: ()=> 0
                                });
                            if(result) {
                                (matches || ids)[reference] = target;
                            } else {
                                delete (matches || ids)[reference];
                            }
                            continue;
                        } else if (start[1] && _path !== start[1]) {
                            break;
                        }
                        if (!evaluator && data !== value) {
                            break;
                        }
                        if (matches && !matches[reference]) {
                            continue;
                        }
                        // toto optimize? is object already loaded into matches should we test the object itself?
                        if (reference) {
                            if (evaluator) {
                                if(propertyEvaluator) {
                                    const depth = propertypath.split("/").length,
                                        parts = _path.split("/");
                                    if(!propertyEvaluator(parts[depth])) {
                                        skippath = _path;
                                        continue;
                                    }
                                    if(parts.length>depth) {
                                        skipreference = reference;
                                    }
                                }
                                const result = await evaluator(data, {
                                    property, // property sometimes regexp
                                    path: _path,
                                    id: reference,
                                    matches,
                                    kind,
                                    onFail: ()=> 0
                                });
                                if(result) {
                                    (matches || ids)[reference] = result;
                                } else {
                                    delete (matches || ids)[reference];
                                }
                            } else if (data === value) {
                                (matches || ids)[reference] = true;
                            } else {
                                delete (matches || ids)[reference];
                            }
                        }
                    }
                }
                if (!matches) {
                    if (!hasKeys(ids)) {
                        break;
                    }
                    matches = ids;
                }
            }
        }
        if (keysOnly) { // todo: keysOnly is not compatible with collecting aggregates, throw if both?
            yield matches;
            return;
        }
        if (matches && path === "/") { // done recursing
            let aggregated;
            for (const [id,value] of Object.entries(matches)) {
                const object = typeof(value)==="object" ? value : await this.getItem(id);
                if(!object) {
                    continue;
                }
                const result = await this.match(object, pattern, {onFail: () => 0});
                if (result) {
                    if (aggregates) {
                        aggregated ||= {};
                        const aggregate = this.leaves(await this.extract(aggregates, object) || {});
                        for (const key in aggregate) {
                            const aggregator = (aggregated[key] ||= {count: 0, sum: 0});
                            let value = aggregate[key];
                            const type = typeof (value);
                            // if is cheaper to compuyte all aggregates than it is to conditionalize their computation
                            if (value && type === "object" && value instanceof Date) {
                                const time = value.getTime();
                                aggregator.sum !== undefined || (aggregator.sum = 0);
                                aggregator.min !== undefined && aggregator.min.getTime() <= time || (aggregator.min = value);
                                aggregator.max !== undefined && aggregator.max.getTime() >= time || (aggregator.max = value);
                                aggregator.sum += time;
                                aggregator.count++;
                                aggregator.avg = new Date(aggregator.sum / aggregator.count);
                            } else if (type === "boolean" || type === "number") {
                                value = type === "boolean" ? (value ? 1 : 0) : value;
                                aggregator.min !== undefined && aggregator.min <= value || (aggregator.min = value);
                                aggregator.max !== undefined && aggregator.max >= value || (aggregator.max = value);
                                aggregator.product !== undefined ? aggregator.product *= value : aggregator.product = value;
                                aggregator.sum += value;
                                aggregator.count++;
                                aggregator.avg = aggregator.sum / aggregator.count;
                            } else if (type === "string") {
                                aggregator.min !== undefined && aggregator.min <= value || (aggregator.min = value);
                                aggregator.min !== undefined && aggregator.max >= value || (aggregator.max = value);
                                aggregator.count++;
                            }
                        }
                    } else {
                        Object.assign(object["^"], result);
                        if (result.testCount && result.matchCount) {
                            object["^"].queryScore = result.matchCount / result.testCount;
                        }
                        yield object;
                    }
                }
            }
            if (aggregated) {
                yield aggregated;
            }
        }
    }

    async register(ctor) {
        JSON.register(ctor);
        const config = await this.getConfig();
        config.schema ||= {};
        if (!config?.schema[ctor.name]) {
            config.schema[ctor.name] = {};
            await this.setConfig(config);
        }
    }

    async removeItem(key) {
        const itemkey = await this.getItemKey(key);
        if(!itemkey) {
            const item = await this.getItem(key);
           // await this.unindex(key)
            return this._lmdb.remove(key);
        } else {
            return this._lmdb.remove(itemkey);
        }
        return false;
    }

    async search(a, b, {path, target,property}) {
        const id = target["#"],
            indexpath = `${path}/${property}...`,
            index = await this._lmdb.get(indexpath);
        if (!index) {
            return 0;
        }
        const txi = await new Txi().index(1, b),
            entries = txi.getIndex(true);
        let sum = 0, count = 0;
        for (const token in entries) {
            const search = entries[token][1];
            let indexed;
            if (index[token] && (indexed = index[token][id])) {
                for (const key in search) {
                    const searchvalue = search[key],
                        indexvalue = indexed[key];
                    if (searchvalue && indexvalue) {
                        count++;
                        sum += Math.min(searchvalue / indexvalue, 1);
                    }
                }
            }
        }
        if (sum > 0) {
            return sum / count;
        }
        return 0;
    }

    async secure(object, action, secure = {}) {
        const user = this.currentUser,
            properties = {};
        let {roles, match} = secure[action] || {};
        if (secure._) {
            roles = {...roles, ...secure._}
        }
        if (match) {
            for (const test of match) {
                if (await this.match(object, test.pattern)) {
                    if (!test.properties) {
                        return object;
                    }
                    for (const key in object) {
                        if (await this.match(key, test.properties)) {
                            properties[key] = true;
                        }
                    }
                }
            }
        }
        if (!user.roles && !hasKeys(properties)) {
            for (const key in object) {
                delete object[key];
            }
            return object;
        }
        for (const role in roles) {
            if (!(role in user.roles)) {
                continue;
            }
            const test = roles[role];
            if (test === false) {
                for (const key in object) {
                    delete object[key];
                }
            }
            if (test === true || !hasKeys(test)) { // user in role has blanket access to properties
                return object;
            }
            for (const key in object) {
                if (!!(await this.match(key, test))) {
                    properties[key] = true;
                }
            }
        }
        for (const key in object) {
            if (!(key in properties)) {
                delete object[key];
            }
        }
        return object;
    }

    async* selectQuery(a, options) {
        const {select, from: patterns, on, aggregate} = options,
            queries = Object.values(patterns).map((pattern) => this.query(pattern)),
            keys = Object.keys(patterns),
            rows = [];
        for await(let row of cartesian(...queries)) {
            if (on) {
                const type = typeof (on);
                if (type !== "string") {
                    // throw
                }
                row = row.reduce((o, v, i) => {
                    o[keys[i]] = v;
                    return o;
                }, {}); // PARSER needs to access row like an object
                let context = {row, ...row};
                if (on.startsWith("{")) {
                    if (!on.endsWith("}")) {
                        //todo throw ... should actually validate pattern at point it is optimized
                    }
                    const resolved = PARSER.evaluate(on,context); // (new Function("context", "with(context) { return " + on + "}"))(DataIsolate(context));
                    let passed = true;
                    for (const alias in resolved) {
                        if (!await this.validate(context[alias], resolved[alias], {onFail: () => 0})) {
                            passed = false;
                            break;
                        }
                    }
                    if (passed) {
                        let values;
                        if (select) {
                            if (typeof (select) === "string" && select.startsWith("{")) {
                                //const expression = select.substring(1, select.length);
                                values = (new Function("context", "with(context) { return " + select + "}"))(DataIsolate(context));
                            } else { // todo deprecate
                                values = {};
                                await EVALUATORS.$select(row, select, {...options, target: values, onFail: () => 0});
                            }
                        } else {
                            values = Object.values(row);
                        }
                        if (aggregate) {
                            rows.push(values);
                            // collect aggrgates here
                        } else {
                            yield values;
                        }
                    }
                } else {
                    if (PARSER.evaluate(on, context)) {
                        let values;
                        if (select) {
                            if (typeof (select) === "string" && select.startsWith("{")) {
                                values = PARSER.evaluate(select,context);// (new Function("context", "with(context) { return " + select + "}"))(DataIsolate(context));
                            } else { // todo deprecate
                                // throw // hande higher up by validating pattern so throw does not happen
                            }
                        } else {
                            values = Object.values(row);
                        }
                        if (aggregate) {
                            rows.push(values);
                            // collect aggrgates here
                        } else {
                            yield values;
                        }
                    }
                }
            } else {
                let values;
                if (typeof (select) === "string" && select.startsWith("{")) {
                    //const expression = select.substring(1, select.length);
                    values = PARSER.evaluate(select,context); //(new Function("context", "with(context) { return " + select + "}"))(DataIsolate(context));
                } else { // todo deprecate
                    values = row;
                }
                if (aggregate) {
                    rows.push(values);
                    // collect aggrgates here
                } else {
                    yield values;
                }
            }
        }
        if (aggregate) {

        }
    }

    setCurrentUser(user) { // todo error handle
        this.currentUser = {...user};
        this.currentUser["#"] = user["#"]; // in case not enumerable
    }

    async setSchema(schema = {}, forClassName = schema.forClassName) {
        const config = await this.getConfig();
        config.schema[forClassName] = schema;
        await this.setConfig(config);
    }

    stringify(target) {
        return JSON.stringify(target)
    }

    async unindex(value) {

    }

    async validate(data, pattern, {onFail, ...rest} = {}) {
        if (!onFail) {
            onFail = ({target, property, value, test}) => {
                throw new SchemaValidationError({target, property, value, test});
            }
        }
        try {
            return !!(await this.match(data, pattern, {onFail, ...rest}));
        } catch (e) {
            // console.log("validate",e);
            throw e;
        }
    }

    async validatePatterns(patterns = {}) {
        const onFail = (options) => {
            throw new PatternValidationError(options)
        };
        for (const key in patterns) {
            const validate = EVALUATORS[key]?.validate;
            if (validate) {
                for (const pattern of patterns[key]) {
                    await this.validate(pattern, validate, {onFail})
                }
            }
        }
    }
}

export {ReasonDB as default, ReasonDB}