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

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
	var _uuid = void 0;
	if (typeof window === "undefined") {
		var r = require;
		_uuid = require("node-uuid");
	}

	Array.indexKeys = ["length", "$max", "$min", "$avg", "*"];
	Array.reindexCalls = ["push", "pop", "splice", "reverse", "fill", "shift", "unshift"];
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

	Date.indexKeys = [];
	Date.reindexCalls = [];
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
	function soundex(s) {
		var a = (s + "").toLowerCase().split(""),
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

		r = f + a.map(function (v) {
			return codes[v];
		}).filter(function (v, i, a) {
			return i === 0 ? v !== codes[f] : v !== a[i - 1];
		}).join("");

		return (r + "000").slice(0, 4).toUpperCase();
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
	// there is probably an alogorithm that never returns null is index is in range and takes into account the restrict right
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
		function Cursor(classes, cxproduct, projection, classVarMap) {
			(0, _classCallCheck3.default)(this, Cursor);

			this.classes = classes;
			this.cxproduct = cxproduct;
			this.projection = projection;
			this.classVarMap = classVarMap;
			this.position = 0;
		}

		(0, _createClass3.default)(Cursor, [{
			key: "forEach",
			value: function forEach(f) {
				var cursor = this,
				    i = 0;
				function rows() {
					var row = cursor.get(i);
					if (row) {
						f(row, i, cursor);
					}
					i++;
					if (i < cursor.cxproduct.length) {
						rows();
					}
				}
				rows();
				return i;
			}
		}, {
			key: "every",
			value: function every(f) {
				var cursor = this,
				    i = 0,
				    result = false;
				function rows() {
					var row = cursor.get(i);
					if (row) {
						if (f(row, i, cursor)) {
							if (i < cursor.cxproduct.length) {
								i++;
								rows();
								return;
							}
						}
					} else {
						if (i < cursor.cxproduct.length) {
							i++;
							rows();
							return;
						}
					}
					result = i === cursor.cxproduct.length;
				}
				rows();
				return result;
			}
		}, {
			key: "some",
			value: function some(f) {
				var cursor = this,
				    i = 0,
				    result = false;
				function rows() {
					var row = cursor.get(i);
					if (row) {
						if (f(row, i, cursor)) {
							result = true;
							return;
						}
					}
					i++;
					if (i < cursor.cxproduct.length) {
						rows();
					} else {
						result = false;
						return;
					}
				}
				rows();
				return result;
			}
		}, {
			key: "get",
			value: function get(rowNumber) {
				var me = this;
				if (rowNumber >= 0 && rowNumber < me.cxproduct.length) {
					var _ret = function () {
						//	return new Promise((resolve,reject) => {
						var promises = [],
						    row = me.cxproduct.get(rowNumber);
						if (row && me.projection) {
							var _ret2 = function () {
								var result = {};
								(0, _keys2.default)(me.projection).forEach(function (property) {
									var colspec = me.projection[property];
									if (colspec && (typeof colspec === "undefined" ? "undefined" : (0, _typeof3.default)(colspec)) === "object") {
										var classVar = (0, _keys2.default)(colspec)[0],
										    _key = colspec[classVar],
										    col = me.classVarMap[classVar];
										result[property] = row[col][_key];
									}
								});
								return {
									v: {
										v: result
									}
								};
							}();

							if ((typeof _ret2 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret2)) === "object") return _ret2.v;
						} else {
							return {
								v: row
							};
						}
						//	});
					}();

					if ((typeof _ret === "undefined" ? "undefined" : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
				}
			}
		}, {
			key: "count",
			get: function get() {
				var cursor = this,
				    i = 0;
				cursor.forEach(function (row) {
					i++;
				});
				return i;
			}
		}]);
		return Cursor;
	}();

	var Index = function () {
		function Index(cls) {
			var keyProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "@key";
			var db = arguments[2];
			var StorageType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : db ? db.storageType : MemStore;
			var clear = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : db ? db.clear : false;
			(0, _classCallCheck3.default)(this, Index);

			var store = new StorageType(cls.name, keyProperty, db, clear);
			cls.index = this;
			this.__metadata__ = {
				store: store,
				name: cls.name
			};
		}

		(0, _createClass3.default)(Index, [{
			key: "delete",
			value: function () {
				var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(key) {
					var desc;
					return _regenerator2.default.wrap(function _callee$(_context) {
						while (1) {
							switch (_context.prev = _context.next) {
								case 0:
									desc = (0, _getOwnPropertyDescriptor2.default)(this, key);

									if (!desc) {
										_context.next = 5;
										break;
									}

									_context.next = 4;
									return this.__metadata__.store.delete(key);

								case 4:
									delete this[key];

								case 5:
								case "end":
									return _context.stop();
							}
						}
					}, _callee, this);
				}));

				function _delete(_x4) {
					return _ref.apply(this, arguments);
				}

				return _delete;
			}()
		}, {
			key: "flush",
			value: function flush(key) {
				var desc = (0, _getOwnPropertyDescriptor2.default)(this, key);
				if (desc) {
					desc[key] = false;
				}
			}
		}, {
			key: "get",
			value: function () {
				var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(key) {
					var value;
					return _regenerator2.default.wrap(function _callee2$(_context2) {
						while (1) {
							switch (_context2.prev = _context2.next) {
								case 0:
									value = this[key];

									if (value) {
										_context2.next = 3;
										break;
									}

									return _context2.abrupt("return", this.__metadata__.store.get(key));

								case 3:
									return _context2.abrupt("return", _promise2.default.resolve(value));

								case 4:
								case "end":
									return _context2.stop();
							}
						}
					}, _callee2, this);
				}));

				function get(_x5) {
					return _ref2.apply(this, arguments);
				}

				return get;
			}()
		}, {
			key: "instances",
			value: function () {
				var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(keyArray) {
					var index, promises;
					return _regenerator2.default.wrap(function _callee3$(_context3) {
						while (1) {
							switch (_context3.prev = _context3.next) {
								case 0:
									index = this, promises = [];

									keyArray.forEach(function (key) {
										promises.push(index.get(key));
									});
									return _context3.abrupt("return", _promise2.default.all(promises));

								case 3:
								case "end":
									return _context3.stop();
							}
						}
					}, _callee3, this);
				}));

				function instances(_x6) {
					return _ref3.apply(this, arguments);
				}

				return instances;
			}()
		}, {
			key: "load",
			value: function () {
				var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
					var _this = this;

					var me;
					return _regenerator2.default.wrap(function _callee5$(_context5) {
						while (1) {
							switch (_context5.prev = _context5.next) {
								case 0:
									me = this;

									if (this.__metadata__.loaded) {
										_context5.next = 3;
										break;
									}

									return _context5.delegateYield(_regenerator2.default.mark(function _callee4() {
										var keys;
										return _regenerator2.default.wrap(function _callee4$(_context4) {
											while (1) {
												switch (_context4.prev = _context4.next) {
													case 0:
														_context4.next = 2;
														return _this.__metadata__.store.get(key);

													case 2:
														keys = _context4.sent;

														if (keys) {
															(0, _keys2.default)(keys).forEach(function (key) {
																me[key] = keys[key];
															});
														}
														_this.__metadata__.loaded = true;

													case 5:
													case "end":
														return _context4.stop();
												}
											}
										}, _callee4, _this);
									})(), "t0", 3);

								case 3:
									return _context5.abrupt("return", this.__metadata__.loaded);

								case 4:
								case "end":
									return _context5.stop();
							}
						}
					}, _callee5, this);
				}));

				function load() {
					return _ref4.apply(this, arguments);
				}

				return load;
			}()
		}, {
			key: "match",
			value: function () {
				var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(pattern, restrictToIds) {
					var classVars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
					var classMatches = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
					var restrictRight = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
					var classVar = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "$self";
					var parentKey = arguments[6];
					var index, cls, clstype, clsprefix, keys, promises, literals, tests, subobjects, joinvars, joins, cols, results, nodes;
					return _regenerator2.default.wrap(function _callee6$(_context6) {
						while (1) {
							switch (_context6.prev = _context6.next) {
								case 0:
									index = this, cls = pattern.$class, clstype = typeof cls === "undefined" ? "undefined" : (0, _typeof3.default)(cls), clsprefix = void 0, keys = (0, _keys2.default)(pattern), promises = [], literals = {}, tests = {}, subobjects = {}, joinvars = {}, joins = {}, cols = {}, results = classMatches;

									if (!(clstype === "string")) {
										_context6.next = 14;
										break;
									}

									cls = index.__indextadata__.scope[cls];

									if (cls) {
										_context6.next = 11;
										break;
									}

									_context6.prev = 4;

									cls = new Function("return " + cls)();
									_context6.next = 11;
									break;

								case 8:
									_context6.prev = 8;
									_context6.t0 = _context6["catch"](4);
									return _context6.abrupt("return", _promise2.default.resolve([]));

								case 11:
									index = cls.index;
									_context6.next = 15;
									break;

								case 14:
									if (clstype === "function") {
										index = cls.index;
									}

								case 15:
									if (cls) {
										clsprefix = cls ? cls.name + "@" : undefined;
									}
									(0, _keys2.default)(classVars).forEach(function (classVar, i) {
										cols[classVar] = i;
										if (!results[classVar]) {
											results[classVar] = null;
										}
										if (!restrictRight[i]) {
											restrictRight[i] = {};
										};
									});
									keys.forEach(function (key) {
										var value = pattern[key],
										    type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value);
										if (key === "$class") {
											return;
										}
										if (!classVars[key]) {
											promises.push(index.get(key));
										}
									});
									_context6.next = 20;
									return _promise2.default.all(promises);

								case 20:
									nodes = _context6.sent;
									return _context6.abrupt("return", new _promise2.default(function (resolve, reject) {
										// db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
										nodes.every(function (node, i) {
											var key = keys[i],
											    value = pattern[key],
											    type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value);
											if (!node) {
												results[classVar] = [];
												return false;
											}
											if (key === "$class") {
												return true;
											}
											if (type !== "object") {
												return literals[i] = true;
											}
											(0, _keys2.default)(value).forEach(function (key) {
												if (classVars[key]) {
													joins[i] = { rightVar: key, rightIndex: classVars[key].index, rightProperty: value[key], test: Index.$eeq };
													return;
												}
												if (key[0] === "$") {
													var testvalue = value[key],
													    test = Index[key];
													if (typeof test === "function") {
														if (testvalue && (typeof testvalue === "undefined" ? "undefined" : (0, _typeof3.default)(testvalue)) === "object") {
															var second = (0, _keys2.default)(testvalue)[0];
															if (classVars[second]) {
																return joins[i] = { rightVar: second, rightIndex: classVars[second].index, rightProperty: testvalue[second], test: test };
															}
														}
														tests[i] = true;
														return;
													}
												}
												subobjects[i] = true;
												return;
											});
											return true;
										});
										//if(Object.keys(joins).length>0 && Object.keys(literals).length===0 && Object.keys(tests).length===0 && Object.keys(subobjects).length===0) {
										//	reject(new Error("Join patterns must include at least one literal, predicate, or sub-object condition: " + JSON.stringify(pattern)));
										//}
										if (results[classVar] && results[classVar].length === 0) {
											resolve([]);return;
										}
										nodes.every(function (node, i) {
											if (!literals[i]) {
												return true;
											}
											var key = keys[i],
											    value = pattern[key],
											    type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value);
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
											    testnaindex = (0, _keys2.default)(predicate)[0],
											    value = predicate[testnaindex],
											    test = Index[testnaindex],
											    ids = [];
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
										var childnodes = [];
										nodes.every(function (node, i) {
											if (!subobjects[i]) {
												return true;
											}
											var key = keys[i],
											    subobject = pattern[key];
											childnodes.push(node);
											promises.push(index.match(subobject, (0, _keys2.default)(node), classVars, classMatches, restrictRight, classVar + "$" + subobject.constructor.name, key));
										});
										_promise2.default.all(promises).then(function (childidsets) {
											childidsets.every(function (childids, i) {
												var ids = [],
												    node = childnodes[i];
												childids.forEach(function (id) {
													if (clsprefix && id.indexOf(clsprefix) !== 0) {
														return;
													} // tests for $class
													if (node[id] && node[id].object) {
														ids = ids ? ids.concat((0, _keys2.default)(node[id].object)) : (0, _keys2.default)(node[id].object);
													} else if (index[id]) {
														ids = ids ? ids.push(index[id]) : [index[id]]; // not sure about this line
													}
												});
												results[classVar] = results[classVar] ? intersection(results[classVar], ids) : intersection(ids, ids);
												return results[classVar].length > 0;
											});
											if (results[classVar] && results[classVar].length === 0) {
												resolve([]);return;
											}
											promises = [];
											nodes.forEach(function (node, i) {
												// db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
												if (!joins[i]) {
													return true;
												}
												promises.push(joins[i].rightIndex.get(joins[i].rightProperty));
											});
											_promise2.default.all(promises).then(function (rightnodes) {
												// variable not used, promises just ensure nodes loaded for matching
												if (!results[classVar]) {
													results[classVar] = (0, _keys2.default)(index).filter(function (item) {
														return item.indexOf("@") > 0;
													});
												}
												nodes.every(function (node, i) {
													// db.select({name: {$o1: "name"}}).from({$o1: Object,$o2: Object}).where({$o1: {name: {$o2: "name"}}})
													if (!joins[i]) {
														return true;
													}
													var join = joins[i]; // {rightVar: second, rightIndex:classVars[second].index, rightProperty:testvalue[second], test:test};
													if (!join.rightIndex[join.rightProperty]) {
														results[classVar] = [];
														return false;
													}
													if (!results[join.rightVar]) {
														results[join.rightVar] = (0, _keys2.default)(join.rightIndex).filter(function (item) {
															return item.indexOf("@") > 0;
														});
													}
													var leftids = void 0;
													(0, _keys2.default)(node).forEach(function (leftValue) {
														var innerleftids = void 0;
														(0, _keys2.default)(node[leftValue]).forEach(function (leftType) {
															(0, _keys2.default)(join.rightIndex[join.rightProperty]).forEach(function (rightValue) {
																(0, _keys2.default)(join.rightIndex[join.rightProperty][rightValue]).forEach(function (rightType) {
																	if (join.test(Index.coerce(leftValue, leftType), Index.coerce(rightValue, rightType))) {
																		(function () {
																			var rightids = (0, _keys2.default)(join.rightIndex[join.rightProperty][rightValue][rightType]);
																			innerleftids = innerleftids ? innerleftids : (0, _keys2.default)(node[leftValue][leftType]);
																			innerleftids.forEach(function (id, i) {
																				restrictRight[cols[join.rightVar]][id] = restrictRight[cols[join.rightVar]][id] ? intersection(restrictRight[cols[join.rightVar]][id], rightids) : rightids;
																			});
																		})();
																	}
																});
															});
														});
														var lids = results[join.rightVar] ? intersection(results[join.rightVar], innerleftids) : innerleftids;
														if (lids.length > 0) {
															leftids = leftids ? leftids.concat(lids) : lids;
														}
													});
													results[classVar] = results[classVar] && leftids ? intersection(results[classVar], leftids) : leftids;
													return results[classVar] && results[classVar].length > 0;
												});
												if (results[classVar] && results[classVar].length > 0) {
													resolve(results[classVar]);return;
												}
												resolve([]);
											});
										});
									}));

								case 22:
								case "end":
									return _context6.stop();
							}
						}
					}, _callee6, this, [[4, 8]]);
				}));

				function match(_x7, _x8, _x9, _x10, _x11, _x12, _x13) {
					return _ref5.apply(this, arguments);
				}

				return match;
			}()
		}, {
			key: "put",
			value: function () {
				var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(object) {
					var index, keyProperty, keys, id, promises;
					return _regenerator2.default.wrap(function _callee7$(_context7) {
						while (1) {
							switch (_context7.prev = _context7.next) {
								case 0:
									index = this, keyProperty = index.__metadata__.store.keyProperty(), keys = Index.keys(object), id = object[keyProperty], promises = [];

									if (!id) {
										id = object[keyProperty] = object.constructor.name + "@" + (_uuid ? _uuid.v4() : uuid.v4());
									}

									if (!(index[id] !== object)) {
										_context7.next = 7;
										break;
									}

									index[id] = object;
									index.__metadata__.store.addScope(object);
									_context7.next = 7;
									return index.__metadata__.store.set(id, object);

								case 7:
									keys.forEach(function (key) {
										//	if(key===keyProperty) {
										//		return;
										//	}
										var value = object[key],
										    desc = (0, _getOwnPropertyDescriptor2.default)(object, key);
										function get() {
											return get.value;
										}
										function set(value) {
											var instance = this,
											    oldvalue = get.value,
											    oldtype = typeof oldvalue === "undefined" ? "undefined" : (0, _typeof3.default)(oldvalue),
											    type = typeof value === "undefined" ? "undefined" : (0, _typeof3.default)(value);
											if (oldtype === "undefined" || oldvalue != value) {
												get.value = value;
												return new _promise2.default(function (resolve, reject) {
													index.get(key).then(function (node) {
														if (!node) {
															if (index[key]) {
																node = index[key];
															} else {
																index[key] = node = {};
															}
														}
														index.__metadata__.store.set(instance[keyProperty], instance, true).then(function () {
															if (node[oldvalue] && node[oldvalue][oldtype]) {
																delete node[oldvalue][type][id];
															}
															var db = index.__metadata__.store.db(),
															    cls = instance.constructor;
															if (type === "object") {
																if (!value) {
																	if (!node.null) {
																		node.null = {};
																	}
																} else {
																	if (!value[keyProperty]) {
																		value[keyProperty] = value.constructor.name + "@" + (_uuid ? _uuid.v4() : uuid.v4());
																	}
																	if (!node[value[keyProperty]]) {
																		node[value[keyProperty]] = {};
																	}
																}
																index.put(value).then(function () {
																	var idvalue = value[keyProperty];
																	if (!node[idvalue][type]) {
																		node[idvalue][type] = {};
																	}
																	node[idvalue][type][id] = true; //instance;			
																	index.save(key).then(function () {
																		resolve(true);
																		if (db.patterns[cls.name] && db.patterns[cls.name][key]) {
																			(0, _keys2.default)(db.patterns[cls.name][key]).forEach(function (patternId) {
																				(0, _keys2.default)(db.patterns[cls.name][key][patternId]).forEach(function (classVar) {
																					var pattern = db.patterns[cls.name][key][patternId][classVar];
																					db.select(pattern.projection).from(pattern.classVars).where(pattern.when).exec().then(pattern.then);
																				});
																			});
																		}
																	});
																});
															} else {
																if (!node[value]) {
																	node[value] = {};
																}
																if (!node[value][type]) {
																	node[value][type] = {};
																}
																node[value][type][id] = true; //instance;
																index.save(key).then(function () {
																	resolve(true);
																	if (db.patterns[cls.name] && db.patterns[cls.name][key]) {
																		(0, _keys2.default)(db.patterns[cls.name][key]).forEach(function (patternId) {
																			(0, _keys2.default)(db.patterns[cls.name][key][patternId]).forEach(function (classVar) {
																				var pattern = db.patterns[cls.name][key][patternId][classVar];
																				db.select(pattern.projection).from(pattern.classVars).where(pattern.when).exec().then(pattern.then);
																			});
																		});
																	}
																});
															}
														});
													});
												});
											}
											return _promise2.default.resolve(true);
										}
										var writable = desc && !!desc.configurable && !!desc.writable;
										if (desc && writable && !desc.get && !desc.set) {
											delete desc.writable;
											delete desc.value;
											desc.get = get;
											desc.set = set;
											(0, _defineProperty2.default)(object, key, desc);
										}
										promises.push(set.call(object, value, writable));
									});
									return _context7.abrupt("return", _promise2.default.all(promises).catch(function (e) {
										console.log(e);
									}));

								case 9:
								case "end":
									return _context7.stop();
							}
						}
					}, _callee7, this);
				}));

				function put(_x18) {
					return _ref6.apply(this, arguments);
				}

				return put;
			}()
		}, {
			key: "save",
			value: function () {
				var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(key) {
					var node;
					return _regenerator2.default.wrap(function _callee8$(_context8) {
						while (1) {
							switch (_context8.prev = _context8.next) {
								case 0:
									node = this[key];

									if (!node) {
										_context8.next = 5;
										break;
									}

									_context8.next = 4;
									return this.__metadata__.store.set(key, node);

								case 4:
									return _context8.abrupt("return", _context8.sent);

								case 5:
								case "end":
									return _context8.stop();
							}
						}
					}, _callee8, this);
				}));

				function save(_x19) {
					return _ref7.apply(this, arguments);
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
						return indexkeys.slice(0, i).concat((0, _keys2.default)(object));
					}
					return indexkeys;
				}
				return (0, _keys2.default)(object);
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
							value[keyProperty] = id = value.constructor.name + "@" + (_uuid ? _uuid.v4() : uuid.v4());
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
								result[key] = me.normalize(json[key], true);
							});
						}
					})();
				} else {
					result = value;
				}
				return result;
			}
		}, {
			key: "restore",
			value: function restore(json) {
				var me = this;
				if (json && (typeof json === "undefined" ? "undefined" : (0, _typeof3.default)(json)) === "object") {
					var _key2 = json[me.keyProperty()];
					if (typeof _key2 === "string") {
						var _ret6 = function () {
							var parts = _key2.split("@"),
							    cls = me.__metadata__.scope[parts[0]];
							if (!cls) {
								try {
									me.__metadata__.scope[parts[0]] = cls = Function("return " + parts[0]);
								} catch (e) {
									(0, _keys2.default)(json).forEach(function (property) {
										json[property] = me.restore(json[property]);
									});
									return {
										v: json
									};
								}
								me.__metadata__.scope[parts[0]] = cls;
							}
							if (json instanceof cls) {
								(0, _keys2.default)(json).forEach(function (property) {
									json[property] = me.restore(json[property]);
								});
								return {
									v: json
								};
							}
							var instance = (0, _create2.default)(cls.prototype);
							(0, _keys2.default)(json).forEach(function (property) {
								instance[property] = me.restore(json[property]);
							});
							return {
								v: instance
							};
						}();

						if ((typeof _ret6 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret6)) === "object") return _ret6.v;
					}
				}
				return json;
			}
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
				var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
					var me;
					return _regenerator2.default.wrap(function _callee9$(_context9) {
						while (1) {
							switch (_context9.prev = _context9.next) {
								case 0:
									me = this;

									(0, _keys2.default)(me).forEach(function (key) {
										delete me[key];
									});
									return _context9.abrupt("return", true);

								case 3:
								case "end":
									return _context9.stop();
							}
						}
					}, _callee9, this);
				}));

				function clear() {
					return _ref8.apply(this, arguments);
				}

				return clear;
			}()
		}, {
			key: "delete",
			value: function () {
				var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(key) {
					return _regenerator2.default.wrap(function _callee10$(_context10) {
						while (1) {
							switch (_context10.prev = _context10.next) {
								case 0:
									if (!this[key]) {
										_context10.next = 3;
										break;
									}

									delete this[key];
									return _context10.abrupt("return", true);

								case 3:
									return _context10.abrupt("return", false);

								case 4:
								case "end":
									return _context10.stop();
							}
						}
					}, _callee10, this);
				}));

				function _delete(_x22) {
					return _ref9.apply(this, arguments);
				}

				return _delete;
			}()
		}, {
			key: "get",
			value: function () {
				var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(key) {
					return _regenerator2.default.wrap(function _callee11$(_context11) {
						while (1) {
							switch (_context11.prev = _context11.next) {
								case 0:
									return _context11.abrupt("return", this[key]);

								case 1:
								case "end":
									return _context11.stop();
							}
						}
					}, _callee11, this);
				}));

				function get(_x23) {
					return _ref10.apply(this, arguments);
				}

				return get;
			}()
		}, {
			key: "set",
			value: function () {
				var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(key, value) {
					return _regenerator2.default.wrap(function _callee12$(_context12) {
						while (1) {
							switch (_context12.prev = _context12.next) {
								case 0:
									this[key] = value;
									return _context12.abrupt("return", true);

								case 2:
								case "end":
									return _context12.stop();
							}
						}
					}, _callee12, this);
				}));

				function set(_x24, _x25) {
					return _ref11.apply(this, arguments);
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
				_this3.__metadata__.storage = new LocalStorage("./db/" + name);
			}
			if (clear) {
				_this3.__metadata__.storage.clear();
			}
			return _this3;
		}

		(0, _createClass3.default)(LocalStore, [{
			key: "clear",
			value: function () {
				var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13() {
					var me;
					return _regenerator2.default.wrap(function _callee13$(_context13) {
						while (1) {
							switch (_context13.prev = _context13.next) {
								case 0:
									me = this;

									me.__metadata__.storage.clear();
									(0, _keys2.default)(me).forEach(function (key) {
										delete me[key];
									});
									return _context13.abrupt("return", true);

								case 4:
								case "end":
									return _context13.stop();
							}
						}
					}, _callee13, this);
				}));

				function clear() {
					return _ref12.apply(this, arguments);
				}

				return clear;
			}()
		}, {
			key: "delete",
			value: function () {
				var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(key, force) {
					return _regenerator2.default.wrap(function _callee14$(_context14) {
						while (1) {
							switch (_context14.prev = _context14.next) {
								case 0:
									if (!(this[key] || force)) {
										_context14.next = 4;
										break;
									}

									me.__metadata__.storage.removeItem(key + ".json");
									delete this[key];
									return _context14.abrupt("return", true);

								case 4:
									return _context14.abrupt("return", false);

								case 5:
								case "end":
									return _context14.stop();
							}
						}
					}, _callee14, this);
				}));

				function _delete(_x26, _x27) {
					return _ref13.apply(this, arguments);
				}

				return _delete;
			}()
		}, {
			key: "get",
			value: function () {
				var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(key) {
					var value;
					return _regenerator2.default.wrap(function _callee15$(_context15) {
						while (1) {
							switch (_context15.prev = _context15.next) {
								case 0:
									value = this.__metadata__.storage.getItem(key + ".json");

									if (!(value != null)) {
										_context15.next = 4;
										break;
									}

									this[key] = true;
									return _context15.abrupt("return", this.restore(JSON.parse(value)));

								case 4:
								case "end":
									return _context15.stop();
							}
						}
					}, _callee15, this);
				}));

				function get(_x28) {
					return _ref14.apply(this, arguments);
				}

				return get;
			}()
		}, {
			key: "set",
			value: function () {
				var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(key, value, normalize) {
					return _regenerator2.default.wrap(function _callee16$(_context16) {
						while (1) {
							switch (_context16.prev = _context16.next) {
								case 0:
									this[key] = true;
									this.__metadata__.storage.setItem(key + ".json", (0, _stringify2.default)(normalize ? this.normalize(value) : value));
									return _context16.abrupt("return", true);

								case 3:
								case "end":
									return _context16.stop();
							}
						}
					}, _callee16, this);
				}));

				function set(_x29, _x30, _x31) {
					return _ref15.apply(this, arguments);
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
				window.localforage.config({ name: name });
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
				var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee17() {
					return _regenerator2.default.wrap(function _callee17$(_context17) {
						while (1) {
							switch (_context17.prev = _context17.next) {
								case 0:
									_context17.next = 2;
									return this.__metadata__.storage.clear();

								case 2:
									(0, _keys2.default)(me).forEach(function (key) {
										delete me[key];
									});
									return _context17.abrupt("return", true);

								case 4:
								case "end":
									return _context17.stop();
							}
						}
					}, _callee17, this);
				}));

				function clear() {
					return _ref16.apply(this, arguments);
				}

				return clear;
			}()
		}, {
			key: "delete",
			value: function () {
				var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee18(key, force) {
					return _regenerator2.default.wrap(function _callee18$(_context18) {
						while (1) {
							switch (_context18.prev = _context18.next) {
								case 0:
									if (!(this[key] || force)) {
										_context18.next = 5;
										break;
									}

									_context18.next = 3;
									return me.__metadata__.storage.removeItem(key + ".json");

								case 3:
									delete this[key];
									return _context18.abrupt("return", true);

								case 5:
									return _context18.abrupt("return", false);

								case 6:
								case "end":
									return _context18.stop();
							}
						}
					}, _callee18, this);
				}));

				function _delete(_x32, _x33) {
					return _ref17.apply(this, arguments);
				}

				return _delete;
			}()
		}, {
			key: "get",
			value: function () {
				var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee19(key) {
					var value;
					return _regenerator2.default.wrap(function _callee19$(_context19) {
						while (1) {
							switch (_context19.prev = _context19.next) {
								case 0:
									_context19.next = 2;
									return this.__metadata__.storage.getItem(key + ".json");

								case 2:
									value = _context19.sent;

									if (!(value != null)) {
										_context19.next = 6;
										break;
									}

									this[key] = true;
									return _context19.abrupt("return", this.restore(value));

								case 6:
								case "end":
									return _context19.stop();
							}
						}
					}, _callee19, this);
				}));

				function get(_x34) {
					return _ref18.apply(this, arguments);
				}

				return get;
			}()
		}, {
			key: "set",
			value: function () {
				var _ref19 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee20(key, value, normalize) {
					return _regenerator2.default.wrap(function _callee20$(_context20) {
						while (1) {
							switch (_context20.prev = _context20.next) {
								case 0:
									this[key] = true;
									_context20.next = 3;
									return this.__metadata__.storage.setItem(key + ".json", normalize ? this.normalize(value) : value);

								case 3:
									return _context20.abrupt("return", true);

								case 4:
								case "end":
									return _context20.stop();
							}
						}
					}, _callee20, this);
				}));

				function set(_x35, _x36, _x37) {
					return _ref19.apply(this, arguments);
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
			var shared = arguments[3];
			var clear = arguments[4];
			(0, _classCallCheck3.default)(this, ReasonDB);

			var db = this;
			db.keyProperty = keyProperty;
			db.storageType = storageType;
			db.clear = true;
			db.shared = shared;

			delete Object.index;
			db.index(Object, keyProperty, storageType, clear);

			db.Pattern = function Pattern(projection, classVars, when, then) {
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
				//Pattern.index.put(me);
			}
			/*toJSON() {
   	let me = this,
   		result = {};
   	result[db.keyProperty] = me[db.keyProperty];
   	result.projection = me.projection;
   	result.classVars = me.classNames;
   	result.when = me.when;
   	result.then = me.then+"";
   	return result;
   }*/
			;
			/*db.Pattern.fromJSON = function(object) {
   	let result = Object.create(Pattern.prototype);
   	result[db.keyProperty] = object[db.keyProperty];
   	result.projection = object.projection;
   	result.classVars = [];
   	object.classVars.forEach((className) => {
   		if(db[className]) {
   			
   		}
   	});
   	result.when = object.when;
   	result.then = new Function(object.then);
   	return result;
   }
   db.Pattern.index = (shared ? Object.index : new Index(db.Pattern,keyProperty,db,storageType,clear));*/
			if (shared) {
				Array.index = Object.index;
				db.Array = Array;
				Date.index = Object.index;
				db.Date = Date;
			} else {
				delete Array.index;
				delete Date.index;
				db.index(Array, keyProperty, storageType, clear);
				db.index(Date, keyProperty, storageType, clear);
			}
			db.patterns = {};
		}

		(0, _createClass3.default)(ReasonDB, [{
			key: "index",
			value: function index(cls, keyProperty, storageType, clear) {
				var db = this;
				keyProperty = keyProperty ? keyProperty : db.keyProperty;
				storageType = storageType ? storageType : db.storageType;
				clear = clear ? clear : db.clear;
				if (!cls.index) {
					cls.index = new Index(cls, keyProperty, db, storageType, clear);
					db[cls.name] = cls;
				}
			}
		}, {
			key: "select",
			value: function select(projection) {
				var db = this;
				return {
					from: function from(classVars) {
						return {
							when: function when(whenPattern) {
								return {
									then: function then(f) {
										/*let pattern = new db.Pattern(projection,classVars,whenPattern);
          let next; // makes then chainable, but not serializable
          pattern.then = function then() { 
          	if(next) {
          		next(...arguments);
          		next = next.then;
          	} else {
          		f(...arguments);
          		next = f.then;
          	}
          	if(next) { 
          		then(...arguments); 
          	}
          }*/
										var pattern = new db.Pattern(projection, classVars, whenPattern, f);
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
										return f;
									}
								};
							},
							where: function where(pattern, restrictVar, instanceId) {
								return {
									orderBy: function orderBy(ordering) {
										// {$o: {name: "asc"}}
										var me = this;
										return {
											exec: function exec() {
												return me.exec(ordering);
											}
										};
									},
									exec: function exec() {
										var ordering = arguments[0];
										return new _promise2.default(function (resolve, reject) {
											var matches = {},
											    restrictright = {},
											    matchvars = [],
											    promises = [],
											    col = -1;
											(0, _keys2.default)(pattern).forEach(function (classVar) {
												var restrictions = void 0;
												if (!classVars[classVar] || !classVars[classVar].index) {
													return;
												}
												matchvars.push(classVar);
												if (classVar === restrictVar) {
													restrictions = [instanceId];
												}
												col++;
												promises.push(classVars[classVar].index.match(pattern[classVar], restrictions, classVars, matches, restrictright, classVar));
											});
											_promise2.default.all(promises).then(function (results) {
												var pass = true;
												results.every(function (result, i) {
													//	matches[matchvars[i]] = (matches[matchvars[i]] ? intersection(matches[matchvars[i]],result) : result);
													if (result.length === 0) {
														pass = false;
													}
													return pass;
												});
												if (!pass) {
													resolve(new Cursor([], new CXProduct([]), projection, {}), matches);
												} else {
													(function () {
														var classes = [],
														    collections = [],
														    promises = [],
														    vars = [],
														    classVarMap = {};
														(0, _keys2.default)(matches).forEach(function (classVar) {
															vars.push(classVar);
															if (classVars[classVar] && matches[classVar]) {
																promises.push(classVars[classVar].index.instances(matches[classVar]));
															}
														});
														_promise2.default.all(promises).then(function (results) {
															results.forEach(function (result, i) {
																var classVar = vars[i];
																// add order result based on ordering
																matches[classVar] = result;
																classes.push(classVars[classVar]);
																collections.push(matches[classVar]);
																classVarMap[classVar] = i;
															});
															function filter(row) {
																return row.every(function (item, i) {
																	if (i === 0 || !restrictright[i]) {
																		return true;
																	}
																	var prev = row[i - 1][db.keyProperty];
																	return !restrictright[i][prev] || restrictright[i][prev].indexOf(item[db.keyProperty]) >= 0;
																});
															}
															resolve(new Cursor(classes, new CXProduct(collections, filter), projection, classVarMap), matches);
														});
													})();
												}
											});
										});
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