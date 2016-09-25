(function() {
	"use strict";
	//soundex from https://gist.github.com/shawndumas/1262659
	function soundex(s) {
		var a = (s+"").toLowerCase().split(""),
		f = a.shift(),
		r = "",
		codes = {
			a: "", e: "", i: "", o: "", u: "",
			b: 1, f: 1, p: 1, v: 1,
			c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
			d: 3, t: 3,
			l: 4,
			m: 5, n: 5,
			r: 6
		};
	
		r = f +
		a.map(function (v) { return codes[v]; }).filter(function (v, i, a) {
			return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
		}).join("");
	
		return (r + "000").slice(0, 4).toUpperCase();
	}
	
	if(typeof(module)!=="undefined") {
		module.exports = soundex;
	}
	if(typeof(window)!=="undefined") {
		window.intersection = soundex;
	}
})();