export function mergeObjects(target,...sources) {
	const _merge = (target,source,deltas) => {
		if(source instanceof Date) return source;
		for(const key in source) {
			const value = source[key],
				type = typeof(value),
				targetvalue = target[key];
			if(targetvalue!==value && targetvalue!==undefined) deltas[key] = targetvalue;
			if(value && type==="object") {
				if(!target[key] || typeof(target[key])!=="object") target[key] = Array.isArray(value) ? [] : {};
				target[key] = _merge(target[key],value,deltas[key]={});
			} else {
				target[key] = value;
			}
		}
		return target;
	};
	const deltas = {};
	for(const source of sources) _merge(target,source,deltas);
	if(Object.keys(deltas).length > 0) return deltas;
}