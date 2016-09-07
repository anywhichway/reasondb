let CXProduct = require("./CXProductLite"),
	Cursor = require("./Cursor"),
	Index = require("./Index");

class Database {
	constructor() {
		this.Pattern = class Pattern {
			constructor(config) {
				let me = this;
				Object.keys(config).forEach((key) => {
					me[key] = config[key];
				});
				Pattern.index.put(me);
				Object.defineProperty(me,"matches",{configurable:true,writable:true,value:[]});
				Object.defineProperty(me,"then",{configurable:true,writable:true,value:null});
			}
		}
		this.Pattern.index = new Index(this.Pattern,this);
		this.Entity = class Entity {
			constructor(config,index) {
				let me = this;
				if(config && typeof(config)==="object") {
					Object.keys(config).forEach((key) => {
						me[key] = config[key];	
					});
				}
				if(index) {
					Entity.index.put(me);
				}
				return me;
			}
		}
		this.Entity.index = new Index(this.Entity,this);
		this.patterns = {};
	}
	select(projection) {
		var db = this;
		return {
			from(classVars) {
				return {
					when(whenPattern) {
						let pattern = new db.Pattern(whenPattern);
						return {
							then(f) {
								pattern.then = f;
								Object.keys(pattern).forEach((classVar) => {
									if(classVar[0]!=="$") { return; }
									let cls = classVars[classVar];
									if(!db.patterns[cls.name]) { db.patterns[cls.name] = {}; }
									Object.keys(pattern[classVar]).forEach((property) => {
										if(!db.patterns[cls.name][property]) { db.patterns[cls.name][property] = {}; }
										Object.keys(pattern[classVar][property]).forEach((test) => {
											if(test[0]!=="$") { return; }
											if(!db.patterns[cls.name][property][test]) { db.patterns[cls.name][property][test] = {}; }
											let value = pattern[classVar][property][test],
												type = typeof(value);
											if(!db.patterns[cls.name][property][test][type]) { db.patterns[cls.name][property][test][type] = {}; }
											if(!db.patterns[cls.name][property][test][type][value]) { db.patterns[cls.name][property][test][type][value] = {}; }
											if(!db.patterns[cls.name][property][test][type][value][pattern.id]) { db.patterns[cls.name][property][test][type][value][pattern.id] = {}; }
											if(!db.patterns[cls.name][property][test][type][value][pattern.id][classVar]) { db.patterns[cls.name][property][test][type][value][pattern.id][classVar] = {}; }
											if(pattern.matches.indexOf(db.patterns[cls.name][property][test][type][value][pattern.id])===-1) {
												pattern.matches.push(db.patterns[cls.name][property][test][type][value][pattern.id]);
											}
										});
									});
								});
							}
						}
					},
					where(pattern) {
						return {
							then(f) {
								let matches = {};
								if(Object.keys(pattern).every((classVar) => {
									let cls = classVars[classVar];
									matches[classVar] = cls.index.match(pattern[classVar],classVars,matches);
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
									f([]);
								}
							}
						}
					}
				}
			}
		}
	}
}

module.exports = Database;