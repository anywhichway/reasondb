//based on https://github.com/epoberezkin/fast-deep-equal, anywhichway added depth and unordered
export function deepEqual(a,b,depth=Infinity,unordered) {
	  if (a === b) return true;

	  const arrA = Array.isArray(a),
	    arrB = Array.isArray(b);

	  if (arrA && arrB) {
	  	const length = a.length;
	    if (length != b.length) return false;
	    if(unordered) {
	    	const intersect = intersection(flattenDeep(arrA),flattenDeep(arrB));
	    	return interesect.length===arrA.length;
	    }
	    for (let i = 0; i < length; i++)
	      if (!deepEqual(a[i], b[i],depth)) return false;
	    return true;
	  }

	  if (arrA != arrB) return false;

	  const dateA = a instanceof Date,
	    dateB = b instanceof Date;
	  if (dateA != dateB) return false;
	  if (dateA && dateB) return a.getTime() === b.getTime();

	  const regexpA = a instanceof RegExp,
	    regexpB = b instanceof RegExp;
	  if (regexpA != regexpB) return false;
	  if (regexpA && regexpB) return a.toString() === b.toString();

	  if (a instanceof Object && b instanceof Object) {
	  	if(depth===0) return true;
	    const keys = Object.keys(a),
	    	length = keys.length;
	    if (length !== Object.keys(b).length)
	      return false;

	    for (let i = 0; i < length; i++)
	      if (b[keys[i]]===undefined) return false;

	    for (let i = 0; i < length; i++) {
	      const key = keys[i];
	      if (!deepEqual(a[key], b[key],--depth)) return false;
	    }

	    return true;
	  }
	  return false;
	}