(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let Database = require("./lib/Database"), Date = require("./lib/Date"), Array = require("./lib/Array");
    if (typeof module !== "undefined") {
        module.exports = Database;
    }
    if (typeof window !== "undefined") {
        window.ReasonDB = Database;
    }
})();


}).call(this,require('_process'))
},{"./lib/Array":2,"./lib/Database":5,"./lib/Date":6,"_process":20}],2:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    Array.indexKeys = ["length","$max","$min","$avg","*"];
    Array.reindexCalls = ["push","pop","splice","reverse","fill","shift","unshift"];
    Object.defineProperty(Array.prototype, "$max", {
        enumerable: false,
        configurable: true,
        get: function () {
            let result;
            this.forEach((value) => {
                result = result != null ? value > result ? value : result : value;
            });
            return result;
        },
        set: function () {}
    });
    Object.defineProperty(Array.prototype, "$min", {
        enumerable: false,
        configurable: true,
        get: function () {
            let result;
            this.forEach((value) => {
                result = result != null ? value < result ? value : result : value;
            });
            return result;
        },
        set: function () {}
    });
    Object.defineProperty(Array.prototype, "$avg", {
        enumerable: false,
        configurable: true,
        get: function () {
            let result = 0, count = 0;
            this.forEach((value) => {
                let v = value.valueOf();
                if (typeof v === "number") {
                    count++;
                    result += v;
                }
            });
            return result / count;
        },
        set: function () {}
    });
})();


}).call(this,require('_process'))
},{"_process":20}],3:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    function CXProduct(collections) {
        this.deleted = {};
        this.collections = collections ? collections : [];
        Object.defineProperty(this, "length", {
            set: function () {},
            get: function () {
                if (this.collections.length === 0) {
                    return 0;
                }
                if (this.start !== undefined && this.end !== undefined) {
                    return this.end - this.start;
                }
                ;
                var size = 1;
                this.collections.forEach(function (collection) {
                    size *= collection.length;
                });
                return size;
            }
        });
        Object.defineProperty(this, "size", {
            set: function () {},
            get: function () {
                return this.length;
            }
        });
    }
    
    function get(n, collections, dm, c) {
        for (var i = collections.length;i--; ) 
            c[i] = collections[i][(n / dm[i][0] << 0) % dm[i][1]];
    }
    
    CXProduct.prototype.get = function (index) {
        var me = this, c = [];
        for (var dm = [], f = 1, l, i = me.collections.length;i--; f *= l) {
            dm[i] = [f,l = me.collections[i].length];
        }
        get(index, me.collections, dm, c);
        return c.slice(0);
    };
    if (typeof module !== "undefined") {
        module.exports = CXProduct;
    }
    if (typeof window !== "undefined") {
        window.CXProduct = CXProduct;
    }
})();


}).call(this,require('_process'))
},{"_process":20}],4:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    class Cursor {
        constructor(classes, cxproduct, projection, classVarMap) {
            this.classes = classes;
            this.cxproduct = cxproduct;
            this.projection = projection;
            this.classVarMap = classVarMap;
            this.position = 0;
        }
        get count() {
            return this.cxproduct.length;
        }
        next() {
            let me = this;
            if (me.position < me.cxproduct.length) {
                return me.get(me.position++);
            }
        }
        move(postition) {
            let me = this;
            if (position >= 0 && position < me.cxproduct.length) {
                me.position = position;
            }
        }
        get(row) {
            let me = this;
            if (row >= 0 && row < me.cxproduct.length) {
                return new Promise((resolve, reject) => {
                    let promises = [];
                    row = me.cxproduct.get(row);
                    row.forEach((key, col) => {
                        promises.push(me.classes[col].index.get(key));
                    });
                    Promise.all(promises).then((results) => {
                        if (me.projection) {
                            let result = {};
                            Object.keys(me.projection).forEach((property) => {
                                let colspec = me.projection[property], classVar = Object.keys(colspec)[0], key = colspec[classVar], col = me.classVarMap[classVar];
                                result[property] = results[col][key];
                            });
                            resolve(result);
                        } else {
                            resolve(results);
                        }
                    });
                });
            }
        }
    }
    if (typeof module !== "undefined") {
        module.exports = Cursor;
    }
    if (typeof window !== "undefined") {
        window.Cursor = Cursor;
    }
})();


}).call(this,require('_process'))
},{"_process":20}],5:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let CXProduct = require("./CXProductLite"), Cursor = require("./Cursor"), Index = require("./Index"), iIndexedDB = typeof window !== "undefined" ? require("./iIndexedDB") : undefined, iLocalStorageDB = require("./iLocalStorageDB"), iLocalForageDB = require("./iLocalForageDB"), iMemDB = require("./iMemDB");
    class Database {
        constructor(keyProperty = "@key", Storage = iMemDB, name, shared, clear) {
            let db = this;
            db.clear = true;
            db.shared = shared;
            db.keyProperty = keyProperty;
            db.storage = new Storage(name);
            db.index(Object, shared, clear);
            db.Pattern = class Pattern {
                constructor(projection, classVars, when, then) {
                    let me = this;
                    me.projection = projection;
                    me.classNames = {};
                    Pattern.index.put(me);
                    Object.defineProperty(me, "classVars", {
                        configurable: true,
                        writable: true,
                        value: classVars
                    });
                    Object.keys(classVars).forEach((classVar) => {
                        me.classNames[classVar] = me.classVars[classVar].name;
                    });
                    Object.defineProperty(me, "when", {
                        configurable: true,
                        writable: true,
                        value: when
                    });
                    Object.defineProperty(me, "then", {
                        configurable: true,
                        writable: true,
                        value: then
                    });
                }
                toJSON() {
                    let me = this, result = {};
                    result[db.keyProperty] = me[db.keyProperty];
                    result.projection = me.projection;
                    result.classVars = me.classNames;
                    result.when = me.when;
                    result.then = me.then + "";
                    return result;
                }
            };
            db.Pattern.index = shared ? Object.index : new Index(db.Pattern, db, keyProperty, false, clear);
            db.Entity = class Entity {
                constructor(config, index) {
                    let me = this;
                    if (config && typeof config === "object") {
                        Object.keys(config).forEach((key) => {
                            me[key] = config[key];
                        });
                    }
                    if (index) {
                        Entity.index.put(me);
                    }
                    return me;
                }
            };
            db.Entity.index = shared ? Object.index : new Index(db.Entity, db, keyProperty, false, clear);
            if (shared) {
                Array.index = Object.index;
                db.Array = Array;
                Date.index = Object.index;
                db.Date = Date;
            } else {
                db.index(Array, false, clear);
                db.index(Date, false, clear);
            }
            db.patterns = {};
        }
        index(cls, shared, clear) {
            let db = this;
            if (!cls.index) {
                cls.index = new Index(cls, db, db.keyProperty, typeof shared === "boolean" ? shared : db.shared, typeof clear === "boolean" ? clear : db.clear);
                db[cls.name] = cls;
            }
        }
        select(projection) {
            var db = this;
            return {
                from(classVars) {
                    return {
                        when(whenPattern) {
                            return {
                                then(f) {
                                    //let pattern = new db.Pattern(projection,classVars,whenPattern);
                                    /*let next; // makes then chainable, but not serializable
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
                                    let pattern = new db.Pattern(projection, classVars, whenPattern, f);
                                    Object.keys(whenPattern).forEach((classVar) => {
                                        if (classVar[0] !== "$") {
                                            return;
                                        }
                                        let cls = classVars[classVar];
                                        if (!db.patterns[cls.name]) {
                                            db.patterns[cls.name] = {};
                                        }
                                        Object.keys(whenPattern[classVar]).forEach((property) => {
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
                        where(pattern, restrictVar, instanceId) {
                            /*return {
								then(f) {
									let matches = {};
									if(Object.keys(pattern).every((classVar) => {
										if(!classVars[classVar].index) { 
											return false;
										}
										if(classVar===restrictVar) {
											matches[classVar] = classVars[classVar].index.match(pattern[classVar],classVars,matches,instanceId);
										} else {
											matches[classVar] = classVars[classVar].index.match(pattern[classVar],classVars,matches);
										}
										return matches[classVar] && matches[classVar].length>0;
									})) {
										let classes = [],
										collections = [],
										classVarMap = {};
										Object.keys(matches).forEach((classVar,i) => {
											classes.push(classVars[classVar]);
											collections.push(matches[classVar]);
											classVarMap[classVar] = i;
										});
										f(new Cursor(classes,new CXProduct(collections),projection,classVarMap),matches);
									} else {
										f(new Cursor([],new CXProduct([]),projection,{}),matches);
									}
								}
							}*/
                            return new Promise((resolve, reject) => {
                                //	let loads = [];
                                //	Object.keys(classVars).forEach((classVar) => {
                                //		loads.push(classVars[classVar].index.load());
                                //	});
                                //	Promise.all(loads).then(() => {
                                let matches = {}, matchvars = [], promises = [];
                                Object.keys(pattern).forEach((classVar) => {
                                    let restrictions;
                                    if (!classVars[classVar].index) {
                                        return false;
                                    }
                                    matchvars.push(classVar);
                                    if (classVar === restrictVar) {
                                        restrictions = [instanceId];
                                    }
                                    promises.push(classVars[classVar].index.match(pattern[classVar], restrictions, classVars));
                                });
                                Promise.all(promises).then((results) => { // return matches[classVar] && matches[classVar].length>0;
                                    let pass = true;
                                    results.forEach((result, i) => {
                                        matches[matchvars[i]] = result;
                                        if (result.length === 0) {
                                            pass = false;
                                        }
                                    });
                                    if (!pass) {
                                        resolve(new Cursor([], new CXProduct([]), projection, {}), matches);
                                    } else {
                                        let classes = [], collections = [], classVarMap = {};
                                        Object.keys(matches).forEach((classVar, i) => {
                                            classes.push(classVars[classVar]);
                                            collections.push(matches[classVar]);
                                            classVarMap[classVar] = i;
                                        });
                                        resolve(new Cursor(classes, new CXProduct(collections), projection, classVarMap), matches);
                                    }
                                });
                            });
                        }
                    };
                }
            };
        }
    }
    Database.indexedDB = iIndexedDB; // });
    Database.localStorageDB = iLocalStorageDB;
    Database.localForageDB = iLocalForageDB;
    Database.memDB = iMemDB;
    if (typeof module !== "undefined") {
        module.exports = Database;
    }
    if (typeof window !== "undefined") {
        window.Database = Database;
    }
})();


}).call(this,require('_process'))
},{"./CXProductLite":3,"./Cursor":4,"./Index":7,"./iIndexedDB":8,"./iLocalForageDB":10,"./iLocalStorageDB":12,"./iMemDB":14,"_process":20}],6:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    Date.indexKeys = [];
    Date.reindexCalls = [];
    Object.getOwnPropertyNames(Date.prototype).forEach((key) => {
        if (key.indexOf("get") === 0) {
            let name = key.indexOf("UTC") >= 0 ? key.slice(3) : key.charAt(3).toLowerCase() + key.slice(4), setkey = "set" + key.slice(3), get = Function("return function() { return this." + key + "(); }")(), set = Function("return function(value) { " + (Date.prototype[setkey] ? "return this." + setkey + "(value); " : "") + "}")();
            Object.defineProperty(Date.prototype, name, {
                enumerable: false,
                configurable: true,
                get: get,
                set: set
            });
            Date.indexKeys.push(name);
            if (Date.prototype[setkey]) {
                Date.reindexCalls.push(setkey);
            }
        }
    });
})();


}).call(this,require('_process'))
},{"_process":20}],7:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let intersection = require("./intersection"), soundex = require("./soundex"), CXProduct = require("./CXProductLite"), Cursor = require("./Cursor");
    function IndexValue(value, id, node, keyProperty, db) {
        let type = typeof value, indextype = Index.typeOf(value);
        if (type === "object" && indextype !== "object") {
            let keys = Index.keys(value);
            indextype = (indextype += "@");
            keys.forEach((property) => {
                if (!node[indextype]) {
                    node[indextype] = {};
                }
                if (!node[indextype][property]) {
                    node[indextype][property] = {};
                }
                IndexValue(value[property], id, node[indextype][property], keyProperty, db);
            });
        } else if (type !== "undefined") {
            if (value && indextype === "object") {
                if (!value.constructor.index) {
                    value.constructor.index = new Index(value.constructor, keyProperty, db);
                }
                value.constructor.index.put(value);
                indextype = value.constructor.name + "@";
                value = value[keyProperty];
            }
            if (!node[value]) {
                node[value] = {};
            }
            if (!node[value][indextype]) {
                node[value][indextype] = {};
            }
            node[value][indextype][id] = true;
        }
    }
    
    function UnIndexValue(value, id, node, keyProperty, db) {
        let type = typeof value, indextype = Index.typeOf(value);
        if (type !== "undefined") {
            if (type === "object" && indextype !== "object") {
                if (!node[indextype]) {
                    return;
                }
                let keys = Index.keys(value);
                keys.forEach((property) => {
                    if (!node[indextype][property]) {
                        return;
                    }
                    UnIndexValue(value[property], id, node[indextype][property], keyProperty, db);
                });
            } else {
                if (value && indextype === "object") {
                    if (!value.constructor.index) {
                        return;
                    }
                    indextype = value.constructor.name + "@";
                    value = value[keyProperty];
                }
                if (!node[value]) {
                    return;
                }
                if (!node[value][indextype]) {
                    return;
                }
                delete node[value][indextype][id];
            }
        }
    }
    
    class Index {
        constructor(cls, db, keyProperty = "@key", shared, clear) {
            Object.defineProperty(this, "__metadata__", {
                value: {
                    cls: cls,
                    className: cls.name,
                    locations: {},
                    scope: {},
                    shared: shared,
                    instances: {},
                    db: db,
                    nextid: 0,
                    keyProperty: keyProperty,
                    store: db.storage.createStore(cls.name, db, typeof shared === "boolean" ? shared : db.shared, typeof clear === "boolean" ? clear : db.clear)
                }
            });
            cls.index = this;
        }
        activate(cls, property, value, path = [], id) {
            let index = this, type = value === null ? "undefined" : typeof value, keyProperty = index.__metadata__.keyProperty;
            if (!cls.index[property]) {
                cls.index[property] = {};
            }
            if (type === "object") {
                let pcls = value.constructor;
                if (!pcls.index) {
                    pcls.index = index.__metadata__.shared ? index : new Index(pcls, index.db, false);
                }
                if (!value[keyProperty]) {
                    value[keyProperty] = pcls.name + "@" + ++pcls.index.__metadata__.nextid;
                }
                ;
                if (!cls.index[property][value[keyProperty]]) {
                    cls.index[property][value[keyProperty]] = {};
                }
                if (!cls.index[property][value[keyProperty]].object) {
                    cls.index[property][value[keyProperty]].object = {};
                }
                cls.index[property][value[keyProperty]].object[id] = true;
            } else if (value !== undefined) {
                if (!cls.index[property][value]) {
                    cls.index[property][value] = {};
                }
                if (!cls.index[property][value][type]) {
                    cls.index[property][value][type] = {};
                }
                cls.index[property][value][type][id] = true;
            }
        }
        coerce(value, type) {
            let conversions = {
                string: {
                    number: parseFloat,
                    boolean: (value) => {
                        return ["true","yes","on"].indexOf(value) >= 0 ? true : ["false",
                            "no","off"].indexOf(value) >= 0 ? false : value;
                    }
                },
                number: {
                    string: (value) => {
                        return value + "";
                    },
                    boolean: (value) => {
                        return !(!value);
                    }
                },
                boolean: {
                    number: (value) => {
                        return value ? 1 : 0;
                    },
                    string: (value) => {
                        return value + "";
                    }
                }
            }, vtype = typeof value;
            if (type === vtype) {
                return value;
            }
            if (conversions[vtype] && conversions[vtype][type]) {
                return conversions[vtype][type](value);
            }
            return value;
        }
        delete(key) {
            let me = this;
            if (key && key.indexOf("@") >= 1) {
                delete me[key];
                return me.__metadata__.store.delete(key);
            }
        }
        flush(key) {
            let me = this, keys = key ? [key] : Object.keys(me);
            keys.forEach((key) => {
                if (key.indexOf("@") >= 1) {
                    me[key] = true;
                }
            });
        }
        get(key) {
            return (function ($return, $error) {
                let me = this, value = me[key], type = typeof value;
                if (type === "undefined" || type === "boolean" && key.indexOf("@") >= 1) {
                    //return new Promise((resolve,reject) => {
                    let value = me.__metadata__.store.get(key);
                    //.then((value) => {
                    me[key] = value ? value : {};
                    //	resolve(value);
                    return $return(Promise.resolve(value));
                }
                //});
                //});
                return $return(Promise.resolve(value));
            }).$asyncbind(this, true);
        }
        instances(keyArray) {
            let index = this, promises = [];
            keyArray.forEach((key) => {
                promises.push(index.get(key));
            });
            return Promise.all(promises);
        }
        join(foreignClass, foreignPattern, varName) {
            // (Object,{name: "name"}})
            varName = varName ? varName : "$" + this.__metadata__.cls.name;
            return foreignClass.index.match(foreignPattern, undefined, undefined, this, varName);
        }
        keys(object) {
            let keys = Object.keys(object);
            if (object.indexKeys) {
                let i = object.indexKeys.indexOf("*");
                if (i >= 0) {
                    let result = object.indexKeys.concat(keys);
                    result.splice(i, 1);
                    return result;
                }
                return object.indexKeys.slice();
            }
            if (object.constructor.indexKeys) {
                let i = object.constructor.indexKeys.indexOf("*");
                if (i >= 0) {
                    let result = object.constructor.indexKeys.concat(keys);
                    result.splice(i, 1);
                    return result;
                }
                return object.constructor.indexKeys.slice();
            }
            return keys;
        }
        match(pattern, restrictToIds, classVars = {}, parentKey, joinIndex, joinVar) {
            let index = this, cls = pattern.$class, clstype = typeof cls, clsprefix;
            if (clstype === "string") {
                cls = index.__metadata__.scope[cls];
                if (!cls) {
                    try {
                        cls = new Function("return " + cls)();
                    } catch (e) {
                        return Promise.resolve([]);
                    }
                }
                index = cls.index;
            } else if (clstype === "function") {
                index = cls.index;
            }
            if (!index) {
                return Promise.resolve([]);
            }
            if (cls) {
                clsprefix = cls ? cls.name + "@" : undefined;
            }
            let keys = Object.keys(pattern);
            // process literals first
            if (keys.length === 0) {
                return Promise.resolve([]);
            }
            if (keys.length === 1 && cls) {
                return Promise.resolve(Object.keys(index.__metadata__.instances[cls.name]));
            }
            return new Promise((finalresolve, finareject) => {
                // do literal matches, they are fastest
                //joinkeys = [],
                let predicatekeys = [], objectkeys = [], promises = [], joinvars = {}, results;
                keys.forEach((key) => {
                    if (key === "$class") {
                        return;
                    }
                    if (classVars[key]) {
                        joinvars[key] = {
                            index: classVars[key].index,
                            property: parentKey
                        };
                        //joinkeys.push(key);
                        return;
                    }
                    promises.push(new Promise((resolve, reject) => {
                        let value = pattern[key], type = value === null ? "undefined" : typeof value;
                        if (type === "object") {
                            predicatekeys.push(key);
                            resolve(true); //  ignore objects
                        } else {
                            let node = index.get(key);
                            if (!node) {
                                resolve(false);
                            } else {
                                index.get(key).then(() => { //  use Promise to load index node for property, predicate and object tests then won't need to use Promise
                                    if (!index[key] || !index[key][value] || !index[key][value][type]) {
                                        resolve(false);
                                    } else {
                                        let filtered = clsprefix ? Object.keys(index[key][value][type]).filter((id) => {
                                            return id.indexOf(clsprefix) === 0;
                                        }) : Object.keys(index[key][value][type]), ids = restrictToIds ? intersection(filtered, restrictToIds) : filtered;
                                        results = results ? intersection(results, ids) : ids;
                                        if (results.length === 0) {
                                            resolve(false);
                                        } else {
                                            resolve(true);
                                        }
                                    }
                                });
                            }
                        }
                    }));
                });
                Promise.all(promises).then((resolutions) => {
                    if (resolutions.indexOf(false) >= 0) {
                        finalresolve([]);
                    } else {
                        // do predicates, they are next fastest, don't need promises
                        if (!predicatekeys.every((key) => {
                            let predicate = pattern[key];
                            if (predicate && typeof predicate === "object") {
                                let testname = Object.keys(predicate)[0], test = Index[testname];
                                if (!index[key]) {
                                    return false;
                                }
                                /*	if(testname===joinVar) {
									joinkeys.push(key);
									return true;
								}*/
                                if (testname.indexOf("$") === -1 || typeof test !== "function") {
                                    objectkeys.push(key);
                                    return true;
                                }
                                let v2 = predicate[testname], v2type = v2 === null ? "undefined" : typeof v2, ids = [];
                                Object.keys(index[key]).forEach((v1str) => {
                                    Object.keys(index[key][v1str]).forEach((v1type) => {
                                        if (test(index.coerce(v1str, v1type), v2)) {
                                            ids = ids.concat(Object.keys(index[key][v1str][v1type]));
                                        }
                                    });
                                });
                                results = results ? intersection(results, ids) : ids;
                                return results.length > 0;
                            }
                            return true;
                        })) {
                            finalresolve([]);
                        } else {
                            // do nested objects
                            promises = [];
                            objectkeys.forEach((key) => {
                                promises.push(new Promise((resolve, reject) => {
                                    let value = pattern[key], type = value === null ? "undefined" : typeof value;
                                    if (!index[key]) {
                                        resolve(false);
                                    }
                                    if (type === "object") {
                                        let ids = [];
                                        index.match(value, Object.keys(index[key]), classVars, key).then((childids) => {
                                            childids.forEach((id) => {
                                                if (clsprefix && id.indexOf(clsprefix) !== 0) { //  tests for $class
                                                    return;
                                                }
                                                if (index[key][id] && index[key][id].object) {
                                                    ids = ids.concat(Object.keys(index[key][id].object));
                                                } else if (index[id]) {
                                                    ids.push(index[id]);
                                                }
                                            });
                                            results = results ? intersection(results, ids) : ids;
                                            if (results.length === 0) {
                                                resolve(false);
                                            } else {
                                                resolve(true);
                                            }
                                        });
                                    } else {
                                        resolve(true); //  ignore non-objects
                                    }
                                }));
                            });
                            Promise.all(promises).then((resolutions) => {
                                if (resolutions.indexOf(false) >= 0) {
                                    finalresolve([]);
                                } else {
                                    // do joins
                                    let joined;
                                    Object.keys(joinvars).every((joinvar) => { //  need to turn into promises
                                        let join = pattern[joinvar], jointype = typeof join, joinindex = joinvars[joinvar].index, property = joinvars[joinvar].property, jointest, joinproperty;
                                        if (jointype === "string") {
                                            joinproperty = join;
                                        } else {
                                            jointest = Object.keys(join)[0];
                                            joinproperty = join[jointest];
                                        }
                                        if (!joinindex) {
                                            return false;
                                        }
                                        if (!joinindex[joinproperty]) {
                                            joined = [];
                                            return false;
                                        } else {
                                            let ids = []; //  this is inverted should have test outside join var
                                            Object.keys(index[property]).forEach((value) => {
                                                if (Index[jointest]) {
                                                    Object.keys(index[property][value]).forEach((type) => {
                                                        Object.keys(joinindex).forEach((testValue) => {
                                                            Object.keys(joinindex[testValue]).forEach((testType) => {
                                                                if (Index[jointest](Index.coerce(value, type), Index.coerce(testValue, testType))) {
                                                                    ids = ids.concat(Object.keys(index[property][value][type]));
                                                                }
                                                            });
                                                        });
                                                    });
                                                } else {
                                                    if (joinindex[joinproperty][value]) {
                                                        Object.keys(index[property][value]).forEach((type) => {
                                                            if (joinindex[joinproperty][value][type]) {
                                                                ids = ids.concat(Object.keys(index[property][value][type]));
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                            joined = joined ? intersection(joined, ids) : intersection(ids, ids);
                                            return true;
                                        }
                                    });
                                    if (joined) {
                                        finalresolve(joined);
                                    } else {
                                        finalresolve(results ? results : []);
                                    }
                                }
                            });
                        }
                    }
                });
            });
        }
        reindexCalls(object) {
            if (object.reindexCalls) {
                return object.reindexCalls;
            }
            if (object.constructor.reindexCalls) {
                return object.constructor.reindexCalls;
            }
            return [];
        }
        put(value, path = []) {
            let index = this, type = typeof value, keyProperty = index.__metadata__.keyProperty, store = index.__metadata__.store;
            if (!type || type !== "object") {
                return Promise.reject(new Error("Can't index primitive value " + value));
            }
            let cls = value.constructor;
            if (!cls.index) {
                cls.index = index.__metadata__.shared ? index : new Index(cls, index.db, false);
            }
            if (!value[keyProperty]) {
                value[keyProperty] = cls.name + "@" + ++cls.index.__metadata__.nextid;
            }
            ;
            cls.index.__metadata__.scope[cls.name] = cls;
            if (!cls.index.__metadata__.instances[cls.name]) {
                cls.index.__metadata__.instances[cls.name] = {};
            }
            cls.index.__metadata__.instances[cls.name][value[keyProperty]] = value;
            if (path.length > 0) {
                if (!cls.index.__metadata__.locations[value[keyProperty]]) {
                    cls.index.__metadata__.locations[value[keyProperty]] = {};
                }
                cls.index.__metadata__.locations[value[keyProperty]][path[path.length - 1]] = true;
            }
            return new Promise((resolve, reject) => {
                store.put(value).then(() => {
                    index.set(value[keyProperty], value).then(() => {
                        let promises = [];
                        Index.keys(value).forEach((property) => {
                            promises.push(new Promise((resolve, reject) => {
                                let pvalue = value[property], ptype = pvalue === null ? "undefined" : typeof pvalue;
                                cls.index.get(property).then(() => {
                                    index.activate(cls, property, pvalue, path, value[keyProperty]);
                                    let tmp = store.set(property, cls.index[property]);
                                    tmp.then(() => {
                                        if (ptype === "object") {
                                            let parents = path.slice();
                                            parents.push(value[keyProperty]);
                                            index.put(pvalue, parents).then(() => {
                                                resolve();
                                            }).catch((e) => {
                                                console.log(e);
                                            });
                                            ;
                                        } else {
                                            resolve();
                                        }
                                    }).catch((e) => {
                                        console.log(e);
                                    });
                                }).catch((e) => {
                                    console.log(e);
                                });
                            }).catch((e) => {
                                console.log(e);
                            }));
                        });
                        Promise.all(promises).then(() => {
                            resolve();
                        }).catch((e) => {
                            console.log(e);
                        });
                        ;
                    });
                });
            });
        }
        save() {
            let me = this, store = me.__metadata__.store, promises = [];
            if (store) {
                Object.keys(me).forEach((property) => {
                    promises.push(store.set(property, me[property]));
                });
            }
            return Promise.all(promises);
        }
        set(key, value) {
            let me = this, oldvalue = me[key], type = typeof value;
            if (type === "undefined" || type === "boolean" && key.indexOf("@") >= 1 || oldvalue !== value) {
                return new Promise((resolve, reject) => {
                    me.__metadata__.store.set(key, value).then(() => {
                        me[key] = value;
                        resolve();
                    });
                });
            }
            return Promise.resolve();
        }
    }
    Index.$ = ((value, f) => {
        return f(value);
    });
    Index.$coerce = function (value, type) {
        let t = typeof value, ctable = {
            string: {
                number: parseFloat
            },
            number: {
                string: (value) => {
                    return value + "";
                }
            }
        };
        if (t === type) {
            return value;
        }
        if (ctable[t] && ctable[t][type]) {
            return ctable[t][type](value);
        }
        return value;
    };
    Index.$typeof = function () {
        return true; //  test is done in method find
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
        var end1 = testValue[0], end2 = testValue[1], inclusive = testValue[2], start = Math.min(end1, end2), stop = Math.max(end1, end2);
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
    Index.prototype.oldput = function (object) {
        let index = this, keyProperty = index.metadata.keyProperty, db = index.metadata.db, store = index.metadata.store;
        if (!object || typeof object !== "object") {
            return;
        }
        if (object[keyProperty] == null) {
            object[keyProperty] = this.uid();
        }
        store.put(object);
        index[object[keyProperty]] = object;
        let keys = Index.keys(object);
        keys.forEach((property) => {
            function get() {
                if (get.get) {
                    return get.get.call(this);
                }
                return get.value;
            }
            
            function set(value) {
                let me = this, type = Index.typeOf(value), oldvalue = get.get ? get.get.call(this) : get.value;
                if (set.set) {
                    set.set.call(this, value);
                } else {
                    get.value = value;
                }
                if (oldvalue !== value) {
                    if (!index[property]) {
                        index[property] = {};
                    }
                    UnIndexValue(oldvalue, me[keyProperty], index[property], keyProperty, db);
                    IndexValue(value, me[keyProperty], index[property], keyProperty, db);
                    if (db) {
                        index.patternMatch(me, property);
                    }
                }
            }
            
            let value = object[property], desc = Object.getOwnPropertyDescriptor(object, property);
            if (!desc) {
                desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(object), property);
            }
            if (desc && desc.configurable && desc.writable) {
                if (!desc.set + "" !== set + "") {
                    if (desc.get) {
                        get.get = desc.get;
                    }
                    desc.get = get;
                    if (desc.set) {
                        set.set = desc.set;
                    }
                    desc.set = set;
                    delete desc.writable;
                    delete desc.value;
                    Object.defineProperty(object, property, desc);
                }
                object[property] = value;
            } else {
                if (!index[property]) {
                    index[property] = {};
                }
                IndexValue(value, object[keyProperty], index[property], keyProperty, db);
                if (db) {
                    index.patternMatch(object, property);
                }
            }
            store.set(property, index[property]);
        });
        Index.reindexCalls(object).forEach((key) => {
            let desc = Object.getOwnPropertyDescriptor(object, key);
            if (!desc) {
                desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(object), key);
            }
            if (desc && desc.configurable) {
                desc.value = new Proxy(desc.value, {
                    apply: (target, thisArg, argumentsList) => {
                        keys.forEach((property) => {
                            if (!index[property]) {
                                index[property] = {};
                            }
                            UnIndexValue(thisArg[property], thisArg[keyProperty], index[property], keyProperty, db);
                        });
                        target.call(thisArg, ...argumentsList);
                        keys.forEach((property) => {
                            IndexValue(thisArg[property], thisArg[keyProperty], index[property], keyProperty, db);
                        });
                    }
                });
                Object.defineProperty(object, key, desc);
            }
        });
    };
    Index.prototype.patternMatch = function (object, property) { // index.save();
        let index = this, db = index.metadata.db, cls = object.constructor, keyProperty = index.metadata.keyProperty;
        if (db.patterns[cls.name] && db.patterns[cls.name][property]) {
            Object.keys(db.patterns[cls.name][property]).forEach((patternId) => {
                Object.keys(db.patterns[cls.name][property][patternId]).forEach((classVar) => {
                    let pattern = db.patterns[cls.name][property][patternId][classVar];
                    db.select(pattern.projection).from(pattern.classVars).where(pattern.when, classVar, object[keyProperty]).then((cursor, matches) => {
                        if (cursor.count > 0) {
                            pattern.then(cursor, matches);
                        }
                    });
                });
            });
        }
    };
    Index.prototype.match.cache = {};
    Index.keys = function (object) {
        let keys = Object.keys(object);
        if (object.indexKeys) {
            let i = object.indexKeys.indexOf("*");
            if (i >= 0) {
                let result = object.indexKeys.concat(keys);
                result.splice(i, 1);
                return result;
            }
            return object.indexKeys.slice();
        }
        if (object.constructor.indexKeys) {
            let i = object.constructor.indexKeys.indexOf("*");
            if (i >= 0) {
                let result = object.constructor.indexKeys.concat(keys);
                result.splice(i, 1);
                return result;
            }
            return object.constructor.indexKeys.slice();
        }
        return keys;
    };
    Index.reindexCalls = function (object) {
        if (object.reindexCalls) {
            return object.reindexCalls;
        }
        if (object.constructor.reindexCalls) {
            return object.constructor.reindexCalls;
        }
        return [];
    };
    Index.typeOf = function (value) {
        let type = typeof value;
        if (value && type === "object") {
            if (value.indexType) {
                return value.indexType;
            }
            if (value.constructor.indexType) {
                return value.constructor.indexType;
            }
        }
        return type;
    };
    if (typeof module !== "undefined") {
        module.exports = Index;
    }
    if (typeof window !== "undefined") {
        window.Index = Index;
    }
})();


}).call(this,require('_process'))
},{"./CXProductLite":3,"./Cursor":4,"./intersection":17,"./soundex":18,"_process":20}],8:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let iIndexedDBStore = require("./iIndexedDBStore");
    class iIndexedDB {
        constructor(name) {
            this.name = name;
        }
        createStore(name, db) {
            return new iIndexedDBStore(name, db);
        }
        close() {
            me.db.close();
            me.db = null;
        }
        open() {
            let me = this;
            return new Promise((resolve, reject) => {
                if (me.db) {
                    resolve();
                    return;
                }
                let request = indexedDB.open(me.name, 2);
                request.onerror = function (event) {
                    reject(event);
                };
                request.onupgradeneeded = function (event) {
                    let db = event.target.result;
                    try {
                        db.deleteObjectStore("Values");
                    } catch (e) {}
                    db.createObjectStore("Values"); //  ignore
                };
                request.onsuccess = function (event) {
                    me.db = event.target.result;
                    resolve();
                };
            });
        }
    }
    if (typeof module !== "undefined") {
        module.exports = iIndexedDB;
    }
    if (typeof window !== "undefined") {
        window.iIndexedDB = iIndexedDB;
    }
})();


}).call(this,require('_process'))
},{"./iIndexedDBStore":9,"_process":20}],9:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let iStore = require("./iStore");
    class iIndexedDBStore extends iStore {
        constructor(name, db) {
            super(name, db);
        }
        delete(key) {
            let me = this;
            return new Promise((resolve, reject) => {
                me.initialized().then((data) => {
                    delete data[key];
                    if (key.indexOf("@") >= 0) {
                        let parts = key.split("@");
                        //if(parts[0]===me.name) {
                        let transaction = me.db().storage.db.transaction(["Values"], "readwrite"), request = transaction.objectStore("Values").delete(key);
                        transaction.onerror = function (event) {
                            reject(event.srcElement.error);
                        };
                        request.onsuccess = function (event) {
                            me.save().then(() => {
                                resolve();
                            });
                        };
                        return;
                    }
                    me.save().then(() => { // }
                        resolve();
                    });
                });
            });
        }
        get(key) {
            let me = this, keyProperty = me.db().keyProperty;
            return new Promise((resolve, reject) => {
                me.initialized().then((data) => {
                    let result = data[key];
                    if (key.indexOf("@") >= 0 && data[keyProperty] && data[keyProperty][key]) {
                        let transaction = me.db().storage.db.transaction(["Values"]), request = transaction.objectStore("Values").get(key);
                        transaction.onerror = function (event) {
                            reject(event.srcElement.error);
                        };
                        request.onsuccess = function (event) {
                            result = (data[key] = me.restore(request.result));
                            resolve(result);
                        };
                        return;
                    }
                    resolve(result);
                });
            });
        }
        initialized() {
            let me = this;
            return new Promise((resolve, reject) => {
                me.db().storage.open().then(() => {
                    me.load().then((data) => {
                        if (!data) {
                            me.data = {};
                            me.save().then(() => {
                                resolve(me.data);
                            });
                        } else {
                            resolve(data);
                        }
                    });
                });
            });
        }
        load(force) {
            let me = this;
            return new Promise((resolve, reject) => {
                if (me.data && !force) {
                    resolve(me.data);
                    return;
                }
                let transaction = me.db().storage.db.transaction(["Values"]), request = transaction.objectStore("Values").get(me.__metadata__.name); //  perhaps add transaction to storage??
                transaction.oncomplete = function (event) {
                    resolve(me.data);
                };
                transaction.onerror = function (event) {
                    reject(event.srcElement.error);
                };
                request.onsuccess = function (event) {
                    me.data = me.restore(request.result);
                };
            });
        }
        put(object) {
            let me = this;
            return new Promise((resolve, reject) => {
                me.db().storage.open().then(() => {
                    let keyProperty = me.db().keyProperty, transaction = me.db().storage.db.transaction(["Values"], "readwrite");
                    transaction.objectStore("Values").put(me.normalize(object), object[keyProperty]);
                    transaction.oncomplete = function (event) {
                        resolve();
                    };
                    transaction.onerror = function (event) {
                        reject(event.srcElement.error);
                    };
                });
            });
        }
        save() {
            let me = this;
            return new Promise((resolve, reject) => {
                if (!me.data) {
                    resolve();
                    return;
                }
                let transaction = me.db().storage.db.transaction(["Values"], "readwrite"), request = transaction.objectStore("Values").put(me.normalize(me.data), me.__metadata__.name);
                transaction.oncomplete = function (event) {
                    resolve();
                };
                transaction.onerror = function (event) {
                    reject(event.srcElement.error);
                };
                request.onerror = function (event) {
                    reject(event.srcElement.error);
                };
            });
        }
        set(key, value) {
            let me = this;
            return new Promise((resolve, reject) => {
                me.initialized().then((data) => {
                    me.addScope(value);
                    data[key] = value;
                    me.save().then(() => {
                        resolve();
                    });
                });
            });
        }
    }
    if (typeof module !== "undefined") {
        module.exports = iIndexedDBStore;
    }
    if (typeof window !== "undefined") {
        window.iIndexedDBStore = iIndexedDBStore;
    }
})();


}).call(this,require('_process'))
},{"./iStore":16,"_process":20}],10:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let iLocalForageDBStore = require("./iLocalForageDBStore");
    if (typeof window !== "undefined" && window.iLocalForageDBStore) {
        iLocalForageDBStore = window.iLocalForageDBStore;
    }
    class iLocalForageDB {
        constructor(name) {
            this.name = name;
        }
        createStore(name, db, clear) {
            return new iLocalForageDBStore(name, db, clear);
        }
        close() {}
        open() {
            return Promise.resolve();
        }
    }
    if (typeof module !== "undefined") {
        module.exports = iLocalForageDB;
    }
    if (typeof window !== "undefined") {
        window.iLocalForageDB = iLocalForageDB;
    }
})();


}).call(this,require('_process'))
},{"./iLocalForageDBStore":11,"_process":20}],11:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let iStore = require("./iStore"), LocalForage = require("localforage");
    class iLocalForageDBStore extends iStore {
        constructor(name, db, clear) {
            super(name, db);
            if (typeof window !== "undefined") {
                LocalForage.config({
                    name: name
                });
                this.storage = LocalForage;
            } else {
                this.storage = new LocalForage("./db/" + name);
            }
            if (clear) {
                this.storage.clear();
            }
        }
        delete(key) {
            let me = this;
            return new Promise((resolve, reject) => {
                me.initialized().then((data) => {
                    delete data[key];
                    if (key.indexOf("@") >= 0) {
                        let parts = key.split("@");
                        if (parts[0] === me.name) {
                            me.storage.removeItem(key + ".json").then(() => {
                                me.save().then(() => {
                                    resolve();
                                });
                            });
                            return;
                        }
                    }
                    me.save().then(() => {
                        resolve();
                    });
                });
            });
        }
        get(key) {
            let me = this, keyProperty = me.db().keyProperty;
            return new Promise((resolve, reject) => {
                me.initialized().then((data) => {
                    let result = data[key];
                    if (key.indexOf("@") >= 0 && data[keyProperty] && data[keyProperty][key]) {
                        let parts = key.split("@");
                        if (parts[0] === me.name) {
                            me.storage.getItem(key + ".json").then((value) => {
                                result = (data[key] = me.restore(value));
                                resolve(result);
                            });
                            return;
                        }
                    }
                    resolve(result);
                });
            });
        }
        initialized() {
            let me = this;
            return new Promise((resolve, reject) => {
                me.db().storage.open().then(() => {
                    me.load().then((data) => {
                        if (!data) {
                            me.data = {};
                            me.save().then(() => {
                                resolve(me.data);
                            });
                        } else {
                            resolve(data);
                        }
                    });
                });
            });
        }
        load(force) {
            let me = this;
            return new Promise((resolve, reject) => {
                if (me.data && !force) {
                    resolve(me.data);
                    return;
                }
                me.storage.getItem(me.__metadata__.name + ".json").then((value) => {
                    me.data = value;
                    resolve(me.data);
                });
            });
        }
        put(object) {
            let me = this;
            return new Promise((resolve, reject) => {
                me.db().storage.open().then(() => {
                    let keyProperty = me.db().keyProperty;
                    me.storage.setItem(object[keyProperty] + ".json", me.normalize(object)).then(() => {
                        resolve();
                    });
                });
            });
        }
        save() {
            let me = this;
            return new Promise((resolve, reject) => {
                if (!me.data) {
                    resolve();
                    return;
                }
                me.storage.setItem(me.__metadata__.name + ".json", me.normalize(me.data));
                resolve();
            });
        }
        set(key, value) {
            let me = this;
            return new Promise((resolve, reject) => {
                me.initialized().then((data) => {
                    data[key] = value;
                    me.save().then(() => {
                        resolve();
                    });
                });
            });
        }
    }
    if (typeof window !== "undefined") {
        window.iLocalForageDBStore = iLocalForageDBStore;
        module.exports = iLocalForageDBStore;
    } else {
        let r = require;
        module.exports = r("./iLocalStorageDBStore");
    }
})();


}).call(this,require('_process'))
},{"./iStore":16,"_process":20,"localforage":19}],12:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let iLocalStorageDBStore = require("./iLocalStorageDBStore");
    class iLocalStorageDB {
        constructor(name) {
            this.name = name;
        }
        createStore(name, db, clear) {
            return new iLocalStorageDBStore(name, db, clear);
        }
        close() {}
        open() {
            return Promise.resolve();
        }
    }
    if (typeof module !== "undefined") {
        module.exports = iLocalStorageDB;
    }
    if (typeof window !== "undefined") {
        window.iLocalStorageDB = iLocalStorageDB;
    }
})();


}).call(this,require('_process'))
},{"./iLocalStorageDBStore":13,"_process":20}],13:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let iStore = require("./iStore"), LocalStorage;
    if (typeof window !== "undefined") {
        LocalStorage = window.localStorage;
    } else {
        let r = require, fs = r("fs");
        try {
            fs.mkdirSync("./db");
        } catch (e) {}
        LocalStorage = r("node-localstorage").LocalStorage; //  ignore //  indirection avoids load of unused code into browserfied version
    }
    class iLocalStorageDBStore extends iStore {
        constructor(name, db, clear) {
            super(name, db);
            if (typeof window !== "undefined") {
                this.storage = LocalStorage;
            } else {
                this.storage = new LocalStorage("./db/" + name);
            }
            if (clear) {
                this.storage.clear();
            }
        }
        delete(key) {
            let me = this;
            return new Promise((resolve, reject) => {
                me.initialized().then((data) => {
                    delete data[key];
                    if (key.indexOf("@") >= 0) {
                        let parts = key.split("@");
                        if (parts[0] === me.name) {
                            me.storage.removeItem(key + ".json");
                            me.save().then(() => {
                                resolve();
                            });
                            return;
                        }
                    }
                    me.save().then(() => {
                        resolve();
                    }).catch((e) => {
                        console.log(e);
                    });
                    ;
                }).catch((e) => {
                    console.log(e);
                });
                ;
            }).catch((e) => {
                console.log(e);
            });
        }
        get(key) {
            let me = this, keyProperty = me.db().keyProperty;
            return new Promise((resolve, reject) => {
                me.initialized().then((data) => {
                    let result = data[key];
                    if (key.indexOf("@") >= 0 && data[keyProperty] && data[keyProperty][key]) {
                        let parts = key.split("@");
                        if (parts[0] === me.name) {
                            result = (data[key] = me.restore(JSON.parse(me.storage.getItem(key + ".json"))));
                            resolve(result);
                            return;
                        }
                    }
                    resolve(result);
                }).catch((e) => {
                    console.log(e);
                });
                ;
            }).catch((e) => {
                console.log(e);
            });
        }
        initialized() {
            let me = this;
            return new Promise((resolve, reject) => {
                me.db().storage.open().then(() => {
                    me.load().then((data) => {
                        if (!data) {
                            me.data = {};
                            me.save().then(() => {
                                resolve(me.data);
                            });
                        } else {
                            resolve(data);
                        }
                    }).catch((e) => {
                        console.log(e);
                    });
                    ;
                }).catch((e) => {
                    console.log(e);
                });
                ;
            }).catch((e) => {
                console.log(e);
            });
        }
        load(force) {
            let me = this;
            return new Promise((resolve, reject) => {
                if (me.data && !force) {
                    resolve(me.data);
                    return;
                }
                let value = me.storage.getItem(me.__metadata__.name + ".json");
                if (value) {
                    me.data = JSON.parse(value);
                } else {
                    me.data = {};
                }
                resolve(me.data);
            }).catch((e) => {
                console.log(e);
            });
        }
        put(object) {
            let me = this;
            return new Promise((resolve, reject) => {
                me.db().storage.open().then(() => {
                    let keyProperty = me.db().keyProperty;
                    me.storage.setItem(object[keyProperty] + ".json", JSON.stringify(me.normalize(object)));
                    resolve();
                }).catch((e) => {
                    console.log(e);
                });
            }).catch((e) => {
                console.log(e);
            });
        }
        save() {
            let me = this;
            return new Promise((resolve, reject) => {
                if (!me.data) {
                    resolve();
                    return;
                }
                me.storage.setItem(me.__metadata__.name + ".json", JSON.stringify(me.normalize(me.data)));
                resolve();
            }).catch((e) => {
                console.log(e);
            });
        }
        set(key, value) {
            let me = this;
            return new Promise((resolve, reject) => {
                me.initialized().then((data) => {
                    data[key] = value;
                    me.save().then(() => {
                        resolve();
                    }).catch((e) => {
                        console.log(e);
                    });
                }).catch((e) => {
                    console.log(e);
                });
            }).catch((e) => {
                console.log(e);
            });
        }
    }
    if (typeof module !== "undefined") {
        module.exports = iLocalStorageDBStore;
    }
    if (typeof window !== "undefined") {
        window.iLocalStorageDBStore = iLocalStorageDBStore;
    }
})();


}).call(this,require('_process'))
},{"./iStore":16,"_process":20}],14:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let iMemStore = require("./iMemStore");
    class iMemDB {
        constructor(name) {
            this.name = name;
        }
        createStore(name, db) {
            return new iMemStore(name, db);
        }
        close() {
            return (function ($return, $error) {
                return $return();
            }).$asyncbind(this, true);
        }
        open() {
            return (function ($return, $error) {
                return $return();
            }).$asyncbind(this, true);
        }
    }
    if (typeof module !== "undefined") {
        module.exports = iMemDB;
    }
    if (typeof window !== "undefined") {
        window.iMemDB = iMemDB;
    }
})();


}).call(this,require('_process'))
},{"./iMemStore":15,"_process":20}],15:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    let iStore = require("./iStore");
    class iMemStore extends iStore {
        constructor(name, db) {
            super(name, db);
        }
    }
    /*	async delete(key) {
			delete this[key];
		}
		async get(key) {
			this[key];
		}
		async put(object) {
			let me = this,
				keyProperty = me.db.keyProperty;
			return me.set(object[keyProperty],object);
		}
		async load(force) {
			;
		}
		async save(value,key) {
			return this.set(key,value);
		}
		async set(key,value) {
			this[key] = value;
		}
	*/
    iMemStore.prototype.delete = function (key) {
        return (function ($return, $error) {
            delete this[key];
            return $return(Promise.resolve());
        }).$asyncbind(this, true);
    };
    iMemStore.prototype.get = function (key) {
        return (function ($return, $error) {
            return $return(Promise.resolve(this[key]));
        }).$asyncbind(this, true);
    };
    iMemStore.prototype.put = function (object) {
        return (function ($return, $error) {
            let me = this, keyProperty = me.db.keyProperty;
            return $return(me.set(object[keyProperty], object));
        }).$asyncbind(this, true);
    };
    iMemStore.prototype.load = function (force) {
        return (function ($return, $error) {
            return $return(Promise.resolve());
        }).$asyncbind(this, true);
    };
    iMemStore.prototype.save = function (value, key) {
        return (function ($return, $error) {
            return $return(this.set(key, value));
        }).$asyncbind(this, true);
    };
    iMemStore.prototype.set = function (key, value) {
        return (function ($return, $error) {
            this[key] = value;
            return $return(Promise.resolve());
        }).$asyncbind(this, true);
    };
    if (typeof module !== "undefined") {
        module.exports = iMemStore;
    }
    if (typeof window !== "undefined") {
        window.iMemStore = iMemStore;
    }
})();


}).call(this,require('_process'))
},{"./iStore":16,"_process":20}],16:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    class iStore {
        constructor(name, db) {
            Object.defineProperty(this, "__metadata__", {
                value: {
                    name: name,
                    db: db,
                    scope: {}
                }
            });
        }
        addScope(value) {
            let me = this;
            if (value && typeof value === "object") {
                me.__metadata__.scope[value.constructor.name] = value.constructor;
                Object.keys(value).forEach((property) => {
                    me.addScope(value[property]);
                });
            }
        }
        db() {
            return this.__metadata__.db;
        }
        normalize(value, recursing) {
            let me = this, type = typeof value, result;
            if (value && type === "object") {
                let json = value.toJSON ? value.toJSON() : value;
                if (typeof json !== "object") {
                    json = value;
                }
                me.addScope(value);
                result = {};
                if (recursing && json[me.db.keyProperty]) {
                    result[me.db.keyProperty] = json[me.db.keyProperty];
                } else {
                    let keys = Object.keys(json);
                    if (json instanceof Date) {
                        result.time = json.getTime();
                    }
                    keys.forEach((key, i) => {
                        result[key] = me.normalize(json[key], true);
                    });
                }
            } else {
                result = value;
            }
            return result;
        }
        restore(json) {
            let me = this;
            if (json && typeof json === "object") {
                let key = json[me.db.keyProperty];
                if (typeof key === "string") {
                    let parts = key.split("@"), cls = me.__metadata__.scope[parts[0]];
                    if (!cls) {
                        try {
                            me.__metadata__.scope[parts[0]] = (cls = Function("return " + parts[0]));
                        } catch (e) {
                            Object.keys(json).forEach((property) => {
                                json[property] = me.restore(json[property]);
                            });
                            return json;
                        }
                        me.__metadata__.scope[parts[0]] = cls;
                    }
                    if (json instanceof cls) {
                        Object.keys(json).forEach((property) => {
                            json[property] = me.restore(json[property]);
                        });
                        return json;
                    }
                    let instance = Object.create(cls.prototype);
                    Object.keys(json).forEach((property) => {
                        instance[property] = me.restore(json[property]);
                    });
                    return instance;
                }
            }
            return json;
        }
    }
    if (typeof module !== "undefined") {
        module.exports = iStore;
    }
    if (typeof window !== "undefined") {
        window.iCache = iStore;
    }
})();


}).call(this,require('_process'))
},{"_process":20}],17:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    /*
 * https://github.com/Benvie
 * improvements 2015 by AnyWhichWay
 */
    function intersection(h) {
        var a = arguments.length;
        if (0 === a) 
            return [];
        if (1 === a) 
            return intersection(h, h);
        var e = 0, k = 0, l = 0, m = [], d = [], n = new Map(), b;
        do {
            var p = arguments[e], q = p.length, f = 1 << e;
            b = 0;
            if (!q) 
                return [];
            k |= f;
            do {
                var g = p[b], c = n.get(g);
                "undefined" === typeof c ? (l++, c = d.length, n.set(g, c), m[c] = g, d[c] = f) : (d[c] |= f);
            } while (++b < q);
        } while (++e < a);
        a = [];
        b = 0;
        do 
            d[b] === k && (a[a.length] = m[b]); while (++b < l);
        return a;
    }
    
    if (typeof module !== "undefined") {
        module.exports = intersection;
    }
    if (typeof window !== "undefined") {
        window.intersection = intersection;
    }
})();


}).call(this,require('_process'))
},{"_process":20}],18:[function(require,module,exports){
(function (process){
Function.prototype.$asyncbind=function anonymous(self,catcher /**/) { var resolver = this; if (catcher===true) { if (!Function.prototype.$asyncbind.EagerThenable) Function.prototype.$asyncbind.EagerThenable = function factory(tick){ var _tasks = [] ; if (!tick) { try { tick = process.nextTick ; } catch (ex) { tick = function(p) { setTimeout(p,0) } } } function _untask(){ for (var i=0; i<_tasks.length; i+=2) { var t = _tasks[i+1], r = _tasks[i] ; for (var j=0; j<t.length; j++) t[j].call(null,r) ; } _tasks = [] ; } function isThenable(obj) { return obj && (obj instanceof Object) && typeof obj.then==="function"; } function EagerThenable(resolver) { function done(inline){ var w ; if (_sync || phase<0 || (w = _thens[phase]).length===0) return ; _tasks.push(result,w) ; _thens = [[],[]] ; if (_tasks.length===2) inline?_untask():tick(_untask) ; } function resolveThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 0 ; result = x ; done(true) ; } function rejectThen(x){ if (phase>=0) return ; if (isThenable(x)) return x.then(resolveThen,rejectThen) ; phase = 1 ; result = x ; done(true) ; } function settler(resolver,rejecter){ _thens[0].push(resolver) ; _thens[1].push(rejecter) ; done() ; } function toString() { return "EagerThenable{"+{'-1':"pending",0:"resolved",1:"rejected"}[phase]+"}="+result.toString() ; } function guard() { try { resolver.call(null,resolveThen,rejectThen) ; } catch (ex) { rejectThen(ex) ; } } this.then = settler ; this.toString = toString ; var _thens = [[],[]], _sync = true, phase = -1, result ; guard() ; _sync = false ; done() ; } EagerThenable.resolve = function(v){ return isThenable(v) ? v : {then:function(resolve,reject){return resolve(v)}}; }; return EagerThenable ; }(); return new (Function.prototype.$asyncbind.EagerThenable)(boundThen); } if (catcher) { if (Function.prototype.$asyncbind.wrapAsyncStack) catcher = Function.prototype.$asyncbind.wrapAsyncStack(catcher); return then; } function then(result,error){ try { return result && (result instanceof Object) && typeof result.then==='function' ? result.then(then,catcher) : resolver.call(self,result,error||catcher); } catch (ex) { return (error||catcher)(ex); } } function boundThen(result,error) { return resolver.call(self,result,error); } boundThen.then = boundThen; return boundThen; };window.$error=window.$error||function(e){throw e};
(function () {
    "use strict";
    //soundex from https://gist.github.com/shawndumas/1262659
    function soundex(s) {
        var a = (s + "").toLowerCase().split(""), f = a.shift(), r = "", codes = {
            a: "",
            e: "",
            i: "",
            o: "",
            u: "",
            b: 1,
            f: 1,
            p: 1,
            v: 1,
            c: 2,
            g: 2,
            j: 2,
            k: 2,
            q: 2,
            s: 2,
            x: 2,
            z: 2,
            d: 3,
            t: 3,
            l: 4,
            m: 5,
            n: 5,
            r: 6
        };
        r = f + a.map(function (v) {
            return codes[v];
        }).filter(function (v, i, a) {
            return i === 0 ? v !== codes[f] : v !== a[i - 1];
        }).join("");
        return (r + "000").slice(0, 4).toUpperCase();
    }
    
    if (typeof module !== "undefined") {
        module.exports = soundex;
    }
    if (typeof window !== "undefined") {
        window.intersection = soundex;
    }
})();


}).call(this,require('_process'))
},{"_process":20}],19:[function(require,module,exports){
(function (global){
/*!
    localForage -- Offline Storage, Improved
    Version 1.4.2
    https://mozilla.github.io/localForage
    (c) 2013-2015 Mozilla, Apache License 2.0
*/
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.localforage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';
var immediate = _dereq_(2);

/* istanbul ignore next */
function INTERNAL() {}

var handlers = {};

var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];

module.exports = exports = Promise;

function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  var promise = new this.constructor(INTERNAL);
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    unwrap(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};
function QueueItem(promise, onFulfilled, onRejected) {
  this.promise = promise;
  if (typeof onFulfilled === 'function') {
    this.onFulfilled = onFulfilled;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof onRejected === 'function') {
    this.onRejected = onRejected;
    this.callRejected = this.otherCallRejected;
  }
}
QueueItem.prototype.callFulfilled = function (value) {
  handlers.resolve(this.promise, value);
};
QueueItem.prototype.otherCallFulfilled = function (value) {
  unwrap(this.promise, this.onFulfilled, value);
};
QueueItem.prototype.callRejected = function (value) {
  handlers.reject(this.promise, value);
};
QueueItem.prototype.otherCallRejected = function (value) {
  unwrap(this.promise, this.onRejected, value);
};

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      return handlers.reject(promise, e);
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, returnValue);
    }
  });
}

