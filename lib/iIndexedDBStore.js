(function() {
	"use strict";
	let iStore = require("./iStore");
	
	class iIndexedDBStore extends iStore {
		constructor(name,db) {
			super(name,db);
		}
		delete(key) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					delete data[key];
					if(key.indexOf("@")>=0) {
						let parts = key.split("@");
						//if(parts[0]===me.name) {
							let transaction = me.db().storage.db.transaction(["Values"],"readwrite"),
								request = transaction.objectStore("Values").delete(key);
							transaction.onerror = function(event) {
								reject(event.srcElement.error);
							};
							request.onsuccess = function(event) {
								me.save().then(() => {
									resolve();
								});
							}
							return;
						//}
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
						let transaction = me.db().storage.db.transaction(["Values"]),
							request = transaction.objectStore("Values").get(key);
						transaction.onerror = function(event) {
							reject(event.srcElement.error);
						};
						request.onsuccess = function(event) {
							result = data[key] = me.restore(request.result);
							resolve(result);
						}
						return;
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
				let transaction = me.db().storage.db.transaction(["Values"]), // perhaps add transaction to storage??
					request = transaction.objectStore("Values").get(me.__metadata__.name);
				transaction.oncomplete = function(event) {
					resolve(me.data);
				};
				transaction.onerror = function(event) {
					reject(event.srcElement.error);
				};
				request.onsuccess = function(event) {
					me.data = me.restore(request.result);
				}
			});
		}
		put(object) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.db().storage.open().then(() => {
					let keyProperty = me.db().keyProperty,
						transaction = me.db().storage.db.transaction(["Values"], "readwrite");
					transaction.objectStore("Values").put(me.normalize(object),object[keyProperty]);
					transaction.oncomplete = function(event) {
						resolve();
					};
					transaction.onerror = function(event) {
						reject(event.srcElement.error);
					};
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
				let transaction = me.db().storage.db.transaction(["Values"], "readwrite"),
					request = transaction.objectStore("Values").put(me.normalize(me.data),me.__metadata__.name);
				transaction.oncomplete = function(event) {
					resolve();
				};
				transaction.onerror = function(event) {
					reject(event.srcElement.error);
				};
				request.onerror = function(event) {
					reject(event.srcElement.error);
				}
			});
		}
		set(key,value) {
			let me = this;
			return new Promise((resolve,reject) => {
				me.initialized().then((data) => {
					me.addScope(value);
					data[key] = value;
					me.save().then(() => {
						resolve();
					});
				});
			});
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iIndexedDBStore;
	}
	if(typeof(window)!=="undefined") {
		window.iIndexedDBStore = iIndexedDBStore;
	}
})();