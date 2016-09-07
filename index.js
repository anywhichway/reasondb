(function() {
	"use strict";
	let Database = require("./lib/Database");

	if(typeof(module)!=="undefined") {
		module.exports = Database;
	}
	if(typeof(window)!=="undefined") {
		window.ReasonDB = Database;
	}
})();