handlers.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return handlers.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    self.state = FULFILLED;
    self.outcome = value;
    var i = -1;
    var len = self.queue.length;
    while (++i < len) {
      self.queue[i].callFulfilled(value);
    }
  }
  return self;
};
handlers.reject = function (self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callRejected(error);
  }
  return self;
};

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && typeof obj === 'object' && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}

function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var called = false;
  function onError(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.reject(self, value);
  }

  function onSuccess(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError);
  }

  var result = tryCatch(tryToUnwrap);
  if (result.status === 'error') {
    onError(result.value);
  }
}

function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}

exports.resolve = resolve;
function resolve(value) {
  if (value instanceof this) {
    return value;
  }
  return handlers.resolve(new this(INTERNAL), value);
}

exports.reject = reject;
function reject(reason) {
  var promise = new this(INTERNAL);
  return handlers.reject(promise, reason);
}

exports.all = all;
function all(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var values = new Array(len);
  var resolved = 0;
  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
  function allResolver(value, i) {
    self.resolve(value).then(resolveFromAll, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
    function resolveFromAll(outValue) {
      values[i] = outValue;
      if (++resolved === len && !called) {
        called = true;
        handlers.resolve(promise, values);
      }
    }
  }
}

exports.race = race;
function race(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    resolver(iterable[i]);
  }
  return promise;
  function resolver(value) {
    self.resolve(value).then(function (response) {
      if (!called) {
        called = true;
        handlers.resolve(promise, response);
      }
    }, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
  }
}

},{"2":2}],2:[function(_dereq_,module,exports){
(function (global){
'use strict';
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}

var draining;
var queue = [];
//named nextTick for less confusing stack traces
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

module.exports = immediate;
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
if (typeof global.Promise !== 'function') {
  global.Promise = _dereq_(1);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"1":1}],4:[function(_dereq_,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getIDB() {
    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
    if (typeof indexedDB !== 'undefined') {
        return indexedDB;
    }
    if (typeof webkitIndexedDB !== 'undefined') {
        return webkitIndexedDB;
    }
    if (typeof mozIndexedDB !== 'undefined') {
        return mozIndexedDB;
    }
    if (typeof OIndexedDB !== 'undefined') {
        return OIndexedDB;
    }
    if (typeof msIndexedDB !== 'undefined') {
        return msIndexedDB;
    }
}

var idb = getIDB();

function isIndexedDBValid() {
    try {
        // Initialize IndexedDB; fall back to vendor-prefixed versions
        // if needed.
        if (!idb) {
            return false;
        }
        // We mimic PouchDB here; just UA test for Safari (which, as of
        // iOS 8/Yosemite, doesn't properly support IndexedDB).
        // IndexedDB support is broken and different from Blink's.
        // This is faster than the test case (and it's sync), so we just
        // do this. *SIGH*
        // http://bl.ocks.org/nolanlawson/raw/c83e9039edf2278047e9/
        //
        // We test for openDatabase because IE Mobile identifies itself
        // as Safari. Oh the lulz...
        if (typeof openDatabase !== 'undefined' && typeof navigator !== 'undefined' && navigator.userAgent && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
            return false;
        }

        return idb && typeof idb.open === 'function' &&
        // Some Samsung/HTC Android 4.0-4.3 devices
        // have older IndexedDB specs; if this isn't available
        // their IndexedDB is too old for us to use.
        // (Replaces the onupgradeneeded test.)
        typeof IDBKeyRange !== 'undefined';
    } catch (e) {
        return false;
    }
}

function isWebSQLValid() {
    return typeof openDatabase === 'function';
}

function isLocalStorageValid() {
    try {
        return typeof localStorage !== 'undefined' && 'setItem' in localStorage && localStorage.setItem;
    } catch (e) {
        return false;
    }
}

// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
function createBlob(parts, properties) {
    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
    parts = parts || [];
    properties = properties || {};
    try {
        return new Blob(parts, properties);
    } catch (e) {
        if (e.name !== 'TypeError') {
            throw e;
        }
        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
        var builder = new Builder();
        for (var i = 0; i < parts.length; i += 1) {
            builder.append(parts[i]);
        }
        return builder.getBlob(properties.type);
    }
}

// This is CommonJS because lie is an external dependency, so Rollup
// can just ignore it.
if (typeof Promise === 'undefined' && typeof _dereq_ !== 'undefined') {
    _dereq_(3);
}
var Promise$1 = Promise;

function executeCallback(promise, callback) {
    if (callback) {
        promise.then(function (result) {
            callback(null, result);
        }, function (error) {
            callback(error);
        });
    }
}

// Some code originally from async_storage.js in
// [Gaia](https://github.com/mozilla-b2g/gaia).

var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
var supportsBlobs;
var dbContexts;

// Transform a binary string to an array buffer, because otherwise
// weird stuff happens when you try to work with the binary string directly.
// It is known.
// From http://stackoverflow.com/questions/14967647/ (continues on next line)
// encode-decode-image-with-base64-breaks-image (2013-04-21)
function _binStringToArrayBuffer(bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
        arr[i] = bin.charCodeAt(i);
    }
    return buf;
}

//
// Blobs are not supported in all versions of IndexedDB, notably
// Chrome <37 and Android <5. In those versions, storing a blob will throw.
//
// Various other blob bugs exist in Chrome v37-42 (inclusive).
// Detecting them is expensive and confusing to users, and Chrome 37-42
// is at very low usage worldwide, so we do a hacky userAgent check instead.
//
// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
//
// Code borrowed from PouchDB. See:
// https://github.com/pouchdb/pouchdb/blob/9c25a23/src/adapters/idb/blobSupport.js
//
function _checkBlobSupportWithoutCaching(txn) {
    return new Promise$1(function (resolve) {
        var blob = createBlob(['']);
        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

        txn.onabort = function (e) {
            // If the transaction aborts now its due to not being able to
            // write to the database, likely due to the disk being full
            e.preventDefault();
            e.stopPropagation();
            resolve(false);
        };

        txn.oncomplete = function () {
            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
            var matchedEdge = navigator.userAgent.match(/Edge\//);
            // MS Edge pretends to be Chrome 42:
            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
        };
    })["catch"](function () {
        return false; // error, so assume unsupported
    });
}

function _checkBlobSupport(idb) {
    if (typeof supportsBlobs === 'boolean') {
        return Promise$1.resolve(supportsBlobs);
    }
    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
        supportsBlobs = value;
        return supportsBlobs;
    });
}

function _deferReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Create a deferred object representing the current database operation.
    var deferredOperation = {};

    deferredOperation.promise = new Promise$1(function (resolve) {
        deferredOperation.resolve = resolve;
    });

    // Enqueue the deferred operation.
    dbContext.deferredOperations.push(deferredOperation);

    // Chain its promise to the database readiness.
    if (!dbContext.dbReady) {
        dbContext.dbReady = deferredOperation.promise;
    } else {
        dbContext.dbReady = dbContext.dbReady.then(function () {
            return deferredOperation.promise;
        });
    }
}

function _advanceReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Resolve its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.resolve();
    }
}

