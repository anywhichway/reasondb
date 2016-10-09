(function() {
	"use strict";
	let iMemStore = require("./iMemStore");
		
	class iMemDB {
		constructor(name) {
			this.name = name;
		}
		createStore(name,db) {
			return new iMemStore(name,db);
		}
		async close() {
			
		}
		async open() {
			
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iMemDB;
	}
	if(typeof(window)!=="undefined") {
		window.iMemDB = iMemDB;
	}
})();