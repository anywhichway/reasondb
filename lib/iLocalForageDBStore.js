(function() {
	"use strict";
	let iStore = require("./iStore"),
		LocalForage = require("localforage");
	class iLocalForageDBStore extends iStore {
		constructor(name,db,clear) {
			super(name,db);
			if(typeof(window)!=="undefined") {
				LocalForage.config({name:name})
				this.storage = LocalForage;
			} else {
				this.storage = new LocalForage("./db/" + name);
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
							me.storage.removeItem(key+".json").then(() => {
								me.save().then(() => {
									resolve();
								});
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
				keyProperty = me.db().keyProperty;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					let result = data[key];
					if(key.indexOf("@")>=0 && data[keyProperty] && data[keyProperty][key]) {
						let parts = key.split("@");
						if(parts[0]===me.name) {
							me.storage.getItem(key+".json").then((value) => {
								result = data[key] = me.restore(value);
								resolve(result);
							});
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
				me.db().storage.open().then(() => {
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
				me.storage.getItem(me.__metadata__.name+".json").then((value) => {
					me.data = value;
					resolve(me.data); 
				})
			});
		}
		put(object) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.db().storage.open().then(() => {
					let keyProperty = me.db().keyProperty;
					me.storage.setItem(object[keyProperty]+".json",me.normalize(object)).then(() => {
						resolve();
					});
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
				me.storage.setItem(me.__metadata__.name+".json",me.normalize(me.data));
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
	if(typeof(window)!=="undefined") {
		window.iLocalForageDBStore = iLocalForageDBStore;
		module.exports = iLocalForageDBStore;
	} else {
		let r = require;
		module.exports = r("./iLocalStorageDBStore");
	}
})();