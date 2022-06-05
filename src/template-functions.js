import fetch from "node-fetch";
import {deepEqual} from "fast-equals";

const functions = {
    format(string,...args) {
        return string.replace(/{([0-9]+)}/g, (match, index) => {
            // check if the argument is present
            let value = args[index],
                type = typeof(value);
            if(value && type==="object") {
                value = JSON.stringify(value);
            }
            return type == 'undefined' ? match : value;
        });
    },
    eq(...args) {
        return deepEqual(...args);
    },
    neq(...args) {
        return !functions.eq(...args);
    },
    or(arg1,...args) {
        if(Array.isArray(arg1)) {
            return functions.or(...args,arg1);
        }
        return args.some(arg => arg)
    },
    ora(...args) {
        if(Array.isArray(arg1)) {
            return functions.or(...arg1,...args);
        }
        return [arg1,...args].some((arg) => {
            const type = typeof (arg);
            if (type === "number" || type==="boolean") return arg;
            if(arg==="true") return true;
            arg = parseFloat(arg);
            if (isNaN(arg)) return false;
            else return arg;
        })
    },
    and(...args) {
        if(Array.isArray(arg1)) {
            return functions.and(...arg1,...args);
        }
        return args.every(arg => arg)
    },
    anda(...args) {
        if(Array.isArray(arg1)) {
            return functions.or(...arg1,...args);
        }
        return [arg1,...args].every((arg) => {
            const type = typeof (arg);
            if (type === "number" || type==="boolean") return arg;
            if(arg==="true") return true;
            arg = parseFloat(arg);
            if (isNaN(arg)) return false;
            else return arg;
        })
    },
    iff(test,a,b) {
        return test ? a : b
    },
    parseFloat(a) {
        return parseFloat(a);
    },
    parseInt(a) {
        return parseInt(a);
    },
    suma(arg1,...args) {
        if(Array.isArray(arg1)) {
            return functions.suma(...args,...arg1);
        }
        return [arg1,...args].reduce((sum,arg) => {
            const type = typeof (arg);
            if (type === "number") return sum += arg;
            if (type === "boolean") return sum += arg ? 1 : 0;
            if(arg==="true") return sum += 1;
            arg = parseFloat(arg);
            if (isNaN(arg)) return sum;
            else return sum += arg;
            return sum;
        })
    },
    product(arg1,...args) {
        if(Array.isArray(arg1)) {
            return functions.producta(...args,...arg1);
        }
        return [arg1,...args].reduce((product, arg) => {
            const type = typeof (arg);
            if (type === "number") return product * arg;
            if (type === "boolean") return product * (arg ? 1 : 0);
            if(arg==="true") return product;
            if(arg==="false") return 0;
            arg = parseFloat(arg);
            if (isNaN(arg)) return product;
            else return product * arg;
            return product;
        })
    },
    counta(arg1,...args) {
        if(Array.isArray(arg1)) {
            return functions.counta(...args,...arg1);
        }
        return args.length + 1;
    },
    count(arg1,...args) {
        if(Array.isArray(arg1)) {
            return functions.count(...args,...arg1);
        }
        return [arg1,...args].reduce((count, arg) => {
            return typeof (arg)==="number" ? count++ : count;
        }, 0)
    },
    countNumbery(arg1,...args) {
        if(Array.isArray(arg1)) {
            return functions.countNumbery(...args,...arg1);
        }
        return [arg1,...args].reduce((count, arg) => {
            const type = typeof (arg);
            if (type === "number" || type === "boolean" || arg==="true" || arg==="false" || !isNaN(parseFloat(arg))) {
                return count++;
            }
            return count;
        }, 0)
    },
    avga(arg1,...args) {
        if(Array.isArray(arg1)) {
            return functions.avga(...args,...arg1);
        }
        return functions.suma(arg1,...args) / functions.countNumbery(arg1,...args)
    },
    fetch(url, showError) {
        try {
            new URL(url);
        } catch (e) {
            return showError ? `${url} ${e}` : undefined;
        }
        return fetch(url)
            .then(res => {
                return showError && res.status >= 300 && bres.statusMessage ? `${res.status} ${res.statusMessage}` : res.text()
            })
            .then(text => {
                return text.replaceAll(/\"/g, '\\"'); // to do, try to parse based on response type?
            })
            .catch(e => {
                return showError ? `${url} ${e}` : undefined;
            })
    }
}

export {functions as default}