function _getConnection(dbInfo, upgradeNeeded) {
    return new Promise$1(function (resolve, reject) {

        if (dbInfo.db) {
            if (upgradeNeeded) {
                _deferReadiness(dbInfo);
                dbInfo.db.close();
            } else {
                return resolve(dbInfo.db);
            }
        }

        var dbArgs = [dbInfo.name];

        if (upgradeNeeded) {
            dbArgs.push(dbInfo.version);
        }

        var openreq = idb.open.apply(idb, dbArgs);

        if (upgradeNeeded) {
            openreq.onupgradeneeded = function (e) {
                var db = openreq.result;
                try {
                    db.createObjectStore(dbInfo.storeName);
                    if (e.oldVersion <= 1) {
                        // Added when support for blob shims was added
                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                    }
                } catch (ex) {
                    if (ex.name === 'ConstraintError') {
                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                    } else {
                        throw ex;
                    }
                }
            };
        }

        openreq.onerror = function () {
            reject(openreq.error);
        };

        openreq.onsuccess = function () {
            resolve(openreq.result);
            _advanceReadiness(dbInfo);
        };
    });
}

function _getOriginalConnection(dbInfo) {
    return _getConnection(dbInfo, false);
}

function _getUpgradedConnection(dbInfo) {
    return _getConnection(dbInfo, true);
}

