let intersection = require("./intersection");
	
function IndexValue(value,id,node,oldvalue) {
	let type = typeof(value),
		oldtype = typeof(oldvalue);
	if(value && type==="object") {
		if(!value.constructor.index) { value.constructor.index = new Index(value.constructor); }
		value.constructor.index.put(value);
		type = value.constructor.name + "@";
		value = value.id;
	} 
	if(!node[value]) { node[value]={}; }
	if(!node[value][type]) { node[value][type]={}; }
	node[value][type][id] = true;
	if(oldvalue && oldtype==="object") {
		oldtype = oldvalue.constructor.name + "@";
		oldvalue = oldvalue.id;
	} 
	if(!node[oldvalue]) { return; }
	if(!node[oldvalue][oldtype]) { return; }
	delete node[oldvalue][oldtype][id];
}


function Index(cls,db) {
	this.metadata = {
		className: cls.name,
		db: db,
		nextid: 0,
		instances: {}
	}
}
Index.prototype.uid = function() {
	return  this.metadata.className + "@" + (++this.metadata.nextid);
}
Index.prototype.get = function(key) {
	return Promise.resolve(this.metadata.instances[key]);
}
Index.prototype.put = function(object) {
	let index = this;
	if(!object || typeof(object)!=="object") {
		return;
	}
	if(object.id==null) { object.id = this.uid(); }
	index.metadata.instances[object.id] = object;
	Object.keys(object).forEach((property) => {
		function get() {
			return get.value;
		}
		function set(value) {
			let me = this,
				cls = me.constructor,
				type = typeof(value),
				oldvalue = get.value,
				db = index.metadata.db;
			get.value = value;
			if(oldvalue!==value) {
				if(value && type==="object") {
					if(!value.constructor.index) { value.constructor.index = new Index(value.constructor); }
					value.constructor.index.put(value);
				}
				if(!index[property]) { index[property] = {}; }
				IndexValue(value,me.id,index[property],oldvalue);
				
				if(index.metadata.db) {
					if(db.patterns[cls.name] && db.patterns[cls.name][property]) {
						Object.keys(db.patterns[cls.name][property]).forEach((test) => {
							if(db.patterns[cls.name][property][test][type]) {
								Object.keys(db.patterns[cls.name][property][test][type]).forEach((testvalue) => {
									if(Index[test](value,Index.$coerce(testvalue,type))) {
										Object.keys(db.patterns[cls.name][property][test][type][testvalue]).forEach((patternId) => {
											Object.keys(db.patterns[cls.name][property][test][type][testvalue][patternId]).forEach((classVar) => {
												db.patterns[cls.name][property][test][type][testvalue][patternId][classVar][me.id] = me;
											});
											let results = {},
												pattern = index.metadata.db.Pattern.index.metadata.instances[patternId];
											if(pattern.matches.every((matches) => {
												return Object.keys(matches).every((classVar) => {
													let ids = Object.keys(matches[classVar]);
													results[classVar]  = (results[classVar]  ? intersection(results[classVar],ids) : ids);
													return results[classVar]  && results[classVar] .length > 0;
												});
											})) {
												pattern.then(results);
											}
										});
									}
								});
							}
						});
					}
				}
			}
		}
		let value = object[property],
			desc = Object.getOwnPropertyDescriptor(object,property);
		if(desc.set+""!==set+"") {
			desc.get = get;
			desc.set = set;
			delete desc.writable;
			delete desc.value;
			Object.defineProperty(object,property,desc);
		}
		object[property] = value;
	});
}
Index.prototype.match = function(pattern,classVars,matches) {
	function match(v1,v2,results,test) {
		let type = typeof(v2);
		if(v1 && typeof(v1)==="object")  {
			if(Object.keys(v1).every((key) => {
				if(key[0]==="$") {
					if(Index[key]) {
						results = match(v1[key],v2,results,key);
					}
					if(classVars[key]) { //{$e1: "name"}
						//results = join(me[key],)
					}
				}
				if(v2 && type==="object") {
					results = match(v1[key],v2[key],results,test);
				}
				return results
			})) {
				return results;
			};
		} else if(test) {
			return test(Index.$coerce(v1,type),v2);
		}
		return v1===v2;
	}
	function join(leftNode,rightNode,results,test) {
		let ids = [],
			left = [],
			right = [];
		Object.keys(leftNode).forEach((leftValue) => {
			Object.keys(leftNode[leftValue]).forEach((leftType) => {
				left = left.concat(Object.keys(leftNode[leftValue][leftType]));
				if(test) {
					Object.keys(rightNode).forEach((rightValue) => {
						if(rightNode[rightValue][leftType]) {
							if(test(Index.$coerce(leftValue,leftType),Index.$coerce(rightValue,leftType))) {
								right = right.concat(Object.keys(rightNode[rightValue][leftType]));
							}
						}
					});
				} else if(rightNode[leftValue][leftType]) {
					right = right.concat(Object.keys(rightNode[leftValue][leftType]));
				}
				ids = ids.concat(intersection(left,right));
			});
		});
		return (results ? intersection(results,ids) : intersection(ids,ids));
	}
	let me = this,
		results;
	if(Object.keys(pattern).every((property) => {
		if(me[property]) {
			let value = pattern[property],
				type = typeof(value),
				test;
			if(value && type==="object") {
				let testname = Object.keys(value)[0];
				if(testname[0]==="$") {
					if(Index[testname]) {
						test = Index[testname];
						value = value[testname];
						type = typeof(value);
					} else if(classVars[testname] && classVars[testname].index && classVars[testname].index[value[testname]]) { // e.g. {$e1: {name: {$e2: "name"}}}
						results = join(me[property],classVars[testname].index[value[testname]],matches[testname]);
						return results && results.length > 0;
					}
				}
			}
			if(value && type==="object") {
				let keys = Object.keys(value);
				if(keys[0][0]==="$" && classVars[keys[0]]) { // e.g. {$e1: {name: {$eq: {$e2: "name"}}}}
					if(classVars[keys[0]].index[value[keys[0]]]) {
						results = join(me[property],classVars[keys[0]].index[value[keys[0]]],matches[keys[0]],test);
						return results && results.length > 0;
					}
				}
				return Object.keys(me[property]).every((instanceId) => {
					let cache = Index.prototype.match.cache,
						tmp = [];
					Object.keys(me[property][instanceId]).forEach((className) => {
						if(instanceId.indexOf(className)!==0) { return; }
						let cls = cache[className];
						if(!cls) {
							cache[className] = cls = me.metadata.db[className.substring(0,className.length-1)];
						}
						if(!cls) {
							cache[className] = cls = new Function("return " + className.substring(0,className.length-1))();
						}
						if(cls) {
							let instance = cls.index.metadata.instances[instanceId];
							if(match(value,instance,results)) {
								tmp = tmp.concat(Object.keys(me[property][instanceId][className]));
							}
						}
					});
				results = (results ? intersection(results,tmp) : tmp);
				return results && results.length > 0;
				});
			} else if(test) { // e.g. {$e1: {name: {$eq: "Mary"}}}
				let ids  = [];
				Object.keys(me[property]).forEach((testvalue) => {
					if(me[property][testvalue][type] && test(Index.$coerce(testvalue,type),value)) {
						ids = ids.concat(Object.keys(me[property][testvalue][type]));
					}
				});
				results = (results ? intersection(results,ids) : ids);
				return results && results.length > 0;
			} else if(me[property][value] && me[property][value][type]){ // e.g. {$e1: {name: "Mary"}}
				let ids = Object.keys(me[property][value][type]);
				results = (results ? intersection(results,ids) : ids);
				return results && results.length > 0;
			}
		}
	})) {
		return results;
	}
}
Index.prototype.match.cache = {};
Index.$coerce = function(value,type) {
	return value;
}
Index.$eq = function(v1,v2) {
	return v1==v2;
}

module.exports = Index;
