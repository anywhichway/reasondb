(function() {
	"use strict";
	let Database = require("./lib/Database"),
		Date = require("./lib/Date"),
		Array = require("./lib/Array");

	if(typeof(module)!=="undefined") {
		module.exports = Database;
	}
	if(typeof(window)!=="undefined") {
		window.ReasonDB = Database;
	}
})();