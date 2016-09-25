(function() {
	"use strict";
	let iStore = require("./iStore");
	
	class iMemStore extends iStore {
		constructor(name,db) {
			super(name,db);
		}
		delete(key) {
			delete this[key];
			return Promise.resolve();
		}
		get(key) {
			return Promise.resolve(this[key]);
		}
		put(object) {
			let me = this,
				keyProperty = me.db.keyProperty;
			return me.set(object[keyProperty],object);
		}
		load(force) {
			return Promise.resolve();
		}
		save(value,key) {
			return this.set(key,value);
		}
		set(key,value) {
			this[key] = value;
			return Promise.resolve();
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iMemStore;
	}
	if(typeof(window)!=="undefined") {
		window.iMemStore = iMemStore;
	}
})();