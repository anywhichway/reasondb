"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

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
		var fs = require("fs");

		function blockString(block) {
			var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "utf8";

			return "[" + bytePadEnd(block[0] + "", 20, " ", encoding) + "," + bytePadEnd(block[1] + "", 20, " ", encoding) + "]";
		}

		function bytePadEnd(str, length, pad) {
			var encoding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "utf8";

			var needed = length - Buffer.byteLength(str, encoding);
			if (needed > 0) {
				return str + Buffer.alloc(needed, " ", encoding).toString(encoding);
			}
			return str;
		}

		var JSONBlockStore = function (_ReasonDB$Store) {
			(0, _inherits3.default)(JSONBlockStore, _ReasonDB$Store);

			function JSONBlockStore(name, keyProperty, db, clear) {
				(0, _classCallCheck3.default)(this, JSONBlockStore);

				var _this = (0, _possibleConstructorReturn3.default)(this, (JSONBlockStore.__proto__ || (0, _getPrototypeOf2.default)(JSONBlockStore)).call(this, name, keyProperty, db));

				_this.path = db.name + "/" + name;
				_this.encoding = "utf8";
				_this.opened = false;
				if (clear) {
					_this.clear();
				}
				return _this;
			}

			(0, _createClass3.default)(JSONBlockStore, [{
				key: "open",
				value: function open() {
					// also add a transactional file class <file>.json, <file>.queue.json, <file>.<line> (line currently processing), <file>.done.json (lines processed)
					try {
						this.freefd = fs.openSync(this.path + "/free.json", "r+");
					} catch (e) {
						this.freefd = fs.openSync(this.path + "/free.json", "w+");
					}
					try {
						this.blocksfd = fs.openSync(this.path + "/blocks.json", "r+"); // r+ block offsets and lengths for ids
					} catch (e) {
						this.blocksfd = fs.openSync(this.path + "/blocks.json", "w+");
					}
					try {
						this.storefd = fs.openSync(this.path + "/store.json", "r+"); // the actual data
					} catch (e) {
						this.storefd = fs.openSync(this.path + "/store.json", "w+");
					}
					var blocks = fs.readFileSync(this.path + "/blocks.json", this.encoding),
					    // {<id>:{start:start,end:end,length:length}[,...]}
					freestat = fs.statSync(this.path + "/free.json"),
					    blocksstat = fs.statSync(this.path + "/blocks.json"),
					    storestat = fs.statSync(this.path + "/store.json");
					var free = fs.readFileSync(this.path + "/free.json", this.encoding); // [{start:start,end:end,length:length}[,...]]
					if (free.length === 0) {
						this.free = [];
					} else {
						free = free.trim();
						if (free[0] === ",") {
							free = free.substring(1);
						}
						if (free[free.length - 1] === ",") {
							free = free.substring(0, free.length - 1);
						}
						this.free = JSON.parse("[" + free + "]");
					}
					this.blocks = blocks.length > 0 ? JSON.parse(blocks) : {};
					this.freeSize = freestat.size;
					this.blocksSize = blocksstat.size;
					this.storeSize = storestat.size;
					this.opened = true;
					return true;
				}
			}, {
				key: "alloc",
				value: function alloc(length) {
					var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "utf8";

					var me = this;
					var block = void 0;
					if (!me.alloc.size) {
						me.alloc.size = Buffer.byteLength(blockString([0, 0], encoding), encoding);
						me.alloc.empty = bytePadEnd("null", me.alloc.size, " ", encoding);
					}
					for (var i = 0; i < me.free.length; i++) {
						block = me.free[i];
						if (block && block[1] - block[0] >= length) {
							var position = (me.alloc.size + 1) * i;
							me.free[i] = null;
							fs.writeSync(me.freefd, me.alloc.empty, position, encoding);
							return block;
						}
					}
					var start = me.storeSize === 0 ? 0 : me.storeSize + 1;
					return [start, start + length];
				}
			}, {
				key: "clear",
				value: function () {
					var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
						return _regenerator2.default.wrap(function _callee$(_context) {
							while (1) {
								switch (_context.prev = _context.next) {
									case 0:
										if (!this.opened) {
											this.open();
										}
										fs.ftruncateSync(this.freefd);
										fs.ftruncateSync(this.blocksfd);
										fs.ftruncateSync(this.storefd);
										this.freeSize = 0;
										this.blocksSize = 0;
										this.storeSize = 0;
										this.free = [];
										this.blocks = {};

									case 9:
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
				key: "compress",
				value: function compress() {
					var me = this;
					if (!me.opened) {
						me.open();
					}
					var newfree = [];
					me.freeSize = 0;
					me.free.forEach(function (block, i) {
						if (block) {
							newfree.push(block);
							var str = blockString(block, me.encoding) + ",";
							fs.writeSync(me.freefd, str, me.freeSize, me.encoding);
							me.freeSize += Buffer.byteLength(str, me.encoding);
						}
					});
					me.free = newfree;
					fs.ftruncateSync(me.freefd, me.freeSize);
					me.blocksSize = 1;
					me.storeSize = 0;
					fs.writeSync(me.blocksfd, "{", 0, me.encoding);
					(0, _keys2.default)(me.blocks).forEach(function (key, i) {
						var str = '"' + key + '":' + (0, _stringify2.default)(me.blocks[key]) + ",";
						fs.writeSync(me.blocksfd, str, me.blocksSize, me.encoding);
						me.blocksSize += Buffer.byteLength(str, me.encoding);
					});
					fs.writeSync(me.blocksfd, "}", me.blocksSize - 1, me.encoding);
					fs.ftruncateSync(me.blocksfd, me.blocksSize);
				}
			}, {
				key: "delete",
				value: function () {
					var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(id) {
						var me, block, blanks, str, fposition;
						return _regenerator2.default.wrap(function _callee2$(_context2) {
							while (1) {
								switch (_context2.prev = _context2.next) {
									case 0:
										me = this;

										if (!me.opened) {
											me.open();
										}
										block = me.blocks[id];

										if (block) {
											blanks = bytePadEnd("", block[1] - block[0], me.encoding);

											delete me.blocks[id];
											fs.writeSync(me.storefd, blanks, block[0], "utf8"); // write blank padding
											me.free.push(block);
											str = blockString(block, me.encoding) + ",";

											fs.writeSync(me.freefd, str, me.freeSize, me.encoding);
											me.freeSize += Buffer.byteLength(str, me.encoding);
											str = (me.blocksSize === 0 ? '{' : ',') + '"' + id + '":null}';
											fposition = me.blocksSize === 0 ? 0 : me.blocksSize - 1;

											fs.writeSync(me.blocksfd, str, fposition, me.encoding);
											me.blocksSize = fposition + Buffer.byteLength(str, me.encoding);
										}

									case 4:
									case "end":
										return _context2.stop();
								}
							}
						}, _callee2, this);
					}));

					function _delete(_x4) {
						return _ref2.apply(this, arguments);
					}

					return _delete;
				}()
			}, {
				key: "get",
				value: function () {
					var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(id) {
						var me, block, buffer, result;
						return _regenerator2.default.wrap(function _callee3$(_context3) {
							while (1) {
								switch (_context3.prev = _context3.next) {
									case 0:
										me = this;

										if (!me.opened) {
											me.open();
										}
										block = me.blocks[id];

										if (!block) {
											_context3.next = 8;
											break;
										}

										buffer = Buffer.alloc(block[1] - block[0]);

										fs.readSync(me.storefd, buffer, 0, block[1] - block[0], block[0]);
										result = JSON.parse(buffer.toString());
										return _context3.abrupt("return", (0, _get3.default)(JSONBlockStore.prototype.__proto__ || (0, _getPrototypeOf2.default)(JSONBlockStore.prototype), "restore", this).call(this, result.value));

									case 8:
									case "end":
										return _context3.stop();
								}
							}
						}, _callee3, this);
					}));

					function get(_x5) {
						return _ref3.apply(this, arguments);
					}

					return get;
				}()
			}, {
				key: "set",
				value: function () {
					var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(id, data, normalize) {
						var me;
						return _regenerator2.default.wrap(function _callee4$(_context4) {
							while (1) {
								switch (_context4.prev = _context4.next) {
									case 0:
										me = this;
										return _context4.abrupt("return", (0, _get3.default)(JSONBlockStore.prototype.__proto__ || (0, _getPrototypeOf2.default)(JSONBlockStore.prototype), "set", this).call(this, id, data, normalize, function (normalized) {
											return new _promise2.default(function (resolve, reject) {
												if (!me.opened) {
													me.open();
												}
												var block = me.blocks[id];
												var str = '{"id":"' + id + '","value":' + (0, _stringify2.default)(normalized) + '}';
												var blen = Buffer.byteLength(str, 'utf8');
												if (block) {
													// if normalized already stored
													if (block[0] + blen - 1 < block[1]) {
														// and update is same or smaller
														fs.writeSync(me.storefd, bytePadEnd(str, block[1] - block[0], me.encoding), block[0], me.encoding); // write the normalized with blank padding
														resolve(true);
													}
												}
												var freeblock = me.alloc(blen, me.encoding); // find a free block large enough
												fs.writeSync(me.storefd, bytePadEnd(str, freeblock[1] - freeblock[0], me.encoding), freeblock[0]); // write the normalized with blank padding
												me.storeSize = Math.max(freeblock[1], me.storeSize);
												me.blocks[id] = freeblock; // update the blocks info
												if (block) {
													// free old block which was too small, if there was one
													fs.writeSync(me.storefd, bytePadEnd("", block[1] - block[0], " "), block[0], me.encoding); // write blank padding
													me.free.push(block);
													str = blockString(block, me.encoding) + ",";
													fs.writeSync(me.freefd, str, me.freeSize, me.encoding);
													me.freeSize += Buffer.byteLength(str, me.encoding);
												}
												str = (me.blocksSize === 0 ? '{' : ',') + '"' + id + '":' + (0, _stringify2.default)(freeblock) + "}";
												var fposition = me.blocksSize === 0 ? 0 : me.blocksSize - 1;
												fs.writeSync(me.blocksfd, str, fposition, me.encoding);
												me.blocksSize = fposition + Buffer.byteLength(str, me.encoding);
												resolve(true);
											});
										}));

									case 2:
									case "end":
										return _context4.stop();
								}
							}
						}, _callee4, this);
					}));

					function set(_x6, _x7, _x8) {
						return _ref4.apply(this, arguments);
					}

					return set;
				}()
			}]);
			return JSONBlockStore;
		}(ReasonDB.Store);

		return JSONBlockStore;
	};
}).call(undefined);