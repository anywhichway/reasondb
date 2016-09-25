(function() {
	"use strict";
	let iLocalStorageDBStore = require("./iLocalStorageDBStore");
		
	class iLocalStorageDB {
		constructor(name) {
			this.name = name;
		}
		createStore(name,db,clear) {
			return new iLocalStorageDBStore(name,db,clear);
		}
		close() {
			
		}
		open() {
			return Promise.resolve();
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iLocalStorageDB;
	}
	if(typeof(window)!=="undefined") {
		window.iLocalStorageDB = iLocalStorageDB;
	}
})();