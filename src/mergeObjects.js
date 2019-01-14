export function mergeObjects(target,...sources) {
	const _merge = (target,source,deltas) => {
		if(source instanceof Date) return source;
		for(const key in source) {
			const value = source[key],
				type = typeof(value),
				targetvalue = target[key];
			if(targetvalue!==value) {
				deltas[key] = targetvalue;
			}
			if(value && type==="object") {
				if(!target[key] || typeof(target[key])!=="object") {
					deltas[key] = target[key] = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
				}
				//if(!target[key] || typeof(target[key])!=="object") target[key] = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
				//target[key] = _merge(target[key],value,deltas[key]={});
				const childdeltas = mergeObjects(target[key],value);
				if(childdeltas) {
					deltas[key] = childdeltas;
				}
			} else {
				target[key] = value;
			}
		}
		return target;
	};
	const deltas = Object.create(Object.getPrototypeOf(target));
	for(const source of sources) _merge(target,source,deltas);
	if(Object.keys(deltas).length>0) return deltas;
}