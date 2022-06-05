import { DateTime } from "luxon";
import * as turf from "@turf/turf";

import {Metadata} from "./metadata.js";
import timeish from "./timeish.js";

const classes = new Map();

const existingGlobal = (kind) => (new Function(`return ${kind}`))();

const getClass = (kind) => {
    try {
        const existing = existingGlobal(kind);
        if(existing) {
            return existing;
        }
    } catch(e) {

    }
    return classes.get(kind);
}

const createClass = (kind) => {
    let cls;
    // ensure not using any built-in class names
    try {
        const existing = existingGlobal(kind);
        if(existing) {
            return existing;
        }
    } catch(e) {

    }
    try {
        cls = (new Function(`return function ${kind}(options) { if(!(this instanceof ${kind})) { return new ${kind}(options); } else { Object.assign(this,options); } }`))();
    } catch(e) {
        const ctor = function(options) {
            Object.assign(this,options);
        }
        cls = new Proxy(ctor,{
            get(target,property) {
                return property==="name" ? kind : target[property]
            }
        });
        Object.defineProperty(cls,"name",{enumerable:false,configurable:true,writable:false,value:kind});
    }
    cls.artificial = true;
    register(cls);
    return cls;
}
const register = (cls,name=cls.name) => {
    classes.set(name,cls);
}
const unregister = (nameOrCls) => {
    if(typeof(nameOrCls)==="function") {
        classes.remove(nameOrCls.name)
    } else {
        classes.remove(nameOrCls)
    }
}
const reconstruct = function(kind,metadata) {
    if(!this || typeof(this)!=="object") {
        return this;
    }
    metadata ||= this["^"];
    if(!metadata) {
        return this;
    }
    kind ||= metadata.kind;
    let cls = getClass(kind);
    if(!cls) {
        cls = createClass(kind);
    }
    Object.setPrototypeOf(this,cls.prototype);
    //Object.defineProperty(this,"constructor",{enumerable:false,configurable:true,writable:true,value:cls})
    Object.defineProperty(this,"^",{enumerable:false,configurable:true,writable:true,value:new Metadata(metadata)});
    if(metadata.id) {
        Object.defineProperty(this,"#",{enumerable:true,configurable:true,writable:true,value:metadata.id});
    }
    return this;
}
const replacer = function(key,data) {
    const type = typeof(data);
    if(type==="function" || type==="undefined") {
        return data;
    }
    if(type==="object") {
        if(data) {
            if(data.constructor.name==="Metadata") {
                return data;
            }
            if(data instanceof Date || data instanceof DateTime) {
                return "Date@"+data.getTime();
            }
            const kind = data.constructor.name;
            let cls = getClass(kind);
            if(!cls) {
                cls = createClass(kind);
            }
            if(data["^"]) {
                Object.defineProperty(data,"^",{enumerable:true,configurable:true,writable:true,value:data["^"]})
            }
        }
        return data;
    }
    for(const value of [Infinity,-Infinity]) {
        if(data===value) return `@${value}`;
    }
    if(data+""=="NaN") {
        return "@NaN"
    }
    return data;
}

const reviver = function(key,data) {
    const special = {
        "@Infinity": Infinity,
        "@-Infinity": -Infinity,
        "@NaN": NaN
    }
    if(data in special) {
        return special[data];
    }
    if(typeof(data)=="string") {
        if(data.startsWith("@Date")) {
            const date = parseInt(data.substring(5));
            if(!isNaN(date)) {
                try {
                    return new Date(date);
                } catch(e) {

                }

            }
        }
        if(data.startsWith("@GeoLocation")) {
            //
        }

        if(timeish(data)) {
            try {
                const date = Date.parse(data);
                if(!isNaN(date)) {
                    return new Date(date);
                }
            } catch(e) {

            }
        }
    }
    if(key==="^") {
        const kind = data.kind;
        if(["boolean","number","string"].includes(kind)) {
            return data;
        }
        reconstruct.call(this,kind,data);
    }
    return data;
}

function stringify(data,f=replacer) {
    const type = typeof(data);
    if(type==="object" && data.toObject) {
        const kind = data.constructor.name;
        data = Object.assign({},data,data.toObject(data));
        Object.defineProperty(data,"^",{enumerable:true,configurable:true,writable:true,value:{kind}});
    }
    return JSON.stringify(data,f);
}

function parse(data,f=reviver) {
    return JSON.parse(data,f)
}

export {stringify,parse,register,unregister,reconstruct,createClass};