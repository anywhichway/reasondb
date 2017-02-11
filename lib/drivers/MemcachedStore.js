"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require("babel-runtime/helpers/get");

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
	module.exports = function (ReasonDB) {
		var MemcachedStore = function (_ReasonDB$Store) {
			(0, _inherits3.default)(MemcachedStore, _ReasonDB$Store);

			function MemcachedStore(name, keyProperty, db, clear) {
				(0, _classCallCheck3.default)(this, MemcachedStore);

				var _this = (0, _possibleConstructorReturn3.default)(this, (MemcachedStore.__proto__ || (0, _getPrototypeOf2.default)(MemcachedStore)).call(this, name, keyProperty, db));

				_this.storage = _this.db.memcachedClient;
				_this.ready(clear);
				return _this;
			}

			(0, _createClass3.default)(MemcachedStore, [{
				key: "clear",
				value: function () {
					var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
						var me;
						return _regenerator2.default.wrap(function _callee$(_context) {
							while (1) {
								switch (_context.prev = _context.next) {
									case 0:
										me = this;
										return _context.abrupt("return", new _promise2.default(function (resolve, reject) {
											var key = me.name + "." + me.keyProperty;
											me.storage.get(key, function (err, value) {
												if (err) {
													resolve();
												} else {
													if (!value) {
														resolve();
													} else {
														me.storage.delete(key, function (err, res) {
															if (err) {
																reject(err);
															} else {
																resolve(true);
															}
														});
													}
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

					function clear() {
						return _ref.apply(this, arguments);
					}

					return clear;
				}()
			}, {
				key: "delete",
				value: function () {
					var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(key) {
						var me;
						return _regenerator2.default.wrap(function _callee2$(_context2) {
							while (1) {
								switch (_context2.prev = _context2.next) {
									case 0:
										me = this;
										return _context2.abrupt("return", (0, _get3.default)(MemcachedStore.prototype.__proto__ || (0, _getPrototypeOf2.default)(MemcachedStore.prototype), "delete", this).call(this, key, function () {
											return new _promise2.default(function (resolve, reject) {
												me.storage.delete(key, function (err, res) {
													if (err) {
														reject(err);
													} else {
														resolve(true);
													}
												});
											});
										}));

									case 2:
									case "end":
										return _context2.stop();
								}
							}
						}, _callee2, this);
					}));

					function _delete(_x) {
						return _ref2.apply(this, arguments);
					}

					return _delete;
				}()
			}, {
				key: "get",
				value: function () {
					var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(key) {
						var me;
						return _regenerator2.default.wrap(function _callee3$(_context3) {
							while (1) {
								switch (_context3.prev = _context3.next) {
									case 0:
										me = this;
										return _context3.abrupt("return", (0, _get3.default)(MemcachedStore.prototype.__proto__ || (0, _getPrototypeOf2.default)(MemcachedStore.prototype), "get", this).call(this, key, function () {
											return new _promise2.default(function (resolve, reject) {
												me.storage.get(key, function (err, value, key) {
													if (err) {
														resolve();
													} else {
														if (!value) {
															resolve();
														} else {
															resolve(JSON.parse(value));
														}
													}
												});
											});
										}));

									case 2:
									case "end":
										return _context3.stop();
								}
							}
						}, _callee3, this);
					}));

					function get(_x2) {
						return _ref3.apply(this, arguments);
					}

					return get;
				}()
			}, {
				key: "set",
				value: function () {
					var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(key, value, normalize) {
						var me;
						return _regenerator2.default.wrap(function _callee4$(_context4) {
							while (1) {
								switch (_context4.prev = _context4.next) {
									case 0:
										me = this;
										return _context4.abrupt("return", (0, _get3.default)(MemcachedStore.prototype.__proto__ || (0, _getPrototypeOf2.default)(MemcachedStore.prototype), "set", this).call(this, key, value, normalize, function (normalized) {
											return new _promise2.default(function (resolve, reject) {
												me.storage.set(key, (0, _stringify2.default)(normalized), function (err, res) {
													if (err) {
														reject(err);
													} else {
														resolve(true);
													}
												});
											});
										}));

									case 2:
									case "end":
										return _context4.stop();
								}
							}
						}, _callee4, this);
					}));

					function set(_x3, _x4, _x5) {
						return _ref4.apply(this, arguments);
					}

					return set;
				}()
			}]);
			return MemcachedStore;
		}(ReasonDB.Store);

		return MemcachedStore;
	};
}).call(undefined);