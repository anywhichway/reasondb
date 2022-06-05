import { deepEqual } from "fast-equals";
import libphonenumber from "google-libphonenumber";
const {PhoneNumberUtil} = libphonenumber;
const phoneNumberUtil = PhoneNumberUtil.getInstance();

import Txi from "./txi.js"; // todo replace with import from txi

import toObject from "./to-object.js";
import keyCount from "./key-count.js";
import firstKey from "./first-key.js"
import mapToArray from "./map-to-array.js";
import PARSER from "./parser.js";
import MatchTracker from "./match-tracker.js";

const flip = (flag,value) => {
    if(flag) return value;
    if(value===1) return 0; // if flag is falsy and value is 1, return 0 (falsy)
    return 1;
}
class Evaluators {
    evaluator(test) {
        const type = typeof(test);
        if(!test || ["boolean","number"].includes(type)) {
            return;
        }
        const operator = firstKey(test),
            evaluator = this[operator];
        if(evaluator) {
            let f,
                _test = test[operator];
            if(evaluator.instanceEvaluator) { // todo decouple, inverts so only the db knoiws about this
                f = async (value, options) => {
                    const {id,target,property,context,parent,...rest} = options||{};
                    if(id && property && !target) { // doing an index match
                        return 1;
                    }
                    return evaluator.call(this,value, _test,{id,target,property,context,parent,...rest});
                }
            } else {
                f = async (value,  options) => {
                    const {target,context,parent,property,...rest} = options||{};
                    return evaluator.call(this,value, _test, {target,context,parent,property,...rest});
                }
            }
            return Object.assign(f,evaluator);
        }
    }
    propertyEvaluator(property,value,evaluator) {
        let propertyEvaluator;
        if(!evaluator && property[0]==="$" && property.includes("/")) {
            evaluator = this.evaluator(value)
            const possibleregexp = property.substring(1),
                parts = possibleregexp.split("/");
            if(parts.length===3) {
                try {
                    const regexp = new RegExp(parts[1],parts[2]);
                    propertyEvaluator = (property) => property ? !!property.match(regexp) : 0;
                } catch {
                    // ignore ... not a regular expression
                }
            }
        }
        return {evaluator,propertyEvaluator};
    }
    getFailureMessage(test) {
        return this[firstKey(test)]?.failureMessage;
    }
    $kindof(a,b,{target,matchTrack}) {
        if(matchTrack) {
            matchTrack.testCount--;
            matchTrack.matchCount--;
        }
        if(!target && typeof(a)==="string") {
            return a.split("@")[0] === b ? 1 : 0;
        }
        return target && target?.constructor?.name===b || (target["^"] && target["^"].kind===b) ? 1 : 0;
    }
    $lt(a,b) {
        return a < b ? 1 : 0;
    }
    $lte(a,b) {
        return a <= b ? 1 : 0;
    }
    $eq(a,b) {
        return a == b ? 1 : 0;
    }
    $eeq(a,b) {
        return deepEqual(a,b) ? 1 : 0;
    }
    $eq(a,b) {
        return a == b ? 1 : 0;
    }
    $neq(a,b) {
        return a != b ? 1 : 0;
    }
    $neeq(a,b) {
        return !deepEqual(a,b) ? 1 : 0;
    }
    $gte(a,b) {
        return a >= b ? 1 : 0;
    }
    $gt(a,b) {
        return a > b ? 1 : 0;
    }
    $between(a,lo,hi,inclusive=true) {
        if(inclusive) return (a>=lo && a<=hi) || (a>=hi && a <=lo) ? 1 : 0;
        return (a>lo && a<hi) || (a>hi && a<lo) ? 1 : 0;
    }
    $outside(a,lo,hi) {
        return !EVALUATORS.$between(a,lo,hi,true)  ? 1 : 0;
    }
    $in(a,array) {
        return array.includes(a)  ? 1 : 0;
    }
    $nin(a,array) {
        return !array.includes(a) ? 1 : 0;
    }
    $includes(array,b) {
        return array.includes(b) ? 1 : 0;
    }
    $excludes(array,b) {
        return !array.includes(b) ? 1 : 0;
    }
    $intersects(a,b) {
        return Array.isArray(a) && Array.isArray(b) && intersection(a,b).length>0  ? 1 : 0;
    }
    $disjoint(a,b) {
        return !EVALUATORS.$intersects(a,b)  ? 1 : 0;
    }
    $matches(a,b,flags) {
        b = b && typeof(b)==="object" && b instanceof RegExp ? b : new RegExp(b,flags);
        return b.test(a)  ? 1 : 0;
    }
    $typeof(a,b) {
        return typeof(a)===b  ? 1 : 0;
    }
    // unary predicates
    $typeof(a,b) {
        return typeof(a)===b ? 1 : 0;
    }

