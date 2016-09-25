(function() {
	"use strict";
	let iIndexedDBStore = require("./iIndexedDBStore");
		
	class iIndexedDB {
		constructor(name) {
			this.name = name;
		}
		createStore(name,db) {
			return new iIndexedDBStore(name,db);
		}
		close() {
			me.db.close();
			me.db = null;
		}
		open() {
			let me = this;
			return new Promise((resolve,reject) => {
				if(me.db) {
					resolve();
					return;
				}
				let request = indexedDB.open(me.name,2);
				request.onerror = function(event) {
				  reject(event);
				};
				request.onupgradeneeded = function(event) {
					let db = event.target.result;
					try {
						db.deleteObjectStore("Values");
					} catch(e) {
						// ignore
					}
					db.createObjectStore("Values");
				};
				request.onsuccess = function(event) {
				  me.db = event.target.result;
				  resolve();
				};
			});
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iIndexedDB;
	}
	if(typeof(window)!=="undefined") {
		window.iIndexedDB = iIndexedDB;
	}
})();