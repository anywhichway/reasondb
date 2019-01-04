import {getNextEdge} from "../src/getNextEdge.js";

import {isSoul} from "../src/isSoul.js";

import {soundex} from "../src/soundex.js";

export const predicates = {
	$(a,f) {
		f = typeof(f)==="function" ? f : !this.db.options.inline || new Function("return " + f)();
		if(typeof(f)!=="function") return;
		const original = JSON.stringify(a),
			result = f.call(undefined,a);
		if(JSON.stringify(a)!==original) throw new Error("function call by $test has illegal side effect");
		return result;
	},
	$and(a,tests) {
		const resolve = (a,pname,value) => predicates[pname](a,value),
			pnames = Object.keys(tests);
		return pnames.every(pname => resolve(a,pname,tests[pname]));
	},
	$or(a,tests) {
		const resolve = (a,pname,value) => predicates[pname](a,value),
			pnames = Object.keys(tests);
		return pnames.some(pname => resolve(a,pname,tests[pname]));
	},
	$xor(a,tests) {
		const resolve = (a,pname,value) => predicates[pname](a,value),
			pnames = Object.keys(tests);
		return pnames.reduce((accum,pname) => {
			if(resolve(a,pname,tests[pname])) ++accum;
			return accum;
			},0)===1;
	},
	$not(a,tests) {
		const resolve = (a,pname,value) => predicates[pname](a,value),
			pnames = Object.keys(tests);
		return !pnames.every(pname => resolve(a,pname,tests[pname]));
	},
	$lt(a,b) { 
		return a < b; 
	},
	$lte(a,b) { 
		return a <= b; 
	},
	$eq(a,b,depth,unordered) {
		deepEqual(test,value,depth,unordered);
	},
	$eeq(a,b) { 
		return a === b; 
	},
	$eq(a,b) { 
		return a == b; 
	},
	$neq(a,b) { 
		return a != b; 
	},
	$neeq(a,b) { 
		return a !== b; 
	},
	$gte(a,b) { 
		return a >= b; 
	},
	$gt(a,b) { 
		return a > b; 
	},
	$between(a,lo,hi,inclusive=true) { 
		if(inclusive) return (a>=lo && a<=hi) || (a>=hi && a <=lo);
		return (a>lo && a<hi) || (a>hi && a<lo);
	},
	$outside(a,lo,hi) { 
		return !predicates.$between(a,lo,hi,true);
	},
	$in(a,array) {
		return array.includes(a);
	},
	$nin(a,array) {
		return !array.includes(a);
	},
	$includes(array,b) {
		return array.includes(b);
	},
	$excludes(array,b) {
		return !array.includes(b);
	},
	$intersects(a,b) {
		return Array.isArray(a) && Array.isArray(b) && intersection(a,b).length>0;
	},
	$disjoint(a,b) {
		return !this.$intersects(a,b);
	},
	$matches(a,b,flags) {
		b = b && typeof(b)==="object" && b instanceof RegExp ? b : new RegExp(b,flags);
		return b.test(a);
	},
	$typeof(a,b) {
		return typeof(a)===b;
	},
	$instanceof(a,b) {
		if(isSoul(a)) {
			const cname = a.split("@")[0],
				ctor = this.db.schema[cname] ? this.db.schema[cname].ctor : null,
			a = ctor ? Object.create(ctor.prototype) : a;
		} 
		b = typeof(b)==="string" && this.db.schema[b] ? this.db.schema[b].ctor : b;
		return a && typeof(a)==="object" && b && typeof(b)==="function" && a instanceof b;
	},
	async $isArray() { 
		const	edges = [];
		for(const key in this.edges) {
			if(key.indexOf("Array@")===0 && isSoul(key)) {
				edges.push(await getNextEdge(this,key,false));
			}
		}
		if(edges.length>0) {
			this.yield = edges;
			return true;
		}
	},
	$isCreditCard(a) {
		//  Visa || Mastercard || American Express || Diners Club || Discover || JCB 
		return (/^(?:4[0-9]{12}(?:[0-9]{3})?|(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|3[47][0-9]{13}| 3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/m).test(a) && validateLuhn(a);
	},
	$isEmail(a) {
		return !/(\.{2}|-{2}|_{2})/.test(a) && /^[a-z0-9][a-z0-9-_\.]+@[a-z0-9][a-z0-9-]+[a-z0-9]\.[a-z]{2,10}(?:\.[a-z]{2,10})?$/i.test(a);
	},
	$isEven(a) {
		return a % 2 === 0;
	},
	$isIPAddress(a) {
		return (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/m).test(a);
	},
	$isNaN(a) { 
		return isNaN(a); 
	},
	$isOdd(a) {
		return a % 2 !== 0;
	},
	$isSSN(a) {
		return /^\d{3}-?\d{2}-?\d{4}$/.test(a);
	},
	$echoes(a,b) { 
		return soundex(a)===soundex(b); 
	},
	async $search(_,phrase) {
		const tokens = arguments[2],
			edge = await getNextEdge(this,"$fulltext");
		if(edge) {
			this.yield = [];
			for(let key in edge.edges) {
				const value = JSON.parse(key);
				if(tokens.stems.includes(value) || tokens.trigrams.includes(value)) {
					const next = await getNextEdge(edge,key);
					if(next) {
						this.yield.push(next);
						if(phrase.length-2==="/" && phrase.length-1==="s") {
							break;
						}
					}
				}
			}
			return this.yield.length>0
		} else {
			if(tokens.stems.some(stem => phrase.includes(stem))) {
				return true;
			}
			phrase = phrase.replace(/\s/g,"");
			if(tokens.trigrams.some(tri => phrase.includes(tri))) {
				return true;
			}
		}
	},
	$self(f) {
		return f(this._value);
	}
}
for(const key of ["date","day","fullYear","hours","milliseconds","minutes","month","seconds","time","UTCDate","UTCDay","UTCFullYear","UTCHours","UTCSeconds","UTCMilliseconds","UTCMinutes","UTCMonth","year"]) {
	const fname = `get${key[0].toUpperCase()}${key.substring(1)}`;
	predicates["$"+key] = Function(`return function ${"$"+key}(a,b) { 
																	if(typeof(a)==="number") { a = new Date(a); } if(typeof(b)==="number") { b = new Date(b); }; 
	                                if(typeof(a)==="object" && a instanceof Date && typeof(b)==="object" && b instanceof Date) return a.${fname}()===b.${fname}(); }`)();
}
	