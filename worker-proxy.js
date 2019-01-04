function WorkerProxy(workerPath,object,options={}) {
	const worker = new Worker(workerPath);
	worker.postMessage({action:"load",property:options.cname||object.constructor.name,options});
	let resolver;
	worker.onmessage = e => {
		let result = e.data;
		try {
			result = Function("return " + result)();
		} catch(err) {
			;
		}
		resolver(result);
	}
	return new Proxy(object,{
		get(target,property) {
			if(typeof(target[property])==="function") {
				return function(...argumentList) {
					return new Promise((resolve,reject) => {
						resolver = resolve;
						worker.postMessage({action:"apply",property,argumentList})
					})
				}
			}
			return new Promise((resolve,reject) => {
				resolver = resolve;
				worker.postMessage({action:"get",property});
			});
		},
		set(target,property,value) {
			return new Promise((resolve,reject) => {
				resolver = resolve;
				worker.postMessage({action:"set",property,value});
			});
		}
	});
}

if(typeof(self)!=="undefined") {
	let object,
		propertyMap = {};
  onmessage = async function(e) {
  	if(e.data.action==="load") {
  		importScripts(e.data.property.toLowerCase()+".js");
  		if(e.data.options.instanceVariable) {
  			object = Function("return " + e.data.options.instanceVariable)();
  		} else {
  			object = Function("args","return new " + e.data.property + "(...args)")(e.data.options.argumentList||[]);
  		}
  		if(e.data.options.propertyMap) propertyMap = e.data.options.propertyMap;
  	} else if(e.data.action==="get") {
  		postMessage(object[propertyMap[e.data.property] || e.data.property]);
  	} else if(e.data.action==="set") { 
  		object[propertyMap[e.data.property] || e.data.property] = e.data.value;
  		postMessage(true);
  	} else if(e.data.action==="apply") {
  		postMessage(await object[propertyMap[e.data.property] || e.data.property](...e.data.argumentList))
  	}
  }
}