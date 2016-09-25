(function() {
	"use strict";
	let iStore = require("./iStore"),
		LocalStorage;
	
	if(typeof(window)!=="undefined") {
		LocalStorage = window.localStorage;
	} else {
		let r = require,
			fs = r("fs");
		try {
			fs.mkdirSync("./db");
		} catch(e) {
			// ignore
		}
		LocalStorage = r("node-localstorage").LocalStorage; // indirection avoids load of unused code into browserfied version
	}
	
	class iLocalStorageDBStore extends iStore {
		constructor(name,db,clear) {
			super(name,db);
			if(typeof(window)!=="undefined") {
				this.storage = LocalStorage;
			} else {
				this.storage = new LocalStorage("./db/" + name);
			}
			if(clear) {
				this.storage.clear();
			}
		}
		delete(key) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					delete data[key];
					if(key.indexOf("@")>=0) {
						let parts = key.split("@");
						if(parts[0]===me.name) {
							me.storage.removeItem(key+".json");
							me.save().then(() => {
								resolve();
							});
							return;
						}
					}
					me.save().then(() => {
						resolve();
					});
				});
			});
		}
		get(key) {
			let me = this,
				keyProperty = me.db.keyProperty;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					let result = data[key];
					if(key.indexOf("@")>=0 && data[keyProperty] && data[keyProperty][key]) {
						let parts = key.split("@");
						if(parts[0]===me.name) {
							result = data[key] = me.restore(JSON.parse(me.storage.getItem(key+".json")));
							resolve(result);
							return;
						}
					}
					resolve(result);
				});
			});
		}
		initialized() {
			let me = this;
			return new Promise((resolve,reject) => {
				me.db.storage.open().then(() => {
					me.load().then((data) => {
						if(!data) {
							me.data = {};
							me.save().then(() => {
								resolve(me.data);
							});
						} else {
							resolve(data);
						}
					});
				});
			});
		}
		load(force) {
			let me = this;
			return new Promise((resolve,reject) => {
				if(me.data && !force) {
					resolve(me.data);
					return;
				}
				resolve(JSON.parse(me.storage.getItem(me.name+".json")));
			});
		}
		put(object) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.db.storage.open().then(() => {
					let keyProperty = me.db.keyProperty;
					me.storage.setItem(object[keyProperty]+".json",JSON.stringify(me.normalize(object)));
					resolve();
				});	
			});
		}
		save() {
			let me = this;
			return new Promise((resolve,reject) => {
				if(!me.data) {
					resolve();
					return;
				}
				me.storage.setItem(me.name+".json",JSON.stringify(me.normalize(me.data)));
				resolve();
			});
		}
		set(key,value) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					data[key] = value;
					me.save().then(() => {
						resolve();
					});
				});
			});
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iLocalStorageDBStore;
	}
	if(typeof(window)!=="undefined") {
		window.iLocalStorageDBStore = iLocalStorageDBStore;
	}
})();