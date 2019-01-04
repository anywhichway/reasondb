import {genId} from "./genId.js"

Array.dereference = (string) => {
	return [];
}
Array.generateId = function(value,prefix,id=genId()) {  return `${prefix}${id}`; }

Boolean.generateId = function(value) { return value; }

Date.dereference = (string,prefixDelimiter="@") => {
	const [_,time] = string.split(prefixDelimiter);
	return new Date(parseInt(time));
}
Date.generateId = function(value,prefix) { return `${prefix}${value.getTime()}`; }

Function.dereference = (string,prefixDelimiter="@") => {
	const [_,def] = string.split(prefixDelimiter);
	return Function(`return ${def}`)();
} 
Function.generateId = function(value,prefix) { return `${prefix}${value}`; }

Number.dereference = (string,prefixDelimiter="@") => {
	const parts = string.split(prefixDelimiter);
	if(parts.length===1) return JSON.parse(parts[0]);
	return JSON.parse(parts[1]);
}
Number.generateId = function(value,prefix) {
	if(value===Infinity || value===-Infinity || isNaN(value)) return `${prefix}${value}`;
	return value;
}

String.generateId = function(value) { return value; }

Object.generateId = function(value,prefix,id=genId()) {  return `${prefix}${id}`; }

const CTORS = {
	Date,
	Function,
	Object,
	Array
};

const OPTIONS = { };
	
export const Referencer = {
	dereference(value,{key}={}) {
		key || (key = OPTIONS.key);
		const type = typeof(value);
		if(type==="string") {
			const [_,ctor] = Object.entries(CTORS).filter(([key,_]) => value.startsWith(`${key}${OPTIONS.prefixDelimiter}`))[0]||[];
			if(!ctor) {
				return value;
			}
			let instance;
			if(ctor.dereference) {
				instance = ctor.dereference(value,OPTIONS.prefixDelimiter);
				if(instance && typeof(instance)!=="object") {
					return instance; // a special case, e.g. Number@Infinity
				}
			} else {
				instance = Object.create(ctor.prototype);
			}
			Object.defineProperty(instance,key,{enumerable:false,configurable:true,writable:true,value});
			if(!ctor.valueKeyed) return instance;
			value = this.dereference(instance,OPTIONS.prefixDelimiter);
		} else if(Array.isArray(value)) {
			value.forEach((item,i,array) => array[i] = this.dereference(item,OPTIONS.prefixDelimiter));
		} else if(value && type==="object") {
			Object.keys(value).forEach((name) => {
				name===key || (value[name] = this.dereference(value[name],OPTIONS.prefixDelimiter));
			});
		}
		return value;
	},
	generateId(value,{key,keyGenerator}={}) {
		if(value==null) return value;
		key || (key = OPTIONS.key);
		keyGenerator || (keyGenerator = OPTIONS.keyGenerator);
		let generateId = value.constructor.generateId || Object.generateId,
			prefix = OPTIONS.prefixGenerator(value) + OPTIONS.prefixDelimiter;
		return generateId(value,prefix,keyGenerator ? keyGenerator() : undefined);
	},
	getId(value,generate,{key,keyGenerator}) {
		if(value[key]) {
			return value[key];
		}
		if(generate) {
			return this.generateId(value,{key,keyGenerator});
		}
	},
	isValueKeyed(value,key=OPTIONS.key) { 
		const valuekey = value[key];
		if(value.constructor.valueKeyed) return true;
		if((valuekey && this.generateId(value)===valuekey) || this.generateId(value)===this.dereference(this.generateId(value))[key]) {
			Object.defineProperty(value.constructor,"valueKeyed",{enumerable:false,configurable:true,writable:false,value:true});
			return true;
		}
		return false;
	},
	setOptions({key,generateId,prefixDelimiter,prefixGenerator}={}) {
		!key || (OPTIONS.key = key);
		!generateId || (OPTIONS.generateId = generateId);
		!prefixDelimiter || (OPTIONS.prefixDelimiter = prefixDelimiter);
		!prefixGenerator || (OPTIONS.prefixGenerator = prefixGenerator);
		if(!Object.getOwnPropertyDescriptor(Object,"generateId")) {
			Object.defineProperty(Object,"generateId",{configurable:true,writable:true,value:generateId});
		}
	},
	reference(value,{key,keyGenerator,references=[]}={}) {
		key || (key = OPTIONS.key);
		keyGenerator || (keyGen = OPTIONS.keyGenerator);
		const type = typeof(value);
		if(value && type==="object") {
			if([Number,String,Boolean].some((ctor) => value instanceof ctor)) {
				return [value.valueOf()];
			}
			if(!CTORS[value.constructor.name]) {
				this.register(value.constructor);
			}
			if(!value[key]) {
				const id = this.generateId(value,{key,keyGenerator});
				Object.defineProperty(value,key,{enumerable:false,configurable:true,writable:true,value:id});
			}
			if(!references[value[key]]) {
				references[value[key]] = value;
				references.push(value);
			}
			Object.keys(value).forEach((key) => {
				if(value[key] && typeof(value[key])==="object") {
					value[key] = this.reference(value[key],{key,generateId,references})[0];
				}
			});
			return references;
		}
		return [value];
	},
	register(ctor,name=ctor.name) {
		CTORS[name] = ctor;
	}
}

Referencer.setOptions({
	key: "#",
	keyGenerator: undefined,
	prefixDelimiter: "@",
	prefixGenerator: function(value) { return value.constructor.name; }
});