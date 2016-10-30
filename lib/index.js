"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise2 = require("babel-runtime/core-js/promise");

var _promise3 = _interopRequireDefault(_promise2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getOwnPropertyNames = require("babel-runtime/core-js/object/get-own-property-names");

var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* 
The MIT License (MIT)

Copyright (c) 2016 AnyWhichWay, Simon Y. Blackwell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function () {
	var _uuid = void 0;
	if (typeof window === "undefined") {
		var r = require;
		_uuid = require("node-uuid");
	}

	/*async function asyncForEach(f) {
 	let iterable = this;
 	for(var i=0;i<iterable.length;i++) {
 		await f(iterable[i]);
 	}
 	return;
 }
 async function asyncEvery(f) {
 	let iterable = this;
 	for(var i=0;i<iterable.length;i++) {
 		let result = await f(iterable[i]);
 		if(!result) { return; }
 	}
 	return;
 }
 async function asyncSome(f) {
 	let iterable = this;
 	for(var i=0;i<iterable.length;i++) {
 		let result = await f(iterable[i]);
 		if(result) { return; }
 	}
 	return;
 }*/

	Array.indexKeys = ["length", "$max", "$min", "$avg", "*"];
	Array.reindexCalls = ["push", "pop", "splice", "reverse", "fill", "shift", "unshift"];
	Array.fromJSON = function (json) {
		var array = [];
		(0, _keys2.default)(json).forEach(function (key) {
			array[key] = json[key];
		});
		return array;
	};
	Object.defineProperty(Array.prototype, "$max", { enumerable: false, configurable: true,
		get: function get() {
			var result = void 0;this.forEach(function (value) {
				result = result != null ? value > result ? value : result : value;
			});return result;
		},
		set: function set() {}
	});
	Object.defineProperty(Array.prototype, "$min", { enumerable: false, configurable: true,
		get: function get() {
			var result = void 0;this.forEach(function (value) {
				result = result != null ? value < result ? value : result : value;
			});return result;
		},
		set: function set() {}
	});
	Object.defineProperty(Array.prototype, "$avg", { enumerable: false, configurable: true,
		get: function get() {
			var result = 0,
			    count = 0;
			this.forEach(function (value) {
				var v = value.valueOf();
				if (typeof v === "number") {
					count++;
					result += v;
				}
			});
			return result / count;
		},
		set: function set() {}
	});

	Date.indexKeys = ["*"];
	Date.reindexCalls = [];
	Date.fromJSON = function (json) {
		var dt = new Date(json.time);
		(0, _keys2.default)(json).forEach(function (key) {
			if (key !== "time") {
				dt[key] = json[key];
			}
		});
		return dt;
	};
	(0, _getOwnPropertyNames2.default)(Date.prototype).forEach(function (key) {
		if (key.indexOf("get") === 0) {
			var name = key.indexOf("UTC") >= 0 ? key.slice(3) : key.charAt(3).toLowerCase() + key.slice(4),
			    setkey = "set" + key.slice(3),
			    get = Function("return function() { return this." + key + "(); }")(),
			    set = Function("return function(value) { " + (Date.prototype[setkey] ? "return this." + setkey + "(value); " : "") + "}")();
			(0, _defineProperty2.default)(Date.prototype, name, { enumerable: false, configurable: true, get: get, set: set });
			Date.indexKeys.push(name);
			if (Date.prototype[setkey]) {
				Date.reindexCalls.push(setkey);
			}
		}
	});

	/*
  * https://github.com/Benvie
  * improvements 2015 by AnyWhichWay
  */
	function intersection(h) {
		var a = arguments.length;if (0 === a) return [];if (1 === a) return intersection(h, h);var e = 0,
		    k = 0,
		    l = 0,
		    m = [],
		    d = [],
		    n = new _map2.default(),
		    b;do {
			var p = arguments[e],
			    q = p.length,
			    f = 1 << e;b = 0;if (!q) return [];k |= f;do {
				var g = p[b],
				    c = n.get(g);"undefined" === typeof c ? (l++, c = d.length, n.set(g, c), m[c] = g, d[c] = f) : d[c] |= f;
			} while (++b < q);
		} while (++e < a);a = [];b = 0;do {
			d[b] === k && (a[a.length] = m[b]);
		} while (++b < l);return a;
	}

	//soundex from https://gist.github.com/shawndumas/1262659
	function soundex(a) {
		a = (a + "").toLowerCase().split("");var c = a.shift(),
		    b = "",
		    d = { a: "", e: "", i: "", o: "", u: "", b: 1, f: 1, p: 1, v: 1, c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2, d: 3, t: 3, l: 4, m: 5, n: 5, r: 6 },
		    b = c + a.map(function (a) {
			return d[a];
		}).filter(function (a, b, e) {
			return 0 === b ? a !== d[c] : a !== e[b - 1];
		}).join("");return (b + "000").slice(0, 4).toUpperCase();
	};

	// http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	//Shanti R Rao and Potluri M Rao, "Sample Size Calculator", 
	//Raosoft Inc., 2009, http://www.raosoft.com/samplesize.html
	//probCriticalNormal function is adapted from an algorithm published
	//in Numerical Recipes in Fortran.
	function probCriticalNormal(a) {
		var d, e, b, c;b = [0, -.322232431088, -1, -.342242088547, -.0204231210245, -4.53642210148E-5];var f = [0, .099348462606, .588581570495, .531103462366, .10353775285, .0038560700634];a = .5 - a / 2;if (1E-8 >= a) b = 6;else if (.5 == a) b = 0;else {
			a = Math.sqrt(Math.log(1 / (a * a)));d = b[5];e = f[5];for (c = 4; 1 <= c; c--) {
				d = d * a + b[c], e = e * a + f[c];
			}b = a + d / e;
		}return b;
	};
	function samplesize(confidence, margin, population) {
		var response = 50,
		    pcn = probCriticalNormal(confidence / 100.0),
		    d1 = pcn * pcn * response * (100.0 - response),
		    d2 = (population - 1.0) * (margin * margin) + d1;
		if (d2 > 0.0) return Math.ceil(population * d1 / d2);
		return 0.0;
	}

	function CXProduct(collections, filter) {
		this.collections = collections ? collections : [];
		this.filter = filter;
		Object.defineProperty(this, "length", { set: function set() {}, get: function get() {
				if (this.collections.length === 0) {
					return 0;
				}if (this.start !== undefined && this.end !== undefined) {
					return this.end - this.start;
				};var size = 1;this.collections.forEach(function (collection) {
					size *= collection.length;
				});return size;
			} });
		Object.defineProperty(this, "size", { set: function set() {}, get: function get() {
				return this.length;
			} });
	}
	// there is probably an alogorithm that never returns null if index is in range and takes into account the restrict right
	CXProduct.prototype.get = function (index) {
		var me = this,
		    c = [];
		function get(n, collections, dm, c) {
			for (var i = collections.length; i--;) {
				c[i] = collections[i][(n / dm[i][0] << 0) % dm[i][1]];
			}
		}
		for (var dm = [], f = 1, l, i = me.collections.length; i--; f *= l) {
			dm[i] = [f, l = me.collections[i].length];
		}
		get(index, me.collections, dm, c);
		if (me.filter(c)) {
			return c.slice(0);
		}
	};

	var Cursor = function () {
		function Cursor(classes, cxProductOrRows, projection) {
			var classVars = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
			(0, _classCallCheck3.default)(this, Cursor);

			var me = this;
			me.classes = classes;
			if (Array.isArray(cxProductOrRows)) {
				me.rows = cxProductOrRows;
			} else {
				me.cxproduct = cxProductOrRows;
			}
			me.projection = projection;
			me.classVarMap = {};
			me.classVars = classVars;
			(0, _keys2.default)(classVars).forEach(function (classVar, i) {
				me.classVarMap[classVar] = i;
			});
		}

		(0, _createClass3.default)(Cursor, [{
			key: "first",
			value: function () {
				var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(count) {
					var cursor;
					return _regenerator2.default.wrap(function _callee$(_context) {
						while (1) {
							switch (_context.prev = _context.next) {
								case 0:
									cursor = this;
									return _context.abrupt("return", new _promise3.default(function (resolve, reject) {
										var results = [];
										cursor.forEach(function (row) {
											if (results.length < count) {
												results.push(row);
											}
											if (results.length === count) {
												resolve(results);
											}
										}).then(function () {
											if (results.length < count) {
												resolve(results);
											}
										});
									}));

								case 2:
								case "end":
									return _context.stop();
							}
						}
					}, _callee, this);
				}));

				function first(_x2) {
					return _ref.apply(this, arguments);
				}

				return first;
			}()
		}, {
			key: "forEach",
			value: function () {
				var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(f) {
					var cursor;
					return _regenerator2.default.wrap(function _callee2$(_context2) {
						while (1) {
							switch (_context2.prev = _context2.next) {
								case 0:
									cursor = this;
									return _context2.abrupt("return", new _promise3.default(function (resolve, reject) {
										var promises = [],
										    results = [],
										    i = 0;
										function rows() {
											promises.push(cursor.get(i).then(function (row) {
												if (row) {
													var result = f(row, i, cursor);
													if (!(result instanceof _promise3.default)) {
														result = _promise3.default.resolve(result);
													}
													results.push(result);
												}
											}));
											i++;
											if (i < cursor.maxCount) {
												rows();
											}
										}
										rows();
										_promise3.default.all(promises).then(function (rows) {
											resolve(results);
										});
										//resolve(promises);
									}));

								case 2:
								case "end":
									return _context2.stop();
							}
						}
					}, _callee2, this);
				}));

				function forEach(_x3) {
					return _ref2.apply(this, arguments);
				}

				return forEach;
			}()
		}, {
			key: "every",
			value: function () {
				var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(f) {
					var cursor, result;
					return _regenerator2.default.wrap(function _callee3$(_context3) {
						while (1) {
							switch (_context3.prev = _context3.next) {
								case 0:
									cursor = this, result = true;
									return _context3.abrupt("return", new _promise3.default(function (resolve, reject) {
										cursor.forEach(function (row) {
											if (result && !f(row)) {
												result = false;
												resolve(false);
											};
										}).then(function () {
											if (result) {
												resolve(result);
											}
										});
									}));

								case 2:
								case "end":
									return _context3.stop();
							}
						}
					}, _callee3, this);
				}));

				function every(_x4) {
					return _ref3.apply(this, arguments);
				}

				return every;
			}()
		}, {
			key: "random",
			value: function () {
				var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(count) {
					var cursor, maxcount, done, results, resolver, rejector, promise, select;
					return _regenerator2.default.wrap(function _callee4$(_context4) {
						while (1) {
							switch (_context4.prev = _context4.next) {
								case 0:
									select = function select() {
										var i = getRandomInt(0, cursor.maxCount - 1);
										if (!done[i]) {
											done[i] = true;
											cursor.get(i).then(function (row) {
												if (row) {
													if (results.length < count && results.length < maxcount) {
														results.push(row);
													}
													if (results.length === count || results.length === maxcount) {
														resolver(results);
														return;
													}
												} else {
													maxcount--;
												}
												select();
											});
										} else {
											select();
										}
									};

									cursor = this, maxcount = cursor.maxCount, done = {}, results = [], resolver = void 0, rejector = void 0, promise = new _promise3.default(function (resolve, reject) {
										resolver = resolve;rejector = reject;
									});

									select();
									return _context4.abrupt("return", promise);

								case 4:
								case "end":
									return _context4.stop();
							}
						}
					}, _callee4, this);
				}));

				function random(_x5) {
					return _ref4.apply(this, arguments);
				}

				return random;
			}()
		}, {
			key: "sample",
			value: function () {
				var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(confidence, margin) {
					var cursor, done, results, resolver, rejector, promise;
					return _regenerator2.default.wrap(function _callee5$(_context5) {
						while (1) {
							switch (_context5.prev = _context5.next) {
								case 0:
									cursor = this, done = {}, results = [], resolver = void 0, rejector = void 0, promise = new _promise3.default(function (resolve, reject) {
										resolver = resolve;rejector = reject;
									});

									cursor.count().then(function (population) {
										var count = samplesize(confidence, margin, population);
										function select() {
											var i = getRandomInt(0, cursor.maxCount - 1);
											if (!done[i]) {
												done[i] = true;
												cursor.get(i).then(function (row) {
													if (row) {
														if (results.length < count) {
															results.push(row);
														}
														if (results.length === count) {
															resolver(results);
															return;
														}
													}
													select();
												});
											} else {
												select();
											}
										}
										select();
									});
									return _context5.abrupt("return", promise);

								case 3:
								case "end":
									return _context5.stop();
							}
						}
					}, _callee5, this);
				}));

				function sample(_x6, _x7) {
					return _ref5.apply(this, arguments);
				}

				return sample;
			}()
		}, {
			key: "some",
			value: function () {
				var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(f) {
					var cursor, result;
					return _regenerator2.default.wrap(function _callee6$(_context6) {
						while (1) {
							switch (_context6.prev = _context6.next) {
								case 0:
									cursor = this, result = false;
									return _context6.abrupt("return", new _promise3.default(function (resolve, reject) {
										cursor.forEach(function (row) {
											if (f(row)) {
												result = true;
												resolve(true);
											}
										}).then(function () {
											if (!result) {
												resolve(false);
											}
										});
									}));

								case 2:
								case "end":
									return _context6.stop();
							}
						}
					}, _callee6, this);
				}));

				function some(_x8) {
					return _ref6.apply(this, arguments);
				}

				return some;
			}()
		}, {
			key: "count",
			value: function () {
				var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
					var cursor, i;
					return _regenerator2.default.wrap(function _callee7$(_context7) {
						while (1) {
							switch (_context7.prev = _context7.next) {
								case 0:
									cursor = this, i = 0;
									return _context7.abrupt("return", new _promise3.default(function (resolve, reject) {
										cursor.forEach(function (row) {
											i++;
										}).then(function () {
											resolve(i);
										});
									}));

								case 2:
								case "end":
									return _context7.stop();
							}
						}
					}, _callee7, this);
				}));

				function count() {
					return _ref7.apply(this, arguments);
				}

				return count;
			}()
		}, {
			key: "get",
			value: function () {
				var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(rowNumber) {
					var me;
					return _regenerator2.default.wrap(function _callee8$(_context8) {
						while (1) {
							switch (_context8.prev = _context8.next) {
								case 0:
									me = this;

									if (!me.rows) {
										_context8.next = 5;
										break;
									}

									if (!(rowNumber < me.maxCount)) {
										_context8.next = 4;
										break;
									}

									return _context8.abrupt("return", me.rows[rowNumber]);

								case 4:
									return _context8.abrupt("return", undefined);

								case 5:
									return _context8.abrupt("return", new _promise3.default(function (resolve, reject) {
										var promises = [],
										    vars = (0, _keys2.default)(me.classVars);
										if (rowNumber >= 0 && rowNumber < me.cxproduct.length) {
											(function () {
												var row = me.cxproduct.get(rowNumber);
												if (row) {
													row.forEach(function (id, col) {
														var classVar = vars[col],
														    cls = me.classVars[classVar];
														promises.push(cls.index.get(row[col]));
													});
													_promise3.default.all(promises).then(function (instances) {
														var result = void 0;
														if (me.projection) {
															result = {};
															(0, _keys2.default)(me.projection).forEach(function (property) {
																var colspec = me.projection[property];
																if (colspec && (typeof colspec === "undefined" ? "undefined" : (0, _typeof3.default)(colspec)) === "object") {
																	var classVar = (0, _keys2.default)(colspec)[0],
																	    key = colspec[classVar],
																	    col = me.classVarMap[classVar];
																	result[property] = instances[col][key];
																}
															});
														} else {
															result = [];
															instances.forEach(function (instance) {
																result.push(instance);
															});
														}
														resolve(result);
													});
												} else {
													resolve(undefined);
												}
											})();
										} else {
											resolve(undefined);
										}
									}));

								case 6:
								case "end":
									return _context8.stop();
							}
						}
					}, _callee8, this);
				}));

				function get(_x9) {
					return _ref8.apply(this, arguments);
				}

				return get;
			}()
		}, {
			key: "maxCount",
			get: function get() {
				return this.rows ? this.rows.length : this.cxproduct.length;
			}
		}]);
		return Cursor;
	}();

	function stream(object, db) {
		var fired = {},
		    cls = object.constructor;
		Index.keys(object).forEach(function (key) {
			if (db.patterns[cls.name] && db.patterns[cls.name][key]) {
				(0, _keys2.default)(db.patterns[cls.name][key]).forEach(function (patternId) {
					if (fired[patternId]) {
						return;
					}
					(0, _keys2.default)(db.patterns[cls.name][key][patternId]).forEach(function (classVar) {
						var pattern = db.patterns[cls.name][key][patternId][classVar],
						    projection = void 0,
						    when = {};
						if (!pattern.action) {
							return;
						}
						if (pattern.projection) {
							projection = {};
							(0, _keys2.default)(pattern.projection).forEach(function (key) {
								if (key !== db.keyProperty) {
									projection[key] = pattern.projection[key];
								}
							});
						}
						(0, _keys2.default)(pattern.when).forEach(function (key) {
							if (key !== db.keyProperty) {
								when[key] = {};
								(0, _keys2.default)(pattern.when[key]).forEach(function (wkey) {
									when[key][wkey] = pattern.when[key][wkey];
								});
								if (pattern.classVars[key] && object instanceof pattern.classVars[key]) {
									when[key][db.keyProperty] = object[db.keyProperty];
								}
							}
						});
						db.select(projection).from(pattern.classVars).where(when).exec().then(function (cursor) {
							if (!fired[patternId] && cursor.maxCount > 0) {
								fired[patternId] = true;
								pattern.action(cursor);
							}
						});
					});
				});
			}
		});
	}

	var Index = function () {
		function Index(cls) {
			var keyProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "@key";
			var db = arguments[2];
			var StorageType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : db ? db.storageType : MemStore;
			var clear = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : db ? db.clear : false;
			(0, _classCallCheck3.default)(this, Index);

			var store = new StorageType(cls.name, keyProperty, db, clear);
			cls.index = this;
			Object.defineProperty(this, "__metadata__", { value: { store: store, name: cls.name, prefix: "" } });
			if (!db.shared) {
				this.__metadata__.prefix = cls.name + ".";
			}
		}

		(0, _createClass3.default)(Index, [{
			key: "clear",
			value: function () {
				var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
					var index, promises;
					return _regenerator2.default.wrap(function _callee9$(_context9) {
						while (1) {
							switch (_context9.prev = _context9.next) {
								case 0:
									index = this, promises = [];

									(0, _keys2.default)(index).forEach(function (key) {
										promises.push(index.delete(key));
									});
									return _context9.abrupt("return", new _promise3.default(function (resolve, reject) {
										_promise3.default.all(promises).then(function () {
											resolve();
										});
									}));

								case 3:
								case "end":
									return _context9.stop();
							}
						}
					}, _callee9, this);
				}));

				function clear() {
					return _ref9.apply(this, arguments);
				}

				return clear;
			}()
		}, {
			key: "delete",
			value: function () {
				var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(id) {
					var index, store, keyProperty;
					return _regenerator2.default.wrap(function _callee10$(_context10) {
						while (1) {
							switch (_context10.prev = _context10.next) {
								case 0:
									index = this, store = index.__metadata__.store, keyProperty = store.__metadata__.keyProperty;
									return _context10.abrupt("return", new _promise3.default(function (resolve, reject) {
										index.get(id).then(function (object) {
											var promises = [];
											promises.push(store.delete(id, true));
											Index.keys(object).forEach(function (key) {
												promises.push(new _promise3.default(function (resolve, reject) {
													index.get(key).then(function (node) {
														if (!node) {
															resolve();
															return;
														}
														var value = object[key],
														    type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value);
														if (type === "object") {
															if (!value) {
																if (node.null) {
																	delete node.null[id];
																}
															} else if (value[keyProperty]) {
																var idvalue = value[keyProperty];
																if (node[idvalue][type] && node[idvalue][type][id]) {
																	delete node[idvalue][type][id];
																}
															}
															index.save(key).then(function () {
																resolve(true);
															});
														} else if (type !== "undefined") {
															if (!node[value] || !node[value][type] || !node[value][type][id]) {
																resolve();
																return;
															}
															delete node[value][type][id];
															index.save(key).then(function () {
																resolve();
															});
														}
													});
												}));
											});
											_promise3.default.all(promises).then(function () {
												delete object[keyProperty];
												delete index[id];
												resolve(id);
											});
										});
									}));

								case 2:
								case "end":
									return _context10.stop();
							}
						}
					}, _callee10, this);
				}));

				function _delete(_x13) {
					return _ref10.apply(this, arguments);
				}

				return _delete;
			}()
		}, {
			key: "flush",
			value: function flush(key) {
				var desc = (0, _getOwnPropertyDescriptor2.default)(this, key);
				if (desc) {
					this[key] = false;
				}
			}
		}, {
			key: "get",
			value: function get(key) {
				var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				var index = this,
				    value = index[key];
				if (!value) {
					var _ret2 = function () {
						var empty = {};
						if (init) {
							value = index[key] = empty;
						}
						return {
							v: new _promise3.default(function (resolve, reject) {
								var metadata = index.__metadata__;
								metadata.store.get(key.indexOf(metadata.name + "@") === 0 ? key : metadata.prefix + key).then(function (storedvalue) {
									if (typeof storedvalue !== "undefined") {
										var store = index.__metadata__.store,
										    db = store.db();
										if (index[key] === empty || !index[key]) {
											// another async may have already loaded the object
											value = index[key] = storedvalue;
											index.index(value, false, db.activate).then(function () {
												resolve(value);
											});
										} else {
											resolve(index[key]);
										}
									} else {
										resolve(value);
									}
								});
							})
						};
					}();

					if ((typeof _ret2 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret2)) === "object") return _ret2.v;
				}
				return _promise3.default.resolve(value);
			}
		}, {
			key: "instances",
			value: function () {
				var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(keyArray, cls) {
					var index, results, i, instance;
					return _regenerator2.default.wrap(function _callee11$(_context11) {
						while (1) {
							switch (_context11.prev = _context11.next) {
								case 0:
									index = this, results = [];
									i = 0;

								case 2:
									if (!(i < keyArray.length)) {
										_context11.next = 16;
										break;
									}

									_context11.prev = 3;
									_context11.next = 6;
									return index.get(keyArray[i]);

								case 6:
									instance = _context11.sent;

									if (!cls || instance instanceof cls) {
										results.push(instance);
									}
									_context11.next = 13;
									break;

								case 10:
									_context11.prev = 10;
									_context11.t0 = _context11["catch"](3);

									console.log(_context11.t0);

								case 13:
									i++;
									_context11.next = 2;
									break;

								case 16:
									return _context11.abrupt("return", results);

								case 17:
								case "end":
									return _context11.stop();
							}
						}
					}, _callee11, this, [[3, 10]]);
				}));

				function instances(_x15, _x16) {
					return _ref11.apply(this, arguments);
				}

				return instances;
			}()
		}, {
			key: "match",
			value: function () {
				var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(pattern) {
					var classVars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
					var classMatches = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
					var restrictRight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
					var classVar = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "$self";
					var parentKey = arguments[5];
					var nestedClass = arguments[6];
					var index, keys, promises, literals, tests, nestedobjects, joinvars, joins, cols, results, metadata, keyProperty, nodes, i, key;
					return _regenerator2.default.wrap(function _callee12$(_context12) {
						while (1) {
							switch (_context12.prev = _context12.next) {
								case 0:
									index = this, keys = (0, _keys2.default)(pattern), promises = [], literals = {}, tests = {}, nestedobjects = {}, joinvars = {}, joins = {}, cols = {}, results = classMatches, metadata = index.__metadata__, keyProperty = metadata.store.keyProperty();

									(0, _keys2.default)(classVars).forEach(function (classVar, i) {
										cols[classVar] = i;
										if (!results[classVar]) {
											results[classVar] = null;
										}
										if (!restrictRight[i]) {
											restrictRight[i] = {};
										};
									});
									nodes = [];
									i = 0;

								case 4:
									if (!(i < keys.length)) {
										_context12.next = 21;
										break;
									}

									key = keys[i];

									if (classVars[key]) {
										_context12.next = 18;
										break;
									}

									_context12.prev = 7;
									_context12.t0 = nodes;
									_context12.next = 11;
									return index.get(key);

								case 11:
									_context12.t1 = _context12.sent;

									_context12.t0.push.call(_context12.t0, _context12.t1);

									_context12.next = 18;
									break;

								case 15:
									_context12.prev = 15;
									_context12.t2 = _context12["catch"](7);

									console.log(_context12.t2);

								case 18:
									i++;
									_context12.next = 4;
									break;

								case 21:
									return _context12.abrupt("return", new _promise3.default(function (resolve, reject) {
										// db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
										nodes.every(function (node, i) {
											var key = keys[i],
											    value = pattern[key],
											    type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value);
											if (!node) {
												if (type === "undefined") {
													return true;
												}
												results[classVar] = [];
												return false;
											}
											if (type !== "object") {
												return literals[i] = true;
											}
											(0, _keys2.default)(value).forEach(function (key) {
												if (classVars[key]) {
													joins[i] = { rightVar: key, rightIndex: nestedClass ? nestedClass.index : classVars[key].index, rightProperty: value[key], test: Index.$eeq };
													return;
												}
												if (key[0] === "$") {
													var testvalue = value[key],
													    test = Index[key];
													if (typeof test === "function") {
														if (testvalue && (typeof testvalue === "undefined" ? "undefined" : (0, _typeof3.default)(testvalue)) === "object") {
															var second = (0, _keys2.default)(testvalue)[0];
															if (classVars[second]) {
																return joins[i] = { rightVar: second, rightIndex: nestedClass ? nestedClass.index : classVars[second].index, rightProperty: testvalue[second], test: test };
															}
														}
														tests[i] = true;
														return;
													}
												}
												nestedobjects[i] = true;
												return;
											});
											return true;
										});
										if (results[classVar] && results[classVar].length === 0) {
											resolve([]);return;
										}
										var exclude = [];
										nodes.every(function (node, i) {
											if (!literals[i]) {
												return true;
											}
											var key = keys[i],
											    value = pattern[key],
											    type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value);
											if (type === "undefined") {
												(0, _keys2.default)(node).forEach(function (testValue) {
													(0, _keys2.default)(node[testValue]).forEach(function (testType) {
														exclude = exclude.concat((0, _keys2.default)(node[testValue][testType]));
													});
												});
												return true;
											}
											if (!node[value] || !node[value][type]) {
												results[classVar] = [];
												return false;
											}
											var ids = (0, _keys2.default)(node[value][type]);
											results[classVar] = results[classVar] ? intersection(results[classVar], ids) : ids;
											return results[classVar].length > 0;
										});
										if (results[classVar] && results[classVar].length === 0) {
											resolve([]);return;
										}
										nodes.every(function (node, i) {
											if (!tests[i]) {
												return true;
											}
											var key = keys[i],
											    predicate = pattern[key],
											    testname = (0, _keys2.default)(predicate)[0],
											    value = predicate[testname],
											    type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value),
											    test = Index[testname],
											    ids = [];
											if (type === "undefined" && (testname === "$eq" || testname === "$eeq")) {
												(0, _keys2.default)(node).forEach(function (testValue) {
													(0, _keys2.default)(node[testValue]).forEach(function (testType) {
														exclude = exclude.concat((0, _keys2.default)(node[testValue][testType]));
													});
												});
												return true;
											}
											(0, _keys2.default)(node).forEach(function (testValue) {
												(0, _keys2.default)(node[testValue]).forEach(function (testType) {
													if (test(Index.coerce(testValue, testType), value)) {
														ids = ids.concat((0, _keys2.default)(node[testValue][testType]));
													}
												});
											});
											results[classVar] = results[classVar] ? intersection(results[classVar], ids) : intersection(ids, ids);
											return results[classVar].length > 0;
										});
										if (results[classVar] && results[classVar].length === 0) {
											resolve([]);return;
										}
										promises = [];
										var childnodes = [],
										    nestedtypes = [];
										nodes.forEach(function (node, i) {
											if (!nestedobjects[i]) {
												return;
											}
											var key = keys[i],
											    nestedobject = pattern[key];
											(0, _keys2.default)(node).forEach(function (key) {
												if (key.indexOf("@") > 0) {
													var parts = key.split("@"),
													    clsname = parts[0];
													if (!nestedtypes[clsname]) {
														nestedtypes[clsname] = [];
													}
													childnodes.push(node);
													nestedtypes.push(new Function("return " + clsname)());
												}
											});
											nestedtypes.forEach(function (nestedtype) {
												promises.push(nestedtype.index.match(nestedobject, classVars, classMatches, restrictRight, classVar + "$" + nestedtype.name, key, nestedtype));
											});
										});
										_promise3.default.all(promises).then(function (childidsets) {
											childidsets.every(function (childids, i) {
												var ids = [],
												    node = childnodes[i],
												    nestedtype = nestedtypes[i];
												childids.forEach(function (id) {
													//if(clsprefix && id.indexOf(clsprefix)!==0) { return; } // tests for $class
													if (node[id]) {
														ids = ids.concat((0, _keys2.default)(node[id][nestedtype.name]));
													}
												});
												results[classVar] = results[classVar] ? intersection(results[classVar], ids) : intersection(ids, ids);
												return results[classVar].length > 0;
											});
											if (results[classVar] && results[classVar].length === 0) {
												resolve([]);return;
											}
											var promises = [];
											nodes.forEach(function (node, i) {
												// db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
												var join = joins[i];
												if (!join) {
													return true;
												}
												promises.push(join.rightIndex.get(join.rightProperty));
											});
											_promise3.default.all(promises).then(function (rightnodes) {
												// variable not used, promises just ensure nodes loaded for matching
												if (!results[classVar]) {
													results[classVar] = (0, _keys2.default)(index[keyProperty]);
												}
												nodes.every(function (node, i) {
													// db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
													var join = joins[i]; // {rightVar: second, rightIndex:classVars[second].index, rightProperty:testvalue[second], test:test};
													if (!join) {
														return true;
													}
													if (cols[join.rightVar] === 0) {
														return true;
													}
													if (!join.rightIndex[join.rightProperty]) {
														results[classVar] = [];
														return false;
													}
													if (!results[join.rightVar]) {
														results[join.rightVar] = (0, _keys2.default)(join.rightIndex[keyProperty]);
													}
													var leftids = [];
													(0, _keys2.default)(node).forEach(function (leftValue) {
														(0, _keys2.default)(node[leftValue]).forEach(function (leftType) {
															var innerleftids = (0, _keys2.default)(node[leftValue][leftType]),
															    innerrightids = [],
															    some = false;
															(0, _keys2.default)(join.rightIndex[join.rightProperty]).forEach(function (rightValue) {
																(0, _keys2.default)(join.rightIndex[join.rightProperty][rightValue]).forEach(function (rightType) {
																	if (join.test(Index.coerce(leftValue, leftType), Index.coerce(rightValue, rightType))) {
																		some = true;
																		innerrightids = innerrightids.concat((0, _keys2.default)(join.rightIndex[join.rightProperty][rightValue][rightType]));
																	}
																});
															});
															if (some) {
																leftids = leftids.concat(innerleftids);
																innerrightids = intersection(innerrightids, innerrightids);
																innerleftids.forEach(function (id, i) {
																	restrictRight[cols[join.rightVar]][id] = restrictRight[cols[join.rightVar]][id] ? intersection(restrictRight[cols[join.rightVar]][id], innerrightids) : innerrightids;
																});
															}
														});
													});
													results[classVar] = results[classVar] && leftids.length > 0 ? intersection(results[classVar], leftids) : leftids;
													return results[classVar] && results[classVar].length > 0;
												});
												if (results[classVar] && results[classVar].length > 0) {
													resolve(results[classVar].filter(function (item) {
														return exclude.indexOf(item) === -1;
													}));return;
												}
												resolve([]);
											});
										});
									}));

								case 22:
								case "end":
									return _context12.stop();
							}
						}
					}, _callee12, this, [[7, 15]]);
				}));

				function match(_x17, _x18, _x19, _x20, _x21, _x22, _x23) {
					return _ref12.apply(this, arguments);
				}

				return match;
			}()
		}, {
			key: "put",
			value: function () {
				var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(object) {
					var index, store, db, keyProperty, id;
					return _regenerator2.default.wrap(function _callee13$(_context13) {
						while (1) {
							switch (_context13.prev = _context13.next) {
								case 0:
									index = this, store = index.__metadata__.store, db = store.db(), keyProperty = store.keyProperty(), id = object[keyProperty];

									if (!id) {
										id = object.constructor.name + "@" + (_uuid ? _uuid.v4() : uuid.v4());
										(0, _defineProperty2.default)(object, keyProperty, { enumerable: true, configurable: true, value: id });
									}

									if (!(index[id] !== object)) {
										_context13.next = 12;
										break;
									}

									store.addScope(object);
									_context13.prev = 4;
									_context13.next = 7;
									return store.set(id, object, db.activate);

								case 7:
									_context13.next = 12;
									break;

								case 9:
									_context13.prev = 9;
									_context13.t0 = _context13["catch"](4);

									console.log(_context13.t0);

								case 12:
									return _context13.abrupt("return", index.index(object, true, db.activate));

								case 13:
								case "end":
									return _context13.stop();
							}
						}
					}, _callee13, this, [[4, 9]]);
				}));

				function put(_x28) {
					return _ref13.apply(this, arguments);
				}

				return put;
			}()
		}, {
			key: "index",
			value: function () {
				var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(object, reIndex, activate) {
					var index, cls, db, metadata, keyProperty, id, promises;
					return _regenerator2.default.wrap(function _callee14$(_context14) {
						while (1) {
							switch (_context14.prev = _context14.next) {
								case 0:
									index = this, cls = object.constructor, db = this.__metadata__.store.db(), metadata = index.__metadata__, keyProperty = metadata.store.keyProperty(), id = object[keyProperty], promises = [];

									index[id] = object;
									if (object.constructor.reindexCalls) {
										object.constructor.reindexCalls.forEach(function (fname) {
											var f = object[fname];
											if (!f.reindexer) {
												(0, _defineProperty2.default)(object, fname, { configurable: true, writable: true, value: function value() {
														var me = this;
														f.call.apply(f, [me].concat(Array.prototype.slice.call(arguments)));
														index.index(me, true, db.activate).then(function () {
															stream(me, db);
														});
													} });
												object[fname].reindexer = true;
											}
										});
									}
									Index.keys(object).forEach(function (key) {
										var value = object[key],
										    desc = (0, _getOwnPropertyDescriptor2.default)(object, key);
										function get() {
											return get.value;
										}
										if (!reIndex) {
											get.value = value;
										}
										function set(value, first) {
											var instance = this,
											    cls = instance.constructor,
											    index = cls.index,
											    metadata = index.__metadata__,
											    keyProperty = metadata.store.keyProperty(),
											    db = metadata.store.db(),
											    id = instance[keyProperty],
											    oldvalue = get.value,
											    oldtype = typeof oldvalue === "undefined" ? "undefined" : (0, _typeof3.default)(oldvalue),
											    type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value);
											if (oldtype === "undefined" || oldvalue != value) {
												if (type === "undefined") {
													delete get.value;
												} else {
													get.value = value;
												}
												if (type === "function") {
													value = value.call(instance);
													type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value);
												}
												return new _promise3.default(function (resolve, reject) {
													index.get(key, true).then(function (node) {
														node = index[key]; // re-assign since 1) we know it is loaded and initialized, 2) it may have been overwritten by another async
														if (!instance[keyProperty]) {
															// object may have been deleted by another async call!
															if (node[oldvalue] && node[oldvalue][oldtype]) {
																delete node[oldvalue][oldtype][id];
															}
															resolve(true);
															return;
														}
														if (value && type === "object") {
															var promise = first ? _promise3.default.resolve() : metadata.store.set(id, instance, true);
															promise.then(function () {
																var ocls = value.constructor,
																    oindex = ocls.index;
																if (!oindex) {
																	db.index(ocls);
																}
																ocls.index.put(value).then(function () {
																	var okey = value[keyProperty],
																	    otype = value.constructor.name;
																	if (!node[okey]) {
																		node[okey] = {};
																	}
																	if (!node[okey][otype]) {
																		node[okey][otype] = {};
																	}
																	node[okey][otype][id] = true;
																	index.save(key).then(function () {
																		if (!first) {
																			// first handled by put
																			metadata.store.set(id, instance, true);
																			stream(object, db);
																		}
																		resolve(true);
																	}).catch(function (e) {
																		delete node[okey][otype][id];
																	});
																});
																return null;
															});
														} else if (type !== "undefined") {
															var _promise = first ? _promise3.default.resolve() : metadata.store.set(id, instance, true);
															_promise.then(function () {
																if (!node[value]) {
																	node[value] = {};
																}
																if (!node[value][type]) {
																	node[value][type] = {};
																}
																node[value][type][id] = true;
																var restorable = false;
																if (node[oldvalue] && node[oldvalue][oldtype]) {
																	delete node[oldvalue][oldtype][id];
																	restorable = true;
																}
																index.save(key).then(function () {
																	if (!first) {
																		// first handled by insert
																		metadata.store.set(id, instance, true);
																		stream(object, db);
																	}
																	resolve(true);
																}).catch(function (e) {
																	delete node[value][type][id];
																	if (restorable) {
																		node[oldvalue][oldtype][id] = true;
																	}
																});
																return null;
															});
														}
													});
												});
											}
											return _promise3.default.resolve(true);
										}
										var writable = desc && !!desc.configurable && !!desc.writable;
										if (activate && desc && writable && !desc.get && !desc.set) {
											delete desc.writable;
											delete desc.value;
											desc.get = get;
											desc.set = set;
											(0, _defineProperty2.default)(object, key, desc);
										}
										if (reIndex) {
											metadata.store.set(id, object, true);
											promises.push(set.call(object, value, true));
										}
									});
									return _context14.abrupt("return", _promise3.default.all(promises).catch(function (e) {
										console.log(e);
									}));

								case 5:
								case "end":
									return _context14.stop();
							}
						}
					}, _callee14, this);
				}));

				function index(_x29, _x30, _x31) {
					return _ref14.apply(this, arguments);
				}

				return index;
			}()
		}, {
			key: "save",
			value: function () {
				var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(key) {
					var node, metadata;
					return _regenerator2.default.wrap(function _callee15$(_context15) {
						while (1) {
							switch (_context15.prev = _context15.next) {
								case 0:
									node = this[key], metadata = this.__metadata__;

									if (!node) {
										_context15.next = 11;
										break;
									}

									_context15.prev = 2;
									_context15.next = 5;
									return metadata.store.set(metadata.prefix + key, node);

								case 5:
									return _context15.abrupt("return", _context15.sent);

								case 8:
									_context15.prev = 8;
									_context15.t0 = _context15["catch"](2);

									console.log(_context15.t0);

								case 11:
								case "end":
									return _context15.stop();
							}
						}
					}, _callee15, this, [[2, 8]]);
				}));

				function save(_x32) {
					return _ref15.apply(this, arguments);
				}

				return save;
			}()
		}], [{
			key: "coerce",
			value: function coerce(value, type) {
				var conversions = {
					string: {
						number: parseFloat,
						boolean: function boolean(value) {
							return ["true", "yes", "on"].indexOf(value) >= 0 ? true : ["false", "no", "off"].indexOf(value) >= 0 ? false : value;
						}
					},
					number: {
						string: function string(value) {
							return value + "";
						},
						boolean: function boolean(value) {
							return !!value;
						}
					},
					boolean: {
						number: function number(value) {
							return value ? 1 : 0;
						},
						string: function string(value) {
							return value + "";
						}
					}
				},
				    vtype = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value);
				if (type === vtype) {
					return value;
				}
				if (conversions[vtype] && conversions[vtype][type]) {
					return conversions[vtype][type](value);
				}
				return value;
			}
		}, {
			key: "keys",
			value: function keys(object) {
				var indexkeys = void 0;
				if (object.indexKeys) {
					indexkeys = object.indexKeys;
				} else if (object.constructor.indexKeys) {
					indexkeys = object.constructor.indexKeys;
				}
				if (indexkeys) {
					var i = indexkeys.indexOf("*");
					if (i >= 0) {
						indexkeys = indexkeys.concat((0, _keys2.default)(object));
					}
				} else {
					indexkeys = (0, _keys2.default)(object);
				}
				return indexkeys.filter(function (key) {
					return key !== "*"; //typeof(object[key])!=="function" && 
				});
			}
		}]);
		return Index;
	}();

	Index.$ = function (value, f) {
		return f(value);
	};
	Index.$typeof = function () {
		return true; // test is done in method find
	};
	Index.$lt = function (value, testValue) {
		return value < testValue;
	};
	Index["<"] = Index.$lt;
	Index.$lte = function (value, testValue) {
		return value <= testValue;
	};
	Index["<="] = Index.$lte;
	Index.$eq = function (value, testValue) {
		return value == testValue;
	};
	Index["=="] = Index.$eq;
	Index.$neq = function (value, testValue) {
		return value != testValue;
	};
	Index["!="] = Index.$neq;
	Index.$eeq = function (value, testValue) {
		return value === testValue;
	};
	Index["==="] = Index.$eeq;
	Index.$echoes = function (value, testValue) {
		return value == testValue || soundex(value) === soundex(testValue);
	};
	Index.$matches = function (value, testValue) {
		return value.search(testValue) >= 0;
	};
	Index.$in = function (value, testValue) {
		if (testValue.indexOf) {
			return testValue.indexOf(value) >= 0;
		}
		if (testValue.includes) {
			return testValue.includes(value);
		}
		return false;
	};
	Index.$nin = function (value, testValue) {
		return !Index.$in(value, testValue);
	};
	Index.$between = function (value, testValue) {
		var end1 = testValue[0],
		    end2 = testValue[1],
		    inclusive = testValue[2],
		    start = Math.min(end1, end2),
		    stop = Math.max(end1, end2);
		if (inclusive) {
			return value >= start && value <= stop;
		}
		return value > start && value < stop;
	};
	Index.$outside = function (value, testValue) {
		return !Index.$between(value, testValue.concat(true));
	};
	Index.$gte = function (value, testValue) {
		return value >= testValue;
	};
	Index[">="] = Index.$gte;
	Index.$gt = function (value, testValue) {
		return value > testValue;
	};
	Index[">"] = Index.$gt;

	var Store = function () {
		function Store() {
			var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Object";
			var keyProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "@key";
			var db = arguments[2];
			(0, _classCallCheck3.default)(this, Store);

			Object.defineProperty(this, "__metadata__", { value: {
					name: name,
					keyProperty: keyProperty,
					db: db,
					scope: {}
				} });
		}

		(0, _createClass3.default)(Store, [{
			key: "addScope",
			value: function addScope(value) {
				var me = this;
				if (value && (typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value)) === "object") {
					me.__metadata__.scope[value.constructor.name] = value.constructor;
					(0, _keys2.default)(value).forEach(function (property) {
						me.addScope(value[property]);
					});
				}
			}
		}, {
			key: "db",
			value: function db() {
				return this.__metadata__.db;
			}
		}, {
			key: "keyProperty",
			value: function keyProperty() {
				return this.__metadata__.keyProperty;
			}
		}, {
			key: "normalize",
			value: function normalize(value, recursing) {
				var me = this,
				    type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value),
				    keyProperty = me.keyProperty(),
				    result = void 0;
				if (value && type === "object") {
					(function () {
						var id = value[keyProperty];
						if (!id) {
							id = value.constructor.name + "@" + (_uuid ? _uuid.v4() : uuid.v4());
							(0, _defineProperty2.default)(value, keyProperty, { enumerable: true, configurable: true, value: id });
						}
						var json = value.toJSON ? value.toJSON() : value;
						if ((typeof json === "undefined" ? "undefined" : (0, _typeof3.default)(json)) !== "object") {
							json = value;
						}
						me.addScope(value);
						result = {};
						if (recursing) {
							result[keyProperty] = id;
						} else {
							var keys = (0, _keys2.default)(json);
							if (json instanceof Date) {
								result.time = json.getTime();
							}
							keys.forEach(function (key, i) {
								if (typeof json[key] !== "function") {
									result[key] = me.normalize(json[key], true);
								}
							});
						}
					})();
				} else {
					result = value;
				}
				return result;
			}
			// add cache support to prevent loops

		}, {
			key: "restore",
			value: function () {
				var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee18(json, recurse) {
					var _this = this;

					var cache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

					var me, type, _ret4;

					return _regenerator2.default.wrap(function _callee18$(_context18) {
						while (1) {
							switch (_context18.prev = _context18.next) {
								case 0:
									me = this, type = typeof json === "undefined" ? "undefined" : (0, _typeof3.default)(json);

									if (!(json && type === "object")) {
										_context18.next = 6;
										break;
									}

									return _context18.delegateYield(_regenerator2.default.mark(function _callee17() {
										var key, keys, keymap, parts, cls, _ret5, _ret6, _ret7, _ret8;

										return _regenerator2.default.wrap(function _callee17$(_context17) {
											while (1) {
												switch (_context17.prev = _context17.next) {
													case 0:
														key = json[me.keyProperty()], keys = (0, _keys2.default)(json), keymap = {};

														if (!(typeof key === "string")) {
															_context17.next = 33;
															break;
														}

														parts = key.split("@"), cls = me.__metadata__.scope[parts[0]];

														if (cls) {
															_context17.next = 13;
															break;
														}

														_context17.prev = 4;

														me.__metadata__.scope[parts[0]] = cls = Function("return " + parts[0])();
														_context17.next = 13;
														break;

													case 8:
														_context17.prev = 8;
														_context17.t0 = _context17["catch"](4);

														_ret5 = function () {
															console.log(_context17.t0);
															var promises = [];
															keys.forEach(function (property, i) {
																keymap[i] = property;
																promises.push(me.restore(json[property], true, cache));
															});
															return {
																v: {
																	v: new _promise3.default(function (resolve, reject) {
																		_promise3.default.all(promises).then(function (results) {
																			results.forEach(function (data, i) {
																				json[keymap[i]] = data;
																			});
																			resolve(json);
																		});
																	})
																}
															};
														}();

														if (!((typeof _ret5 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret5)) === "object")) {
															_context17.next = 13;
															break;
														}

														return _context17.abrupt("return", _ret5.v);

													case 13:
														if (!(keys.length === 1)) {
															_context17.next = 20;
															break;
														}

														return _context17.delegateYield(_regenerator2.default.mark(function _callee16() {
															var object, instance, promises;
															return _regenerator2.default.wrap(function _callee16$(_context16) {
																while (1) {
																	switch (_context16.prev = _context16.next) {
																		case 0:
																			object = void 0;
																			_context16.prev = 1;
																			_context16.next = 4;
																			return me.get(key);

																		case 4:
																			object = _context16.sent;
																			_context16.next = 10;
																			break;

																		case 7:
																			_context16.prev = 7;
																			_context16.t0 = _context16["catch"](1);

																			console.log(_context16.t0);

																		case 10:
																			if (!(object instanceof cls)) {
																				_context16.next = 12;
																				break;
																			}

																			return _context16.abrupt("return", {
																				v: {
																					v: _promise3.default.resolve(object)
																				}
																			});

																		case 12:
																			if (!(cls.fromJSON && object)) {
																				_context16.next = 14;
																				break;
																			}

																			return _context16.abrupt("return", {
																				v: {
																					v: _promise3.default.resolve(cls.fromJSON(object))
																				}
																			});

																		case 14:
																			instance = (0, _create2.default)(cls.prototype);

																			if (!(typeof object === "undefined")) {
																				_context16.next = 18;
																				break;
																			}

																			instance[me.keyProperty()] = key;
																			return _context16.abrupt("return", {
																				v: {
																					v: _promise3.default.resolve(instance)
																				}
																			});

																		case 18:
																			promises = [];

																			if (object && (typeof object === "undefined" ? "undefined" : (0, _typeof3.default)(object)) === "object") {
																				(0, _keys2.default)(object).forEach(function (property, i) {
																					keymap[i] = property;
																					promises.push(me.restore(object[property], true, cache));
																				});
																			}
																			return _context16.abrupt("return", {
																				v: {
																					v: new _promise3.default(function (resolve, reject) {
																						_promise3.default.all(promises).then(function (results) {
																							results.forEach(function (data, i) {
																								instance[keymap[i]] = data;
																							});
																							resolve(instance);
																						});
																					})
																				}
																			});

																		case 21:
																		case "end":
																			return _context16.stop();
																	}
																}
															}, _callee16, _this, [[1, 7]]);
														})(), "t1", 15);

													case 15:
														_ret6 = _context17.t1;

														if (!((typeof _ret6 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret6)) === "object")) {
															_context17.next = 18;
															break;
														}

														return _context17.abrupt("return", _ret6.v);

													case 18:
														_context17.next = 33;
														break;

													case 20:
														if (!(json instanceof cls)) {
															_context17.next = 26;
															break;
														}

														_ret7 = function () {
															var promises = [];
															keys.forEach(function (property, i) {
																keymap[i] = property;
																promises.push(me.restore(json[property], true, cache).catch(function (e) {
																	console.log(e);
																}));
															});
															return {
																v: {
																	v: new _promise3.default(function (resolve, reject) {
																		_promise3.default.all(promises).then(function (results) {
																			results.forEach(function (data, i) {
																				json[keymap[i]] = data;
																			});
																			resolve(json);
																		});
																	})
																}
															};
														}();

														if (!((typeof _ret7 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret7)) === "object")) {
															_context17.next = 24;
															break;
														}

														return _context17.abrupt("return", _ret7.v);

													case 24:
														_context17.next = 33;
														break;

													case 26:
														if (!cls.fromJSON) {
															_context17.next = 30;
															break;
														}

														return _context17.abrupt("return", {
															v: _promise3.default.resolve(cls.fromJSON(json))
														});

													case 30:
														_ret8 = function () {
															var instance = (0, _create2.default)(cls.prototype),
															    promises = [];
															keys.forEach(function (property, i) {
																keymap[i] = property;
																promises.push(me.restore(json[property], true, cache));
															});
															return {
																v: {
																	v: new _promise3.default(function (resolve, reject) {
																		_promise3.default.all(promises).then(function (results) {
																			results.forEach(function (data, i) {
																				instance[keymap[i]] = data;
																			});
																			resolve(instance);
																		});
																	})
																}
															};
														}();

														if (!((typeof _ret8 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret8)) === "object")) {
															_context17.next = 33;
															break;
														}

														return _context17.abrupt("return", _ret8.v);

													case 33:
													case "end":
														return _context17.stop();
												}
											}
										}, _callee17, _this, [[4, 8]]);
									})(), "t0", 3);

								case 3:
									_ret4 = _context18.t0;

									if (!((typeof _ret4 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret4)) === "object")) {
										_context18.next = 6;
										break;
									}

									return _context18.abrupt("return", _ret4.v);

								case 6:
									return _context18.abrupt("return", _promise3.default.resolve(json));

								case 7:
								case "end":
									return _context18.stop();
							}
						}
					}, _callee18, this);
				}));

				function restore(_x35, _x36, _x37) {
					return _ref16.apply(this, arguments);
				}

				return restore;
			}()
		}]);
		return Store;
	}();

	var MemStore = function (_Store) {
		(0, _inherits3.default)(MemStore, _Store);

		function MemStore() {
			(0, _classCallCheck3.default)(this, MemStore);
			return (0, _possibleConstructorReturn3.default)(this, (MemStore.__proto__ || (0, _getPrototypeOf2.default)(MemStore)).apply(this, arguments));
		}

		(0, _createClass3.default)(MemStore, [{
			key: "clear",
			value: function () {
				var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee19() {
					var me;
					return _regenerator2.default.wrap(function _callee19$(_context19) {
						while (1) {
							switch (_context19.prev = _context19.next) {
								case 0:
									me = this;

									(0, _keys2.default)(me).forEach(function (key) {
										delete me[key];
									});
									return _context19.abrupt("return", true);

								case 3:
								case "end":
									return _context19.stop();
							}
						}
					}, _callee19, this);
				}));

				function clear() {
					return _ref17.apply(this, arguments);
				}

				return clear;
			}()
		}, {
			key: "delete",
			value: function () {
				var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee20(key) {
					return _regenerator2.default.wrap(function _callee20$(_context20) {
						while (1) {
							switch (_context20.prev = _context20.next) {
								case 0:
									if (!this[key]) {
										_context20.next = 3;
										break;
									}

									delete this[key];
									return _context20.abrupt("return", true);

								case 3:
									return _context20.abrupt("return", false);

								case 4:
								case "end":
									return _context20.stop();
							}
						}
					}, _callee20, this);
				}));

				function _delete(_x39) {
					return _ref18.apply(this, arguments);
				}

				return _delete;
			}()
		}, {
			key: "get",
			value: function () {
				var _ref19 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee21(key) {
					return _regenerator2.default.wrap(function _callee21$(_context21) {
						while (1) {
							switch (_context21.prev = _context21.next) {
								case 0:
									return _context21.abrupt("return", this[key]);

								case 1:
								case "end":
									return _context21.stop();
							}
						}
					}, _callee21, this);
				}));

				function get(_x40) {
					return _ref19.apply(this, arguments);
				}

				return get;
			}()
		}, {
			key: "set",
			value: function () {
				var _ref20 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee22(key, value) {
					return _regenerator2.default.wrap(function _callee22$(_context22) {
						while (1) {
							switch (_context22.prev = _context22.next) {
								case 0:
									this[key] = value;
									return _context22.abrupt("return", true);

								case 2:
								case "end":
									return _context22.stop();
							}
						}
					}, _callee22, this);
				}));

				function set(_x41, _x42) {
					return _ref20.apply(this, arguments);
				}

				return set;
			}()
		}]);
		return MemStore;
	}(Store);

	var LocalStore = function (_Store2) {
		(0, _inherits3.default)(LocalStore, _Store2);

		function LocalStore(name, keyProperty, db, clear) {
			(0, _classCallCheck3.default)(this, LocalStore);

			var _this3 = (0, _possibleConstructorReturn3.default)(this, (LocalStore.__proto__ || (0, _getPrototypeOf2.default)(LocalStore)).call(this, name, keyProperty, db));

			if (typeof window !== "undefined") {
				_this3.__metadata__.storage = window.localStorage;
			} else {
				var _r = require,
				    LocalStorage = _r("./LocalStorage.js").LocalStorage;
				_this3.__metadata__.storage = new LocalStorage(db.name + "/" + name);
			}
			if (clear) {
				_this3.__metadata__.storage.clear();
			}
			return _this3;
		}

		(0, _createClass3.default)(LocalStore, [{
			key: "clear",
			value: function () {
				var _ref21 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee23() {
					var me;
					return _regenerator2.default.wrap(function _callee23$(_context23) {
						while (1) {
							switch (_context23.prev = _context23.next) {
								case 0:
									me = this;

									me.__metadata__.storage.clear();
									(0, _keys2.default)(me).forEach(function (key) {
										delete me[key];
									});
									return _context23.abrupt("return", true);

								case 4:
								case "end":
									return _context23.stop();
							}
						}
					}, _callee23, this);
				}));

				function clear() {
					return _ref21.apply(this, arguments);
				}

				return clear;
			}()
		}, {
			key: "delete",
			value: function () {
				var _ref22 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee24(key, force) {
					return _regenerator2.default.wrap(function _callee24$(_context24) {
						while (1) {
							switch (_context24.prev = _context24.next) {
								case 0:
									if (!(this[key] || force)) {
										_context24.next = 4;
										break;
									}

									this.__metadata__.storage.removeItem(key + ".json");
									delete this[key];
									return _context24.abrupt("return", true);

								case 4:
									return _context24.abrupt("return", false);

								case 5:
								case "end":
									return _context24.stop();
							}
						}
					}, _callee24, this);
				}));

				function _delete(_x43, _x44) {
					return _ref22.apply(this, arguments);
				}

				return _delete;
			}()
		}, {
			key: "get",
			value: function () {
				var _ref23 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee25(key) {
					var value;
					return _regenerator2.default.wrap(function _callee25$(_context25) {
						while (1) {
							switch (_context25.prev = _context25.next) {
								case 0:
									value = this.__metadata__.storage.getItem(key + ".json");

									if (!(value != null)) {
										_context25.next = 4;
										break;
									}

									this[key] = true;
									return _context25.abrupt("return", this.restore(JSON.parse(value)));

								case 4:
									return _context25.abrupt("return", _promise3.default.resolve(undefined));

								case 5:
								case "end":
									return _context25.stop();
							}
						}
					}, _callee25, this);
				}));

				function get(_x45) {
					return _ref23.apply(this, arguments);
				}

				return get;
			}()
		}, {
			key: "set",
			value: function () {
				var _ref24 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee26(key, value, normalize) {
					return _regenerator2.default.wrap(function _callee26$(_context26) {
						while (1) {
							switch (_context26.prev = _context26.next) {
								case 0:
									this[key] = true;
									this.__metadata__.storage.setItem(key + ".json", (0, _stringify2.default)(normalize ? this.normalize(value) : value));
									return _context26.abrupt("return", true);

								case 3:
								case "end":
									return _context26.stop();
							}
						}
					}, _callee26, this);
				}));

				function set(_x46, _x47, _x48) {
					return _ref24.apply(this, arguments);
				}

				return set;
			}()
		}]);
		return LocalStore;
	}(Store);

	var LocalForageStore = function (_Store3) {
		(0, _inherits3.default)(LocalForageStore, _Store3);

		function LocalForageStore(name, keyProperty, db, clear) {
			(0, _classCallCheck3.default)(this, LocalForageStore);

			var _this4 = (0, _possibleConstructorReturn3.default)(this, (LocalForageStore.__proto__ || (0, _getPrototypeOf2.default)(LocalForageStore)).call(this, name, keyProperty, db));

			if (typeof window !== "undefined") {
				//window.localforage.config({name:"ReasonDB"})
				_this4.__metadata__.storage = window.localforage;
			} else {
				var _r2 = require,
				    LocalStorage = _r2("node-localstorage").LocalStorage;
				_this4.__metadata__.storage = new LocalStorage("./db/" + name);
			}
			if (clear) {
				_this4.__metadata__.storage.clear();
			}
			return _this4;
		}

		(0, _createClass3.default)(LocalForageStore, [{
			key: "clear",
			value: function () {
				var _ref25 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee27() {
					return _regenerator2.default.wrap(function _callee27$(_context27) {
						while (1) {
							switch (_context27.prev = _context27.next) {
								case 0:
									_context27.prev = 0;
									_context27.next = 3;
									return this.__metadata__.storage.clear();

								case 3:
									_context27.next = 8;
									break;

								case 5:
									_context27.prev = 5;
									_context27.t0 = _context27["catch"](0);

									console.log(_context27.t0);

								case 8:
									(0, _keys2.default)(me).forEach(function (key) {
										delete me[key];
									});
									return _context27.abrupt("return", true);

								case 10:
								case "end":
									return _context27.stop();
							}
						}
					}, _callee27, this, [[0, 5]]);
				}));

				function clear() {
					return _ref25.apply(this, arguments);
				}

				return clear;
			}()
		}, {
			key: "delete",
			value: function () {
				var _ref26 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee28(key, force) {
					var index;
					return _regenerator2.default.wrap(function _callee28$(_context28) {
						while (1) {
							switch (_context28.prev = _context28.next) {
								case 0:
									index = this;

									if (!(this[key] || force)) {
										_context28.next = 12;
										break;
									}

									_context28.prev = 2;
									_context28.next = 5;
									return index.__metadata__.storage.removeItem(key + ".json");

								case 5:
									_context28.next = 10;
									break;

								case 7:
									_context28.prev = 7;
									_context28.t0 = _context28["catch"](2);

									console.log(_context28.t0);

								case 10:
									delete this[key];
									return _context28.abrupt("return", true);

								case 12:
									return _context28.abrupt("return", false);

								case 13:
								case "end":
									return _context28.stop();
							}
						}
					}, _callee28, this, [[2, 7]]);
				}));

				function _delete(_x49, _x50) {
					return _ref26.apply(this, arguments);
				}

				return _delete;
			}()
		}, {
			key: "get",
			value: function () {
				var _ref27 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee29(key) {
					var value;
					return _regenerator2.default.wrap(function _callee29$(_context29) {
						while (1) {
							switch (_context29.prev = _context29.next) {
								case 0:
									value = void 0;
									_context29.prev = 1;
									_context29.next = 4;
									return this.__metadata__.storage.getItem(key + ".json");

								case 4:
									value = _context29.sent;
									_context29.next = 10;
									break;

								case 7:
									_context29.prev = 7;
									_context29.t0 = _context29["catch"](1);

									console.log(_context29.t0);

								case 10:
									if (!(value != null)) {
										_context29.next = 21;
										break;
									}

									this[key] = true;
									_context29.prev = 12;
									_context29.next = 15;
									return this.restore(value);

								case 15:
									return _context29.abrupt("return", _context29.sent);

								case 18:
									_context29.prev = 18;
									_context29.t1 = _context29["catch"](12);

									console.log(_context29.t1);

								case 21:
								case "end":
									return _context29.stop();
							}
						}
					}, _callee29, this, [[1, 7], [12, 18]]);
				}));

				function get(_x51) {
					return _ref27.apply(this, arguments);
				}

				return get;
			}()
		}, {
			key: "set",
			value: function () {
				var _ref28 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee30(key, value, normalize) {
					return _regenerator2.default.wrap(function _callee30$(_context30) {
						while (1) {
							switch (_context30.prev = _context30.next) {
								case 0:
									this[key] = true;
									_context30.prev = 1;
									_context30.next = 4;
									return this.__metadata__.storage.setItem(key + ".json", normalize ? this.normalize(value) : value);

								case 4:
									_context30.next = 9;
									break;

								case 6:
									_context30.prev = 6;
									_context30.t0 = _context30["catch"](1);

									console.log(_context30.t0);

								case 9:
									return _context30.abrupt("return", true);

								case 10:
								case "end":
									return _context30.stop();
							}
						}
					}, _callee30, this, [[1, 6]]);
				}));

				function set(_x52, _x53, _x54) {
					return _ref28.apply(this, arguments);
				}

				return set;
			}()
		}]);
		return LocalForageStore;
	}(Store);

	var ReasonDB = function () {
		function ReasonDB(name) {
			var keyProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "@key";
			var storageType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : MemStore;
			var clear = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
			var activate = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
			(0, _classCallCheck3.default)(this, ReasonDB);
			// make the additional args part of a config object, add a config option for active or passive objects
			var db = this;
			db.name = name;
			db.keyProperty = keyProperty;
			db.storageType = storageType;
			db.clear = clear;
			db.classes = {};
			db.activate = activate;

			delete Object.index;
			db.index(Object, keyProperty, storageType, clear);

			db.Pattern = function () {
				function Pattern(projection, classVars, when, then) {
					(0, _classCallCheck3.default)(this, Pattern);

					var me = this;
					me.projection = projection;
					me.classNames = {};
					Object.defineProperty(me, "classVars", { configurable: true, writable: true, value: classVars });
					(0, _keys2.default)(classVars).forEach(function (classVar) {
						me.classNames[classVar] = me.classVars[classVar].name;
					});
					Object.defineProperty(me, "when", { configurable: true, writable: true, value: when });
					Object.defineProperty(me, "then", { configurable: true, writable: true, value: then });
					Pattern.index.put(me);
				}

				(0, _createClass3.default)(Pattern, [{
					key: "toJSON",
					value: function toJSON() {
						var me = this,
						    result = {};
						result[db.keyProperty] = me[db.keyProperty];
						result.classVars = me.classNames;
						result.when = me.when;
						return result;
					}
				}]);
				return Pattern;
			}();
			db.index(Array, keyProperty, storageType, clear);
			db.index(Date, keyProperty, storageType, clear);
			db.index(db.Pattern, keyProperty, storageType, clear);
			db.patterns = {};
		}

		(0, _createClass3.default)(ReasonDB, [{
			key: "deleteIndex",
			value: function () {
				var _ref29 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee31(cls) {
					return _regenerator2.default.wrap(function _callee31$(_context31) {
						while (1) {
							switch (_context31.prev = _context31.next) {
								case 0:
									if (!cls.index) {
										_context31.next = 11;
										break;
									}

									_context31.prev = 1;
									_context31.next = 4;
									return cls.index.clear();

								case 4:
									_context31.next = 9;
									break;

								case 6:
									_context31.prev = 6;
									_context31.t0 = _context31["catch"](1);

									console.log(_context31.t0);

								case 9:
									delete cls.index;;

								case 11:
								case "end":
									return _context31.stop();
							}
						}
					}, _callee31, this, [[1, 6]]);
				}));

				function deleteIndex(_x59) {
					return _ref29.apply(this, arguments);
				}

				return deleteIndex;
			}()
		}, {
			key: "index",
			value: function index(cls, keyProperty, storageType, clear) {
				var db = this;
				keyProperty = keyProperty ? keyProperty : db.keyProperty;
				storageType = storageType ? storageType : db.storageType;
				clear = clear ? clear : db.clear;
				if (!cls.index || clear) {
					cls.index = db.shared && cls !== Object ? Object.index : new Index(cls, keyProperty, db, storageType, clear);
					db.classes[cls.name] = cls;
				}
				return cls.index;
			}
		}, {
			key: "delete",
			value: function _delete() {
				var db = this;
				return {
					from: function from(classVars) {
						return {
							where: function where(pattern) {
								return {
									exec: function exec() {
										return new _promise3.default(function (resolve, reject) {
											db.select().from(classVars).where(pattern).exec().then(function (cursor) {
												cursor.count().then(function (count) {
													if (count > 0) {
														var _ret9 = function () {
															var promises = [];
															(0, _keys2.default)(cursor.classVarMap).forEach(function (classVar) {
																var i = cursor.classVarMap[classVar],
																    cls = classVars[classVar];
																cursor.cxproduct.collections[i].forEach(function (id) {
																	promises.push(cls.index.delete(id));
																});
															});
															_promise3.default.all(promises).then(function (results) {
																resolve(results);
															});
															return {
																v: void 0
															};
														}();

														if ((typeof _ret9 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret9)) === "object") return _ret9.v;
													}
													resolve([]);
												});
											});
										});
									}
								};
							}
						};
					}
				};
			}
		}, {
			key: "insert",
			value: function insert(object) {
				var db = this;
				return {
					into: function into(cls) {
						return {
							exec: function exec() {
								return new _promise3.default(function (resolve, reject) {
									var instance = void 0,
									    thecls = cls ? cls : object.constructor;
									if (object instanceof cls) {
										instance = object;
									} else if (cls.fromJSON) {
										instance = cls.fromJSON(object);
									} else {
										instance = (0, _create2.default)(cls.prototype);
										Object.defineProperty(instance, "constructor", { configurable: true, writable: true, value: thecls });
										(0, _keys2.default)(object).forEach(function (key) {
											instance[key] = object[key];
										});
									}
									if (!cls.index) {
										cls.index = db.index(cls);
									}
									cls.index.put(instance).then(function () {
										stream(instance, db);
										resolve(instance);
									});
								});
							}
						};
					},
					exec: function exec() {
						return this.into(object.constructor).exec();
					}
				};
			}
		}, {
			key: "select",
			value: function select(projection) {
				var db = this;
				return {
					first: function first(count) {
						var me = this;
						me.firstCount = count;
						return {
							from: function from(classVars) {
								return me.from(classVars);
							}
						};
					},
					random: function random(count) {
						var me = this;
						me.randomCount = count;
						return {
							from: function from(classVars) {
								return me.from(classVars);
							}
						};
					},
					sample: function sample(confidence, range) {
						var me = this;
						me.sampleSpec = { confidence: confidence, range: range };
						return {
							from: function from(classVars) {
								return me.from(classVars);
							}
						};
					},
					from: function from(classVars) {
						var select = this;
						return {
							where: function where(pattern, restrictVar, instanceId) {
								return {
									orderBy: function orderBy(ordering) {
										// {$o: {name: "asc"}}
										var me = this;
										me.ordering = ordering;
										return {
											exec: function exec() {
												return me.exec();
											}
										};
									},
									exec: function exec(ordering) {
										return new _promise3.default(function (resolve, reject) {
											var matches = {},
											    restrictright = {},
											    matchvars = [],
											    promises = [];
											(0, _keys2.default)(pattern).forEach(function (classVar) {
												if (!classVars[classVar] || !classVars[classVar].index) {
													return;
												}
												matchvars.push(classVar);
												promises.push(classVars[classVar].index.match(pattern[classVar], classVars, matches, restrictright, classVar));
											});
											_promise3.default.all(promises).then(function (results) {
												var pass = true;
												results.every(function (result, i) {
													if (result.length === 0) {
														pass = false;
													}
													return pass;
												});
												if (!pass) {
													resolve(new Cursor([], new CXProduct([]), projection, {}), matches);
												} else {
													var _ret10 = function () {
														var filter = function filter(row, index, cxp) {
															return row.every(function (item, i) {
																if (i === 0 || !restrictright[i]) {
																	return true;
																}
																var prev = row[i - 1];
																return !restrictright[i][prev] || restrictright[i][prev].indexOf(item) >= 0;
															});
														};

														var classes = [],
														    collections = [],
														    promises = [],
														    vars = [],
														    classVarMap = {};
														(0, _keys2.default)(classVars).forEach(function (classVar) {
															if (matches[classVar]) {
																collections.push(matches[classVar]);
																classes.push(classVars[classVar]);
															}
														});

														var cursor = new Cursor(classes, new CXProduct(collections, filter), projection, classVars);
														if (select.firstCount) {
															cursor.first(select.firstCount).then(function (rows) {
																resolve(new Cursor(classes, rows));
															});
														} else if (select.randomCount) {
															cursor.random(select.randomCount).then(function (rows) {
																resolve(new Cursor(classes, rows));
															});
														} else if (select.sampleSpec) {
															cursor.sample(select.sampleSpec.confidence, select.sampleSpec.range).then(function (rows) {
																resolve(new Cursor(classes, rows));
															});
														} else {
															resolve(cursor, matches);
														}
														return {
															v: null
														};
													}();

													if ((typeof _ret10 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret10)) === "object") return _ret10.v;
												}
											}).catch(function (e) {
												console.log(e);
											});
										});
									}
								};
							}
						};
					}
				};
			}
		}, {
			key: "update",
			value: function update(classVars) {
				var db = this;
				return {
					set: function set(values) {
						return {
							where: function where(pattern) {
								return {
									exec: function exec() {
										return new _promise3.default(function (resolve, reject) {
											var updated = {},
											    promises = [];
											db.select().from(classVars).where(pattern).exec().then(function (cursor, matches) {
												var vars = (0, _keys2.default)(classVars);
												promises.push(cursor.forEach(function (row) {
													row.forEach(function (object, i) {
														var classVar = vars[i],
														    activated = void 0;
														if (values[classVar]) {
															(0, _keys2.default)(values[classVar]).forEach(function (property) {
																var value = values[classVar][property];
																if (value && (typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value)) === "object") {
																	var sourcevar = (0, _keys2.default)(value)[0];
																	if (classVars[sourcevar]) {
																		var j = vars.indexOf(sourcevar);
																		value = row[j][value[sourcevar]];
																	}
																}
																activated = activated === false || typeof object[property] === "undefined" ? false : db.activate;
																if (object[property] !== value) {
																	object[property] = value;
																	updated[object[db.keyProperty]] = true;
																}
															});
															if (!activated) {
																promises.push(db.save(object).exec());
															}
														}
													});
												}));
											});
											_promise3.default.all(promises).then(function () {
												resolve((0, _keys2.default)(updated).length);
											});
										});
									}
								};
							}
						};
					}
				};
			}
		}, {
			key: "when",
			value: function when(whenPattern) {
				var db = this;
				return {
					from: function from(classVars) {
						return {
							select: function select(projection) {
								var pattern = new db.Pattern(projection, classVars, whenPattern);
								//	promise = new Promise((resolve,reject) => { pattern.resolver = resolve; pattern.rejector = reject; });
								(0, _keys2.default)(whenPattern).forEach(function (classVar) {
									if (classVar[0] !== "$") {
										return;
									}
									var cls = classVars[classVar];
									if (!db.patterns[cls.name]) {
										db.patterns[cls.name] = {};
									}
									(0, _keys2.default)(whenPattern[classVar]).forEach(function (property) {
										if (!db.patterns[cls.name][property]) {
											db.patterns[cls.name][property] = {};
										}
										if (!db.patterns[cls.name][property][pattern[db.keyProperty]]) {
											db.patterns[cls.name][property][pattern[db.keyProperty]] = {};
										}
										if (!db.patterns[cls.name][property][pattern[db.keyProperty]][classVar]) {
											db.patterns[cls.name][property][pattern[db.keyProperty]][classVar] = pattern;
										}
									});
								});
								return {
									then: function then(f) {
										Object.defineProperty(pattern, "action", { configurable: true, writable: true, value: f });
									}
								};
							}
						};
					}
				};
			}
		}]);
		return ReasonDB;
	}();

	ReasonDB.prototype.save = ReasonDB.prototype.insert;
	ReasonDB.LocalStore = LocalStore;
	ReasonDB.MemStore = MemStore;
	ReasonDB.LocalForageStore = LocalForageStore;
	if (typeof module !== "undefined") {
		module.exports = ReasonDB;
	}
	if (typeof window !== "undefined") {
		window.ReasonDB = ReasonDB;
	}
})();