function _isUpgradeNeeded(dbInfo, defaultVersion) {
    if (!dbInfo.db) {
        return true;
    }

    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
    var isDowngrade = dbInfo.version < dbInfo.db.version;
    var isUpgrade = dbInfo.version > dbInfo.db.version;

    if (isDowngrade) {
        // If the version is not the default one
        // then warn for impossible downgrade.
        if (dbInfo.version !== defaultVersion) {
            console.warn('The database "' + dbInfo.name + '"' + ' can\'t be downgraded from version ' + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
        }
        // Align the versions to prevent errors.
        dbInfo.version = dbInfo.db.version;
    }

    if (isUpgrade || isNewStore) {
        // If the store is new then increment the version (if needed).
        // This will trigger an "upgradeneeded" event which is required
        // for creating a store.
        if (isNewStore) {
            var incVersion = dbInfo.db.version + 1;
            if (incVersion > dbInfo.version) {
                dbInfo.version = incVersion;
            }
        }

        return true;
    }

    return false;
}

// encode a blob for indexeddb engines that don't support blobs
function _encodeBlob(blob) {
    return new Promise$1(function (resolve, reject) {
        var reader = new FileReader();
        reader.onerror = reject;
        reader.onloadend = function (e) {
            var base64 = btoa(e.target.result || '');
            resolve({
                __local_forage_encoded_blob: true,
                data: base64,
                type: blob.type
            });
        };
        reader.readAsBinaryString(blob);
    });
}

// decode an encoded blob
function _decodeBlob(encodedBlob) {
    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
    return createBlob([arrayBuff], { type: encodedBlob.type });
}

// is this one of our fancy encoded blobs?
function _isEncodedBlob(value) {
    return value && value.__local_forage_encoded_blob;
}

// Specialize the default `ready()` function by making it dependent
// on the current database operations. Thus, the driver will be actually
// ready when it's been initialized (default) *and* there are no pending
// operations on the database (initiated by some other instances).
function _fullyReady(callback) {
    var self = this;

    var promise = self._initReady().then(function () {
        var dbContext = dbContexts[self._dbInfo.name];

        if (dbContext && dbContext.dbReady) {
            return dbContext.dbReady;
        }
    });

    promise.then(callback, callback);
    return promise;
}

// Open the IndexedDB database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    // Initialize a singleton container for all running localForages.
    if (!dbContexts) {
        dbContexts = {};
    }

    // Get the current context of the database;
    var dbContext = dbContexts[dbInfo.name];

    // ...or create a new context.
    if (!dbContext) {
        dbContext = {
            // Running localForages sharing a database.
            forages: [],
            // Shared database.
            db: null,
            // Database readiness (promise).
            dbReady: null,
            // Deferred operations on the database.
            deferredOperations: []
        };
        // Register the new context in the global container.
        dbContexts[dbInfo.name] = dbContext;
    }

    // Register itself as a running localForage in the current context.
    dbContext.forages.push(self);

    // Replace the default `ready()` function with the specialized one.
    if (!self._initReady) {
        self._initReady = self.ready;
        self.ready = _fullyReady;
    }

    // Create an array of initialization states of the related localForages.
    var initPromises = [];

    function ignoreErrors() {
        // Don't handle errors here,
        // just makes sure related localForages aren't pending.
        return Promise$1.resolve();
    }

    for (var j = 0; j < dbContext.forages.length; j++) {
        var forage = dbContext.forages[j];
        if (forage !== self) {
            // Don't wait for itself...
            initPromises.push(forage._initReady()["catch"](ignoreErrors));
        }
    }

    // Take a snapshot of the related localForages.
    var forages = dbContext.forages.slice(0);

    // Initialize the connection process only when
    // all the related localForages aren't pending.
    return Promise$1.all(initPromises).then(function () {
        dbInfo.db = dbContext.db;
        // Get the connection or open a new one without upgrade.
        return _getOriginalConnection(dbInfo);
    }).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        dbInfo.db = dbContext.db = db;
        self._dbInfo = dbInfo;
        // Share the final connection amongst related localForages.
        for (var k = 0; k < forages.length; k++) {
            var forage = forages[k];
            if (forage !== self) {
                // Self is already up-to-date.
                forage._dbInfo.db = dbInfo.db;
                forage._dbInfo.version = dbInfo.version;
            }
        }
    });
}

