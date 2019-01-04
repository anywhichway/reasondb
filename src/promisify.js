export function promisify(f,scope) {
	if(Object.getPrototypeOf(f)!==Object.getPrototypeOf(async ()=>{})) {
		scope[f.name] = async function(...args) { return new Promise((resolve,reject) => f.call(this,...args,(err,result) => { if(err) { reject(err); return; } resolve(result); }))}
	}
}