    $required(a,b) {
        return flip(b,a==null ? 0 : 1);
    }

    $isAny(a,b) {
        return flip(b,a==null ? 0 : 1);
    }
    $isCreditCard(a,b) {
        //  Visa || Mastercard || American Express || Diners Club || Discover || JCB
        return flip(b,(/^(?:4[0-9]{12}(?:[0-9]{3})?|(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|3[47][0-9]{13}| 3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/m).test(a) && validateLuhn(a)  ? 1 : 0);
    }
    $isEmail(a,b) {
        return flip(b,!/(\.{2}|-{2}|_{2})/.test(a) && /^[a-z0-9][a-z0-9-_\.]+@[a-z0-9][a-z0-9-]+[a-z0-9]\.[a-z]{2,10}(?:\.[a-z]{2,10})?$/i.test(a) ? 1 : 0);
    }
    $isEven(a,b) {
        return flip(b,a % 2 === 0 ? 1 : 0);
    }
    $isIPAddress(a,b) {
        return flip(b,(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/m).test(a) ? 1 : 0);
    }
    $isNaN(a,b) {
        return flip(b,isNaN(a) ? 1 : 0);
    }
    $isOdd(a,b) {
        return flip(b,a % 2 !== 0 ? 1 : 0);
    }
    $isSSN(a,b) {
        return flip(b,/^\d{3}-?\d{2}-?\d{4}$/.test(a) ? 1 : 0);
    }
    $isPhoneNumber(a,b="US") {
        b ||= "US";
        b = b.toUpperCase();
        try {
            return phoneNumberUtil.isValidNumberForRegion(phoneNumberUtil.parse(a, b), b) ? 1 : 0;
        } catch(e) {
            return 0;
        }
    }
    $hasProperty(a,b,{id,property,target,path}) {
        if(id && property && !target) {
            return path.split().pop()===b ? 1 : 0;
        }
        return a && typeof(a)==="object" && b in a ? 1 : 0;
    }
    $hasKeys(a,b) {
        return a && typeof(a)=="object" && b.every((key) => key in a) ? 1 : 0;
    }
    $echoes(a,b) {
        return soundex(a)===soundex(b) ? 1 : 0;
    }
    // logical
    async $and(value,test,{matchTrack,onFail,target,property,...rest}) {
        let score = 0;
        const tests = Array.isArray(test) ? test : mapToArray(test);
        for(const test of tests) {
            if(matchTrack) {
                matchTrack.testCount++;
            }
            const evaluator = this.evaluator(test);
            let result = 0;
            if(evaluator) {
                result = await evaluator(value,{matchTrack,onFail,target,property,...rest});
            } else {
                result = await this.$match(value,test,{matchTrack,onFail,target,property,...rest})
            }
            if(!result) {
                const more = onFail({target,property,value,test:evaluator ? test : {$eeq: test}});
                if(!more) {
                    if(matchTrack) {
                        matchTrack.testCount--; // remove one since the caller will be incrementing
                    }
                    return 0;
                }
            } else {
                const type = typeof(result);
                score += type==="number" ? result : 1;
                if(type==="object" && !(result instanceof MatchTracker)) {
                    if(result instanceof Boolean || result instanceof Number || result instanceof String) {
                        a = target[property] = result.valueOf();
                    } else {
                        a = target[property] = result;
                    }
                }
            }
        }
        if(matchTrack) {
            matchTrack.testCount--;
        } // remove one since the caller will be incrementing
        return score;
    }
    async $or(value,test,{matchTrack,property,...rest}) {
        const tests = Array.isArray(test) ? test : mapToArray(test);
        let result;
        for(const test of tests) {
            const evaluator = this.evaluator(test);
            let result = 0;
            if(evaluator) {
                result = await evaluator(value,{property,...rest});
                if(result!==0) {
                    break;
                }
            } else if(test===value) {
                result = toObject(value);
            }
        }
        if(result!==undefined && matchTrack) {
            matchTrack.testCount--;
        }
        return result ? result : 0;
    }
    async $xor(value,test,{matchTrack,onFail,target,property,...rest}) {
        const tests = Array.isArray(test) ? test : mapToArray(test);
        let passed;
        for(const test of tests) {
            const evaluator = this.evaluator(test);
            let result;
            if(evaluator) {
                result = await evaluator(value,{onFail,target,property,...rest});
            } else if(expression===value) {
                result = toObject(value);
            }
            if(result!==0) {
                if(passed) { // xor fails if one test already passed
                    onFail({target, property, value, test});
                    return 0;
                }
                passed = result;
            }
        }
        if(passed!==undefined && matchTrack) {
            matchTrack.testCount--;
        }
        if(passed) {
            return passed;
        }
        onFail({target, property, value, test: tests});
        return 0;
    }
    async $ior(value, test, {matchTrack,onFail,target,property,...rest}) { // the reflection of xor, tests all conditions so a score can be generated
        const tests = Array.isArray(test) ? test : mapToArray(test);
        let score = 0;
        for(const test of tests) {
            if(matchTrack) {
                matchTrack.testCount++;
            }
            const evaluator = this.evaluator(test);
            let result = 0;
            if(evaluator) {
                result = await evaluator(value, {matchTrack,onFail,target,property,...rest});
            } else if(test===a) {
                result = toObject(value);
            }
            score += typeof(result)==="number" ? result : 1;
        }
        if(matchTrack) {
            matchTrack.testCount--;
        }
        if(score===0) {
            onFail({target, property, value, test: tests});
        }
        return score;
    }
    async $not(value,test,{onFail,target,property,...rest}) {
        const tests = Array.isArray(test) ? test : mapToArray(test);
        let result;
        for(const test of tests) {
            const evaluator = this.evaluator(test);
            if(evaluator) {
                result = await evaluator(value,{onFail:() => true,target,property,...rest});
            } else if(test===value) {
                result = 1;
            }
            if(result) {
                break;
            }
        }
        if(result!==undefined && matchTrack) {
            matchTrack.testCount--;
        }
        if(result) {
            onFail({target, property, value, test: tests});
            return 0;
        }
        return 1;
    }
    // example score function "evidence + score"
    async $evidence(a,{pattern,score=1,operation="score"},{onFail,matchTrack={testCount:0,matchCount:0},property,...rest}) {
        const tests = matchTrack.testCount,
            matched = matchTrack.matchCount,
            {matchCount,testCount} = await this.$match({[property]:a},{[property]:pattern},{onFail:()=> true,matchTrack,...rest})||{matchCount:0,testCount:1};
        let evidence = testCount ? matchCount / testCount : 0;
        if(evidence) {
            evidence = PARSER.evaluate(operation,{matchCount,testCount,evidence,score});
        }
        // evidence checking does not count as a test
        matchTrack.testCount = testCount;
        matchTrack.matchCount = matchCount;
        if(!evidence) {
            return -1;
        }
        return evidence;
    }
    async $optional(a,test,{onFail,id,target,property,...rest}) {
        if(id && property && !target) { // doing an index query
            return 1;
        }
        const value = a;
        if(value!=null) {
            const result = await this.$match(value,test,{onFail,target,property,...rest});
            if(!result) {
                return 0;
            }
            return result.testCount > 0 ? result.matchCount / result.testCount : 0;
        }
        return 1;
    }

    async $match(target, pattern, {
        path = "/",
        matchTrack = new MatchTracker(),
        onFail = () => 0,
        context = {},
        parent = Object.create({}),
        ...rest
    } = {}) {
        if (pattern === target) {
            return new MatchTracker({testCount: 1, matchCount: 1});
        }
        if (target === undefined) {
            return;
        }
        const options = {
            path,
            matchTrack,
            onFail,
            context,
            parent,
            ...rest
        };
        for (let property in pattern) {
            const test = pattern[property],
                type = typeof (test);
            if (type === "function") {
                continue;
            }
            const {evaluator,propertyEvaluator} = this.propertyEvaluator(property,test,this.evaluator(property[0] === "$" ? {[property]: test} : test));
            let matched;
            if(propertyEvaluator) {
                for (const property in target) {
                    if(propertyEvaluator && !propertyEvaluator(property)) {
                        continue;
                    }
                    const value = target[property];
                    if (evaluator) {
                        matched = await evaluator(value, {
                            ...options,
                            path: path + "/" + property,
                            target,
                            property,
                            parent
                        });
                    } else if (test && type === "object") {
                        matched = await this.$match(value, test, {
                            ...options,
                            path: path + "/" + property,
                            parent: {...target, parent}
                        });
                        matchTrack.testCount -= 1; // recursing down an object does not count as a test
                        matchTrack.matchCount -= 1;
                    } else {
                        matched = (test === value);
                    }
                    if (matched) {
                        const type = typeof(matched);
                        if(type==="object") {
                            if(matched instanceof MatchTracker) {
                                matchTrack.testCount += matched.testCount;
                                matchTrack.matchCount += matched.matchCount > 0 ? matched.matchCount : 0;
                            } else {
                                if (matched instanceof Boolean || matched instanceof Number || matched instanceof String) {
                                    target[property] = matched.valueOf();
                                } else {
                                    target[property] = matched;
                                }
                            }
                        } else {
                            matchTrack.testCount += 1;
                            matchTrack.matchCount += matched > 0 ? matched : 0; // -1 means pass but no match
                        }
                    }
                }
            } else {
                const value = property[0]==="$" ? target : target[property];
                if (evaluator) {
                    matched = await evaluator(value, {
                        ...options,
                        path,
                        target,
                        property,
                        parent
                    });
                } else if (test && type === "object") {
                    matched = await this.$match(value, test, {
                        ...options,
                        path: path + "/" + property,
                        parent: {...target, parent}
                    });
                    matchTrack.testCount -= 1; // recursing down an object does not count as a test
                    matchTrack.matchCount -= 1;
                } else {
                    matched = test === value ? 1 : 0;
                }
                if (matched) {
                    const type = typeof(matched);
                    if(type==="object") {
                        if(matched instanceof MatchTracker) {
                            matchTrack.testCount += matched.testCount;
                            matchTrack.matchCount += matched.matchCount > 0 ? matched.matchCount : 0;
                        } else {
                            if (matched instanceof Boolean || matched instanceof Number || matched instanceof String) {
                                target[property] = matched.valueOf();
                            } else {
                                target[property] = matched;
                            }
                        }
                    } else {
                        matchTrack.testCount += 1;
                        matchTrack.matchCount += matched > 0 ? matched : 0; // -1 means pass but no match
                    }
                }
            }
            if (!matched) {
                try {
                    const more = await onFail({
                        target,
                        property,
                        value: target[property],
                        test
                    });
                    if (!more) {
                        return;
                    }
                    return new MatchTracker({testCount:matchTrack.testCount,matchCount:0});
                } catch (e) {
                    // console.log("match",e);
                    throw e;
                }
            }
        }
        return matchTrack;
    }

    // todo $valid



    // transformation
    async $evaluate(value,expression, {target,property,parent,context}) {
        return PARSER.evaluate(target,expression, {...context,parent,value,property,this:target});
    }
    async $mask() {}
    async $encrypt() {}
    async $extract(target,pattern,{path="/", context = {}, onFail=()=>-1,...rest}={}) {
        if (pattern === target || target === undefined) {
            return target;
        }
        let extracted;
        context = Object.assign({}, context, {parent: target});
        for (const property in pattern) {
            if(property==="^") {
                continue;
            }
            const test = pattern[property],
                type = typeof (test);
            if (type === "function") {
                continue;
            }
            const evaluator = this.evaluator(path==="/" ? {[property]: test} : test),
                value = path==="/" ? target : target[property];
            if (evaluator && await evaluator(value, {target, property, context,onFail})) {
                extracted ||= {};
                extracted[property] = target[property];
            } else {
                const result = await this.$extract(target[property],test, {context, path: path + "/" + property, onFail,...rest});
                if (result !== undefined) {
                    extracted ||= {};
                    extracted[property] = result;
                }
            }
        }
        return extracted;
    }
    $leaves(target) {
        const leaves = (object, collector = {}) => {
            for (const key in object) {
                const value = object[key],
                    type = typeof (value);
                if (value && type === "object") {
                    leaves(value, collector);
                } else {
                    collector[key] = value;
                }
            }
            return collector;
        }
        return toObject(leaves(target));
    }
    async $evaluate(a,expression,{target,parent={},context}) {
        if(typeof(expression)==="string") {
            const result = await PARSER.evaluate(expression, {...context,this: {...target},parent: {...parent}});
            return toObject(result)
        }
       return toObject(expression);
    }
    async $default(a,b,{parent,context}) {
        if(a==null) {
            if(typeof(b)==="string" && b.startsWith("${")) { // todo .. are we keeping ${ or switch to $compute
                if(!b.endsWith("}")) {
                    // throw but should do in data validation
                }
                return toObject(await PARSER.evaluate(b.substring(2,b.length-1),Object.assign({},context,{this:Object.assign({},target)},{parent:Object.assign({},parent.parent)})))
            } else {
                return toObject(b);
            }
        }
        return 1;
    }
    // iteration
    async $entries(a,test,options) {
        const entries = Object.entries(a);
        for await(const entry of entries) {
            if(!await this.$match(entry,test,options)) {
                return 0;
            }
        }
        return 1;
    }
    async $values(a,test,options) {
        const values = Object.values(a);
        for await(const value of values) {
            if(!await this.$match(value,test,options)) {
                return 0;
            }
        }
        return 1;
    }
    async $keys(a,test,options) {
        const keys = Object.keys(a);
        for await(const key of key) {
            if(!await this.$match(key,test,options)) {
                return 0;
            }
        }
        return 1;
    }
}

Evaluators.prototype.$ior.instanceEvaluator = true;
Evaluators.prototype.$extract.instanceEvaluator = true;
Evaluators.prototype.$leaves.instanceEvaluator = true;
Evaluators.prototype.$evaluate.instanceEvaluator = true;
Evaluators.prototype.$mask.instanceEvaluator = true;
Evaluators.prototype.$encrypt.instanceEvaluator = true;
Evaluators.prototype.$default.instanceEvaluator = true;

const EVALUATORS = new Evaluators();

export {EVALUATORS as default, EVALUATORS}