export function extract(source,partial,types) {
	const result = {};
	for(const key in partial) {
		const value = partial[key],
			sourcevalue = source[key];
		if(value && typeof(value)==="object") {
			if(source && typeof(sourcevalue)==="object") {
				result[key] = partial(sourcevalue,value);
			}
		} else if(!types || (value!=="undefined" && typeof(sourcevalue)===value) || (value==="undefined" && sourcevalue!==undefined)) {
			result[key] = sourcevalue;
		}
	}
	return result;
}