function getItem(key, callback) {
    var self = this;

    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);
            var req = store.get(key);

            req.onsuccess = function () {
                var value = req.result;
                if (value === undefined) {
                    value = null;
                }
                if (_isEncodedBlob(value)) {
                    value = _decodeBlob(value);
                }
                resolve(value);
            };

            req.onerror = function () {
                reject(req.error);
            };
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items stored in database.
function iterate(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

            var req = store.openCursor();
            var iterationNumber = 1;

            req.onsuccess = function () {
                var cursor = req.result;

                if (cursor) {
                    var value = cursor.value;
                    if (_isEncodedBlob(value)) {
                        value = _decodeBlob(value);
                    }
                    var result = iterator(value, cursor.key, iterationNumber++);

                    if (result !== void 0) {
                        resolve(result);
                    } else {
                        cursor["continue"]();
                    }
                } else {
                    resolve();
                }
            };

            req.onerror = function () {
                reject(req.error);
            };
        })["catch"](reject);
    });

    executeCallback(promise, callback);

    return promise;
}

function setItem(key, value, callback) {
    var self = this;

    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    var promise = new Promise$1(function (resolve, reject) {
        var dbInfo;
        self.ready().then(function () {
            dbInfo = self._dbInfo;
            if (value instanceof Blob) {
                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
                    if (blobSupport) {
                        return value;
                    }
                    return _encodeBlob(value);
                });
            }
            return value;
        }).then(function (value) {
            var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
            var store = transaction.objectStore(dbInfo.storeName);

            // The reason we don't _save_ null is because IE 10 does
            // not support saving the `null` type in IndexedDB. How
            // ironic, given the bug below!
            // See: https://github.com/mozilla/localForage/issues/161
            if (value === null) {
                value = undefined;
            }

            transaction.oncomplete = function () {
                // Cast to undefined so the value passed to
                // callback/promise is the same as what one would get out
                // of `getItem()` later. This leads to some weirdness
                // (setItem('foo', undefined) will return `null`), but
                // it's not my fault localStorage is our baseline and that
                // it's weird.
                if (value === undefined) {
                    value = null;
                }

                resolve(value);
            };
            transaction.onabort = transaction.onerror = function () {
                var err = req.error ? req.error : req.transaction.error;
                reject(err);
            };

            var req = store.put(value, key);
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function removeItem(key, callback) {
    var self = this;

    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
            var store = transaction.objectStore(dbInfo.storeName);

            // We use a Grunt task to make this safe for IE and some
            // versions of Android (including those used by Cordova).
            // Normally IE won't like `.delete()` and will insist on
            // using `['delete']()`, but we have a build step that
            // fixes this for us now.
            var req = store["delete"](key);
            transaction.oncomplete = function () {
                resolve();
            };

            transaction.onerror = function () {
                reject(req.error);
            };

            // The request will be also be aborted if we've exceeded our storage
            // space.
            transaction.onabort = function () {
                var err = req.error ? req.error : req.transaction.error;
                reject(err);
            };
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function clear(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
            var store = transaction.objectStore(dbInfo.storeName);
            var req = store.clear();

            transaction.oncomplete = function () {
                resolve();
            };

            transaction.onabort = transaction.onerror = function () {
                var err = req.error ? req.error : req.transaction.error;
                reject(err);
            };
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function length(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);
            var req = store.count();

            req.onsuccess = function () {
                resolve(req.result);
            };

            req.onerror = function () {
                reject(req.error);
            };
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function key(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        if (n < 0) {
            resolve(null);

            return;
        }

        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

            var advanced = false;
            var req = store.openCursor();
            req.onsuccess = function () {
                var cursor = req.result;
                if (!cursor) {
                    // this means there weren't enough keys
                    resolve(null);

                    return;
                }

                if (n === 0) {
                    // We have the first key, return it if that's what they
                    // wanted.
                    resolve(cursor.key);
                } else {
                    if (!advanced) {
                        // Otherwise, ask the cursor to skip ahead n
                        // records.
                        advanced = true;
                        cursor.advance(n);
                    } else {
                        // When we get here, we've got the nth key.
                        resolve(cursor.key);
                    }
                }
            };

            req.onerror = function () {
                reject(req.error);
            };
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

            var req = store.openCursor();
            var keys = [];

            req.onsuccess = function () {
                var cursor = req.result;

                if (!cursor) {
                    resolve(keys);
                    return;
                }

                keys.push(cursor.key);
                cursor["continue"]();
            };

            req.onerror = function () {
                reject(req.error);
            };
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

var asyncStorage = {
    _driver: 'asyncStorage',
    _initStorage: _initStorage,
    iterate: iterate,
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem,
    clear: clear,
    length: length,
    key: key,
    keys: keys
};

// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
// it to Base64, so this is how we store it to prevent very strange errors with less
// verbose ways of binary <-> string data storage.
var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

var BLOB_TYPE_PREFIX = '~~local_forage_type~';
var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

var SERIALIZED_MARKER = '__lfsc__:';
var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

// OMG the serializations!
var TYPE_ARRAYBUFFER = 'arbf';
var TYPE_BLOB = 'blob';
var TYPE_INT8ARRAY = 'si08';
var TYPE_UINT8ARRAY = 'ui08';
var TYPE_UINT8CLAMPEDARRAY = 'uic8';
var TYPE_INT16ARRAY = 'si16';
var TYPE_INT32ARRAY = 'si32';
var TYPE_UINT16ARRAY = 'ur16';
var TYPE_UINT32ARRAY = 'ui32';
var TYPE_FLOAT32ARRAY = 'fl32';
var TYPE_FLOAT64ARRAY = 'fl64';
var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

function stringToBuffer(serializedString) {
    // Fill the string into a ArrayBuffer.
    var bufferLength = serializedString.length * 0.75;
    var len = serializedString.length;
    var i;
    var p = 0;
    var encoded1, encoded2, encoded3, encoded4;

    if (serializedString[serializedString.length - 1] === '=') {
        bufferLength--;
        if (serializedString[serializedString.length - 2] === '=') {
            bufferLength--;
        }
    }

    var buffer = new ArrayBuffer(bufferLength);
    var bytes = new Uint8Array(buffer);

    for (i = 0; i < len; i += 4) {
        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

        /*jslint bitwise: true */
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return buffer;
}

// Converts a buffer to a string to store, serialized, in the backend
// storage library.
function bufferToString(buffer) {
    // base64-arraybuffer
    var bytes = new Uint8Array(buffer);
    var base64String = '';
    var i;

    for (i = 0; i < bytes.length; i += 3) {
        /*jslint bitwise: true */
        base64String += BASE_CHARS[bytes[i] >> 2];
        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
        base64String += BASE_CHARS[bytes[i + 2] & 63];
    }

    if (bytes.length % 3 === 2) {
        base64String = base64String.substring(0, base64String.length - 1) + '=';
    } else if (bytes.length % 3 === 1) {
        base64String = base64String.substring(0, base64String.length - 2) + '==';
    }

    return base64String;
}

// Serialize a value, afterwards executing a callback (which usually
// instructs the `setItem()` callback/promise to be executed). This is how
// we store binary data with localStorage.
function serialize(value, callback) {
    var valueString = '';
    if (value) {
        valueString = value.toString();
    }

    // Cannot use `value instanceof ArrayBuffer` or such here, as these
    // checks fail when running the tests using casper.js...
    //
    // TODO: See why those tests fail and use a better solution.
    if (value && (value.toString() === '[object ArrayBuffer]' || value.buffer && value.buffer.toString() === '[object ArrayBuffer]')) {
        // Convert binary arrays to a string and prefix the string with
        // a special marker.
        var buffer;
        var marker = SERIALIZED_MARKER;

        if (value instanceof ArrayBuffer) {
            buffer = value;
            marker += TYPE_ARRAYBUFFER;
        } else {
            buffer = value.buffer;

            if (valueString === '[object Int8Array]') {
                marker += TYPE_INT8ARRAY;
            } else if (valueString === '[object Uint8Array]') {
                marker += TYPE_UINT8ARRAY;
            } else if (valueString === '[object Uint8ClampedArray]') {
                marker += TYPE_UINT8CLAMPEDARRAY;
            } else if (valueString === '[object Int16Array]') {
                marker += TYPE_INT16ARRAY;
            } else if (valueString === '[object Uint16Array]') {
                marker += TYPE_UINT16ARRAY;
            } else if (valueString === '[object Int32Array]') {
                marker += TYPE_INT32ARRAY;
            } else if (valueString === '[object Uint32Array]') {
                marker += TYPE_UINT32ARRAY;
            } else if (valueString === '[object Float32Array]') {
                marker += TYPE_FLOAT32ARRAY;
            } else if (valueString === '[object Float64Array]') {
                marker += TYPE_FLOAT64ARRAY;
            } else {
                callback(new Error('Failed to get type for BinaryArray'));
            }
        }

        callback(marker + bufferToString(buffer));
    } else if (valueString === '[object Blob]') {
        // Conver the blob to a binaryArray and then to a string.
        var fileReader = new FileReader();

        fileReader.onload = function () {
            // Backwards-compatible prefix for the blob type.
            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
        };

        fileReader.readAsArrayBuffer(value);
    } else {
        try {
            callback(JSON.stringify(value));
        } catch (e) {
            console.error("Couldn't convert value into a JSON string: ", value);

            callback(null, e);
        }
    }
}

// Deserialize data we've inserted into a value column/field. We place
// special markers into our strings to mark them as encoded; this isn't
// as nice as a meta field, but it's the only sane thing we can do whilst
// keeping localStorage support intact.
//
// Oftentimes this will just deserialize JSON content, but if we have a
// special marker (SERIALIZED_MARKER, defined above), we will extract
// some kind of arraybuffer/binary data/typed array out of the string.
function deserialize(value) {
    // If we haven't marked this string as being specially serialized (i.e.
    // something other than serialized JSON), we can just return it and be
    // done with it.
    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
        return JSON.parse(value);
    }

    // The following code deals with deserializing some kind of Blob or
    // TypedArray. First we separate out the type of data we're dealing
    // with from the data itself.
    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

    var blobType;
    // Backwards-compatible blob type serialization strategy.
    // DBs created with older versions of localForage will simply not have the blob type.
    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
        blobType = matcher[1];
        serializedString = serializedString.substring(matcher[0].length);
    }
    var buffer = stringToBuffer(serializedString);

    // Return the right type based on the code/type set during
    // serialization.
    switch (type) {
        case TYPE_ARRAYBUFFER:
            return buffer;
        case TYPE_BLOB:
            return createBlob([buffer], { type: blobType });
        case TYPE_INT8ARRAY:
            return new Int8Array(buffer);
        case TYPE_UINT8ARRAY:
            return new Uint8Array(buffer);
        case TYPE_UINT8CLAMPEDARRAY:
            return new Uint8ClampedArray(buffer);
        case TYPE_INT16ARRAY:
            return new Int16Array(buffer);
        case TYPE_UINT16ARRAY:
            return new Uint16Array(buffer);
        case TYPE_INT32ARRAY:
            return new Int32Array(buffer);
        case TYPE_UINT32ARRAY:
            return new Uint32Array(buffer);
        case TYPE_FLOAT32ARRAY:
            return new Float32Array(buffer);
        case TYPE_FLOAT64ARRAY:
            return new Float64Array(buffer);
        default:
            throw new Error('Unkown type: ' + type);
    }
}

var localforageSerializer = {
    serialize: serialize,
    deserialize: deserialize,
    stringToBuffer: stringToBuffer,
    bufferToString: bufferToString
};

/*
 * Includes code from:
 *
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
// Open the WebSQL database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage$1(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
        }
    }

    var dbInfoPromise = new Promise$1(function (resolve, reject) {
        // Open the database; the openDatabase API will automatically
        // create it for us if it doesn't exist.
        try {
            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
        } catch (e) {
            return reject(e);
        }

        // Create our key/value table if it doesn't exist.
        dbInfo.db.transaction(function (t) {
            t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' (id INTEGER PRIMARY KEY, key unique, value)', [], function () {
                self._dbInfo = dbInfo;
                resolve();
            }, function (t, error) {
                reject(error);
            });
        });
    });

    dbInfo.serializer = localforageSerializer;
    return dbInfoPromise;
}

function getItem$1(key, callback) {
    var self = this;

    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                t.executeSql('SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).value : null;

                    // Check to see if this is serialized content we need to
                    // unpack.
                    if (result) {
                        result = dbInfo.serializer.deserialize(result);
                    }

                    resolve(result);
                }, function (t, error) {

                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function iterate$1(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;

            dbInfo.db.transaction(function (t) {
                t.executeSql('SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
                    var rows = results.rows;
                    var length = rows.length;

                    for (var i = 0; i < length; i++) {
                        var item = rows.item(i);
                        var result = item.value;

                        // Check to see if this is serialized content
                        // we need to unpack.
                        if (result) {
                            result = dbInfo.serializer.deserialize(result);
                        }

                        result = iterator(result, item.key, i + 1);

                        // void(0) prevents problems with redefinition
                        // of `undefined`.
                        if (result !== void 0) {
                            resolve(result);
                            return;
                        }
                    }

                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function setItem$1(key, value, callback) {
    var self = this;

    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            // The localStorage API doesn't return undefined values in an
            // "expected" way, so undefined is always cast to null in all
            // drivers. See: https://github.com/mozilla/localForage/pull/42
            if (value === undefined) {
                value = null;
            }

            // Save the original value to pass to the callback.
            var originalValue = value;

            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    dbInfo.db.transaction(function (t) {
                        t.executeSql('INSERT OR REPLACE INTO ' + dbInfo.storeName + ' (key, value) VALUES (?, ?)', [key, value], function () {
                            resolve(originalValue);
                        }, function (t, error) {
                            reject(error);
                        });
                    }, function (sqlError) {
                        // The transaction failed; check
                        // to see if it's a quota error.
                        if (sqlError.code === sqlError.QUOTA_ERR) {
                            // We reject the callback outright for now, but
                            // it's worth trying to re-run the transaction.
                            // Even if the user accepts the prompt to use
                            // more storage on Safari, this error will
                            // be called.
                            //
                            // TODO: Try to re-run the transaction.
                            reject(sqlError);
                        }
                    });
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function removeItem$1(key, callback) {
    var self = this;

    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                t.executeSql('DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
                    resolve();
                }, function (t, error) {

                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Deletes every item in the table.
// TODO: Find out if this resets the AUTO_INCREMENT number.
function clear$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                t.executeSql('DELETE FROM ' + dbInfo.storeName, [], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Does a simple `COUNT(key)` to get the number of items stored in
// localForage.
function length$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                // Ahhh, SQL makes this one soooooo easy.
                t.executeSql('SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
                    var result = results.rows.item(0).c;

                    resolve(result);
                }, function (t, error) {

                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Return the key located at key index X; essentially gets the key from a
// `WHERE id = ?`. This is the most efficient way I can think to implement
// this rarely-used (in my experience) part of the API, but it can seem
// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
// the ID of each key will change every time it's updated. Perhaps a stored
// procedure for the `setItem()` SQL would solve this problem?
// TODO: Don't change ID on `setItem()`.
function key$1(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                t.executeSql('SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).key : null;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                t.executeSql('SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
                    var keys = [];

                    for (var i = 0; i < results.rows.length; i++) {
                        keys.push(results.rows.item(i).key);
                    }

                    resolve(keys);
                }, function (t, error) {

                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

var webSQLStorage = {
    _driver: 'webSQLStorage',
    _initStorage: _initStorage$1,
    iterate: iterate$1,
    getItem: getItem$1,
    setItem: setItem$1,
    removeItem: removeItem$1,
    clear: clear$1,
    length: length$1,
    key: key$1,
    keys: keys$1
};

// Config the localStorage backend, using options set in the config.
function _initStorage$2(options) {
    var self = this;
    var dbInfo = {};
    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    dbInfo.keyPrefix = dbInfo.name + '/';

    if (dbInfo.storeName !== self._defaultConfig.storeName) {
        dbInfo.keyPrefix += dbInfo.storeName + '/';
    }

    self._dbInfo = dbInfo;
    dbInfo.serializer = localforageSerializer;

    return Promise$1.resolve();
}

// Remove all keys from the datastore, effectively destroying all data in
// the app's key/value store!
function clear$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var keyPrefix = self._dbInfo.keyPrefix;

        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);

            if (key.indexOf(keyPrefix) === 0) {
                localStorage.removeItem(key);
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Retrieve an item from the store. Unlike the original async_storage
// library in Gaia, we don't modify return values at all. If a key's value
// is `undefined`, we pass that value to the callback function.
function getItem$2(key, callback) {
    var self = this;

    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result = localStorage.getItem(dbInfo.keyPrefix + key);

        // If a result was found, parse it from the serialized
        // string into a JS object. If result isn't truthy, the key
        // is likely undefined and we'll pass it straight to the
        // callback.
        if (result) {
            result = dbInfo.serializer.deserialize(result);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items in the store.
function iterate$2(iterator, callback) {
    var self = this;

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var keyPrefix = dbInfo.keyPrefix;
        var keyPrefixLength = keyPrefix.length;
        var length = localStorage.length;

        // We use a dedicated iterator instead of the `i` variable below
        // so other keys we fetch in localStorage aren't counted in
        // the `iterationNumber` argument passed to the `iterate()`
        // callback.
        //
        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
        var iterationNumber = 1;

        for (var i = 0; i < length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf(keyPrefix) !== 0) {
                continue;
            }
            var value = localStorage.getItem(key);

            // If a result was found, parse it from the serialized
            // string into a JS object. If result isn't truthy, the
            // key is likely undefined and we'll pass it straight
            // to the iterator.
            if (value) {
                value = dbInfo.serializer.deserialize(value);
            }

            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

            if (value !== void 0) {
                return value;
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Same as localStorage's key() method, except takes a callback.
function key$2(n, callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result;
        try {
            result = localStorage.key(n);
        } catch (error) {
            result = null;
        }

        // Remove the prefix from the key, if a key is found.
        if (result) {
            result = result.substring(dbInfo.keyPrefix.length);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var length = localStorage.length;
        var keys = [];

        for (var i = 0; i < length; i++) {
            if (localStorage.key(i).indexOf(dbInfo.keyPrefix) === 0) {
                keys.push(localStorage.key(i).substring(dbInfo.keyPrefix.length));
            }
        }

        return keys;
    });

    executeCallback(promise, callback);
    return promise;
}

// Supply the number of keys in the datastore to the callback function.
function length$2(callback) {
    var self = this;
    var promise = self.keys().then(function (keys) {
        return keys.length;
    });

    executeCallback(promise, callback);
    return promise;
}

// Remove an item from the store, nice and simple.
function removeItem$2(key, callback) {
    var self = this;

    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        localStorage.removeItem(dbInfo.keyPrefix + key);
    });

    executeCallback(promise, callback);
    return promise;
}

// Set a key's value and run an optional callback once the value is set.
// Unlike Gaia's implementation, the callback function is passed the value,
// in case you want to operate on that value only after you're sure it
// saved, or something like that.
function setItem$2(key, value, callback) {
    var self = this;

    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    var promise = self.ready().then(function () {
        // Convert undefined values to null.
        // https://github.com/mozilla/localForage/pull/42
        if (value === undefined) {
            value = null;
        }

        // Save the original value to pass to the callback.
        var originalValue = value;

        return new Promise$1(function (resolve, reject) {
            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    try {
                        localStorage.setItem(dbInfo.keyPrefix + key, value);
                        resolve(originalValue);
                    } catch (e) {
                        // localStorage capacity exceeded.
                        // TODO: Make this a specific error/event.
                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                            reject(e);
                        }
                        reject(e);
                    }
                }
            });
        });
    });

    executeCallback(promise, callback);
    return promise;
}

var localStorageWrapper = {
    _driver: 'localStorageWrapper',
    _initStorage: _initStorage$2,
    // Default API, from Gaia/localStorage.
    iterate: iterate$2,
    getItem: getItem$2,
    setItem: setItem$2,
    removeItem: removeItem$2,
    clear: clear$2,
    length: length$2,
    key: key$2,
    keys: keys$2
};

function executeTwoCallbacks(promise, callback, errorCallback) {
    if (typeof callback === 'function') {
        promise.then(callback);
    }

    if (typeof errorCallback === 'function') {
        promise["catch"](errorCallback);
    }
}

// Custom drivers are stored here when `defineDriver()` is called.
// They are shared across all instances of localForage.
var CustomDrivers = {};

var DriverType = {
    INDEXEDDB: 'asyncStorage',
    LOCALSTORAGE: 'localStorageWrapper',
    WEBSQL: 'webSQLStorage'
};

var DefaultDriverOrder = [DriverType.INDEXEDDB, DriverType.WEBSQL, DriverType.LOCALSTORAGE];

var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'];

var DefaultConfig = {
    description: '',
    driver: DefaultDriverOrder.slice(),
    name: 'localforage',
    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
    // we can use without a prompt.
    size: 4980736,
    storeName: 'keyvaluepairs',
    version: 1.0
};

var driverSupport = {};
// Check to see if IndexedDB is available and if it is the latest
// implementation; it's our preferred backend library. We use "_spec_test"
// as the name of the database because it's not the one we'll operate on,
// but it's useful to make sure its using the right spec.
// See: https://github.com/mozilla/localForage/issues/128
driverSupport[DriverType.INDEXEDDB] = isIndexedDBValid();

driverSupport[DriverType.WEBSQL] = isWebSQLValid();

driverSupport[DriverType.LOCALSTORAGE] = isLocalStorageValid();

var isArray = Array.isArray || function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

function callWhenReady(localForageInstance, libraryMethod) {
    localForageInstance[libraryMethod] = function () {
        var _args = arguments;
        return localForageInstance.ready().then(function () {
            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
        });
    };
}

function extend() {
    for (var i = 1; i < arguments.length; i++) {
        var arg = arguments[i];

        if (arg) {
            for (var key in arg) {
                if (arg.hasOwnProperty(key)) {
                    if (isArray(arg[key])) {
                        arguments[0][key] = arg[key].slice();
                    } else {
                        arguments[0][key] = arg[key];
                    }
                }
            }
        }
    }

    return arguments[0];
}

function isLibraryDriver(driverName) {
    for (var driver in DriverType) {
        if (DriverType.hasOwnProperty(driver) && DriverType[driver] === driverName) {
            return true;
        }
    }

    return false;
}

var LocalForage = function () {
    function LocalForage(options) {
        _classCallCheck(this, LocalForage);

        this.INDEXEDDB = DriverType.INDEXEDDB;
        this.LOCALSTORAGE = DriverType.LOCALSTORAGE;
        this.WEBSQL = DriverType.WEBSQL;

        this._defaultConfig = extend({}, DefaultConfig);
        this._config = extend({}, this._defaultConfig, options);
        this._driverSet = null;
        this._initDriver = null;
        this._ready = false;
        this._dbInfo = null;

        this._wrapLibraryMethodsWithReady();
        this.setDriver(this._config.driver);
    }

    // Set any config values for localForage; can be called anytime before
    // the first API call (e.g. `getItem`, `setItem`).
    // We loop through options so we don't overwrite existing config
    // values.


    LocalForage.prototype.config = function config(options) {
        // If the options argument is an object, we use it to set values.
        // Otherwise, we return either a specified config value or all
        // config values.
        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
            // If localforage is ready and fully initialized, we can't set
            // any new configuration values. Instead, we return an error.
            if (this._ready) {
                return new Error("Can't call config() after localforage " + 'has been used.');
            }

            for (var i in options) {
                if (i === 'storeName') {
                    options[i] = options[i].replace(/\W/g, '_');
                }

                this._config[i] = options[i];
            }

            // after all config options are set and
            // the driver option is used, try setting it
            if ('driver' in options && options.driver) {
                this.setDriver(this._config.driver);
            }

            return true;
        } else if (typeof options === 'string') {
            return this._config[options];
        } else {
            return this._config;
        }
    };

    // Used to define a custom driver, shared across all instances of
    // localForage.


    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
        var promise = new Promise$1(function (resolve, reject) {
            try {
                var driverName = driverObject._driver;
                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');
                var namingError = new Error('Custom driver name already in use: ' + driverObject._driver);

                // A driver name should be defined and not overlap with the
                // library-defined, default drivers.
                if (!driverObject._driver) {
                    reject(complianceError);
                    return;
                }
                if (isLibraryDriver(driverObject._driver)) {
                    reject(namingError);
                    return;
                }

                var customDriverMethods = LibraryMethods.concat('_initStorage');
                for (var i = 0; i < customDriverMethods.length; i++) {
                    var customDriverMethod = customDriverMethods[i];
                    if (!customDriverMethod || !driverObject[customDriverMethod] || typeof driverObject[customDriverMethod] !== 'function') {
                        reject(complianceError);
                        return;
                    }
                }

                var supportPromise = Promise$1.resolve(true);
                if ('_support' in driverObject) {
                    if (driverObject._support && typeof driverObject._support === 'function') {
                        supportPromise = driverObject._support();
                    } else {
                        supportPromise = Promise$1.resolve(!!driverObject._support);
                    }
                }

                supportPromise.then(function (supportResult) {
                    driverSupport[driverName] = supportResult;
                    CustomDrivers[driverName] = driverObject;
                    resolve();
                }, reject);
            } catch (e) {
                reject(e);
            }
        });

        executeTwoCallbacks(promise, callback, errorCallback);
        return promise;
    };

    LocalForage.prototype.driver = function driver() {
        return this._driver || null;
    };

    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
        var self = this;
        var getDriverPromise = Promise$1.resolve().then(function () {
            if (isLibraryDriver(driverName)) {
                switch (driverName) {
                    case self.INDEXEDDB:
                        return asyncStorage;
                    case self.LOCALSTORAGE:
                        return localStorageWrapper;
                    case self.WEBSQL:
                        return webSQLStorage;
                }
            } else if (CustomDrivers[driverName]) {
                return CustomDrivers[driverName];
            } else {
                throw new Error('Driver not found.');
            }
        });
        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
        return getDriverPromise;
    };

    LocalForage.prototype.getSerializer = function getSerializer(callback) {
        var serializerPromise = Promise$1.resolve(localforageSerializer);
        executeTwoCallbacks(serializerPromise, callback);
        return serializerPromise;
    };

    LocalForage.prototype.ready = function ready(callback) {
        var self = this;

        var promise = self._driverSet.then(function () {
            if (self._ready === null) {
                self._ready = self._initDriver();
            }

            return self._ready;
        });

        executeTwoCallbacks(promise, callback, callback);
        return promise;
    };

    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
        var self = this;

        if (!isArray(drivers)) {
            drivers = [drivers];
        }

        var supportedDrivers = this._getSupportedDrivers(drivers);

        function setDriverToConfig() {
            self._config.driver = self.driver();
        }

        function initDriver(supportedDrivers) {
            return function () {
                var currentDriverIndex = 0;

                function driverPromiseLoop() {
                    while (currentDriverIndex < supportedDrivers.length) {
                        var driverName = supportedDrivers[currentDriverIndex];
                        currentDriverIndex++;

                        self._dbInfo = null;
                        self._ready = null;

                        return self.getDriver(driverName).then(function (driver) {
                            self._extend(driver);
                            setDriverToConfig();

                            self._ready = self._initStorage(self._config);
                            return self._ready;
                        })["catch"](driverPromiseLoop);
                    }

                    setDriverToConfig();
                    var error = new Error('No available storage method found.');
                    self._driverSet = Promise$1.reject(error);
                    return self._driverSet;
                }

                return driverPromiseLoop();
            };
        }

        // There might be a driver initialization in progress
        // so wait for it to finish in order to avoid a possible
        // race condition to set _dbInfo
        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
            return Promise$1.resolve();
        }) : Promise$1.resolve();

        this._driverSet = oldDriverSetDone.then(function () {
            var driverName = supportedDrivers[0];
            self._dbInfo = null;
            self._ready = null;

            return self.getDriver(driverName).then(function (driver) {
                self._driver = driver._driver;
                setDriverToConfig();
                self._wrapLibraryMethodsWithReady();
                self._initDriver = initDriver(supportedDrivers);
            });
        })["catch"](function () {
            setDriverToConfig();
            var error = new Error('No available storage method found.');
            self._driverSet = Promise$1.reject(error);
            return self._driverSet;
        });

        executeTwoCallbacks(this._driverSet, callback, errorCallback);
        return this._driverSet;
    };

    LocalForage.prototype.supports = function supports(driverName) {
        return !!driverSupport[driverName];
    };

    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
        extend(this, libraryMethodsAndProperties);
    };

    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
        var supportedDrivers = [];
        for (var i = 0, len = drivers.length; i < len; i++) {
            var driverName = drivers[i];
            if (this.supports(driverName)) {
                supportedDrivers.push(driverName);
            }
        }
        return supportedDrivers;
    };

    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
        // Add a stub for each driver API method that delays the call to the
        // corresponding driver method until localForage is ready. These stubs
        // will be replaced by the driver methods as soon as the driver is
        // loaded, so there is no performance impact.
        for (var i = 0; i < LibraryMethods.length; i++) {
            callWhenReady(this, LibraryMethods[i]);
        }
    };

    LocalForage.prototype.createInstance = function createInstance(options) {
        return new LocalForage(options);
    };

    return LocalForage;
}();

// The actual localForage object that we expose as a module or via a
// global. It's extended by pulling in one of our other libraries.


var localforage_js = new LocalForage();

module.exports = localforage_js;

},{"3":3}]},{},[4])(4)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
