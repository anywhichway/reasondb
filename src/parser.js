import cleaner from "little-cleaner";
import {DateTime,Duration} from "luxon";
import { all } from 'mathjs';
import * as numbers from 'numbers';
import * as turf from "@turf/turf";
import GeoPoint from "./geo-point.js";

import functions from "./template-functions.js";

const mathjs = all;

const _Date = Date;
Date = function(arg=_Date.now()) {
    return new _Date(arg);
}
Object.setPrototypeOf(Date,_Date);

const Geo = turf;

const DEFAULTCONTEXT = {};
Object.assign(DEFAULTCONTEXT,functions);
Object.assign(DEFAULTCONTEXT,{Date});
Object.assign(DEFAULTCONTEXT,{DateTime});
Object.assign(DEFAULTCONTEXT,{Duration});
const _Duration = DEFAULTCONTEXT.Duration,
    _fromObject = Duration.prototype.fromObject,
    _fromISO = Duration.prototype.fromOISO;
Duration.prototype.fromObject = function(options) {
    _fromObject.call(this,options, { conversionAccuracy: 'longterm' });
}
Duration.prototype.fromISO = function(options) {
    _fromISO.call(this,options, { conversionAccuracy: 'longterm' });
}
DEFAULTCONTEXT.Duration = function (options) { // simplify Duration creation
    const {start} = options;
    if (start === undefined) {
        return _Duration.fromObject(options);
    }
    return new Duration(options);
};
Object.setPrototypeOf(DEFAULTCONTEXT.Duration,Object.getPrototypeOf(_Duration));

DEFAULTCONTEXT.GeoPoint = GeoPoint;
for(const [key,desc] of Object.entries(Object.getOwnPropertyDescriptors(Geo))) {
    if(key!=="__esModule") {
        Object.defineProperty(DEFAULTCONTEXT,key,desc);
    }
}

DEFAULTCONTEXT.Object = {
        values(object) {
            return Object.values(object);
        },
        entries(object) {
            return Object.entries(object);
        },
        keys(object) {
            return Object.keys(object);
        }
};
DEFAULTCONTEXT.Array = {
    join(delimiter="",arg1,...args) {
        if(Array.isArray(arg1)) {
            return functions.join(delimiter,...arg1,...args);
        }
        return [arg1,...args].join(delimiter);
    },
    concat(arg1,...args) {
        if(Array.isArray(arg1)) {
            return functions.concat(...arg1,...args)
        }
        return args.reduce((result,arg) => result + arg,"");
    }
}
DEFAULTCONTEXT.Function = null;
DEFAULTCONTEXT.function = null;
Object.assign(DEFAULTCONTEXT,mathjs);
Object.assign(DEFAULTCONTEXT,numbers);


class Parser {
    evaluate = function(expression,context={}) {
        cleaner.options.eval = false;
        const cleaned = cleaner(expression);
        if(cleaned===undefined) {
            throw new Error(`Illegal expression: ${expression}`);
        }
        return (Function("defaultcontext","context","with(defaultcontext) { with(context) { return " + cleaned + "}}")).call(context.this,DEFAULTCONTEXT,context)
    }
}
const PARSER = new Parser();

export {PARSER as default, PARSER,DEFAULTCONTEXT}