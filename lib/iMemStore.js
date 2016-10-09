(function() {
	"use strict";
	let iStore = require("./iStore");
	
	class iMemStore extends iStore {
		constructor(name,db) {
			super(name,db);
		}
	}
	/*	async delete(key) {
			delete this[key];
		}
		async get(key) {
			this[key];
		}
		async put(object) {
			let me = this,
				keyProperty = me.db.keyProperty;
			return me.set(object[keyProperty],object);
		}
		async load(force) {
			;
		}
		async save(value,key) {
			return this.set(key,value);
		}
		async set(key,value) {
			this[key] = value;
		}
	*/
	
	iMemStore.prototype.delete = async function(key) {
		delete this[key];
		return Promise.resolve();
	}
	iMemStore.prototype.get = async function(key) {
		return Promise.resolve(this[key]);
	}
	iMemStore.prototype.put = async function(object) {
		let me = this,
		keyProperty = me.db.keyProperty;
		return me.set(object[keyProperty],object);
	}
	iMemStore.prototype.load = async function(force) {
		return Promise.resolve();
	}
	iMemStore.prototype.save = async function(value,key) {
		return this.set(key,value);
	}
	iMemStore.prototype.set = async function(key,value) {
		this[key] = value;
		return Promise.resolve();
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iMemStore;
	}
	if(typeof(window)!=="undefined") {
		window.iMemStore = iMemStore;
	}
})();