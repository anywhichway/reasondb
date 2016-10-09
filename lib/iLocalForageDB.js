(function() {
	"use strict";
	let iLocalForageDBStore = require("./iLocalForageDBStore");
	if(typeof(window)!=="undefined" && window.iLocalForageDBStore)	{
		iLocalForageDBStore = window.iLocalForageDBStore;
	}
	class iLocalForageDB {
		constructor(name) {
			this.name = name;
		}
		createStore(name,db,clear) {
			return new iLocalForageDBStore(name,db,clear);
		}
		close() {
			
		}
		open() {
			return Promise.resolve();
		}
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = iLocalForageDB;
	}
	if(typeof(window)!=="undefined") {
		window.iLocalForageDB = iLocalForageDB;
	}
})();