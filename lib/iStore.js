(function() {
	"use strict";
	
	class iStore {
		constructor(name,db) {
			this.name = name;
			this.db = db;
			this.scope = {};
		}
		addScope(value) {
			let me = this;
			if(value && typeof(value)==="object") {
				me.scope[value.constructor.name] = value.constructor;
				Object.keys(value).forEach((property) => {
					me.addScope(value[property]);
				});
			}
		}
		normalize(value,recursing) {
			let me = this,
				type = typeof(value),
				result;
			if(value && type==="object") {
				let json = (value.toJSON ? value.toJSON() : value);
				if(typeof(json)!=="object") {
					json = value;
				}
				me.addScope(value);
				result = {};
				if(recursing  && json[me.db.keyProperty]) {
					result[me.db.keyProperty] = json[me.db.keyProperty];
				} else {
					let keys = Object.keys(json);
					if(json instanceof Date) {
						result.time = json.getTime();
					}
					keys.forEach((key,i) => {
						result[key] = me.normalize(json[key],true);
					});
				}
			} else {
				result = value;
			}
			return result;
		}
		restore(json) {
			let me = this;
			if(json && typeof(json)==="object") {
				let key = json[me.db.keyProperty];
				if(typeof(key)==="string") {
					let parts = key.split("@"),
						cls = me.scope[parts[0]];
					if(!cls) {
						try {
							me.scope[parts[0]] = cls = Function("return " + parts[0]);
						} catch(e) {
							Object.keys(json).forEach((property) => {
								json[property] = me.restore(json[property]);
							});
							return json;
						}
						me.scope[parts[0]] = cls;
					}
					if(json instanceof cls) {
						Object.keys(json).forEach((property) => {
							json[property] = me.restore(json[property]);
						});
						return json;
					}
					let instance = Object.create(cls.prototype);
					Object.keys(json).forEach((property) => {
						instance[property] = me.restore(json[property]);
					});
					return instance;
				}
			}
			return json;
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iStore;
	}
	if(typeof(window)!=="undefined") {
		window.iCache = iStore;
	}
})();