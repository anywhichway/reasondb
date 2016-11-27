var chai,
	expect,
	ReasonDB,
	IronCacheClient,
	RedisClient,
	MemJSClient,
	LevelUPClient;
if(typeof(window)==="undefined") {
	chai = require("chai");
	expect = chai.expect;
	//Promise = require("bluebird");
	//Promise.longStackTraces();
	ReasonDB = require("../src/index.js");
	let levelup = require("levelup");
	LevelUPClient = levelup; //("./examples/basic/db");
}

function decaf() {
	describe = function describe(name,group) {
		console.log(name);
		group.call({timeout:()=>{}});
	};
	it = function it(name,test) {
		function done() {
			done.passed = true;
		}
		try {
			test.call({timeout:()=>{}},done);
		} catch(e) {
			console.log(name,e);
		}
		setTimeout(() => { console.log((done.passed ? "Passed" : "Failed"),name); },2000)
	};
}

let store = ReasonDB.MemStore, // ReasonDB.MemStore,ReasonDB.LocalStore,ReasonDB.LocalForageStore,ReasonDB.IronCacheStore,ReasonDB.RedisStore,ReasonDB.MemcachedStore,ReasonDB.JSONBlockStore;
	clear = true,
	activate = true;

if(store===ReasonDB.LocalForageStore || typeof(window)==="undefined") {
	decaf(); // localForage fails when using mocha and mocha fails when run in server mode!
}
	

let db = new ReasonDB("./test/db","@key",store,clear,activate,{saveIndexAsync:true,ironCacheClient:IronCacheClient,redisClient:RedisClient,memcachedClient:MemJSClient,levelUPClient:LevelUPClient}),
	i = Object.index,
		promises = [],
		resolver,
		promise = new Promise((resolve,reject) => {
			resolver = resolve;
		}),
		o1 = {name: "Joe", age:function() { return 24; }, birthday: new Date("01/15/90"), ssn:999999999, address: {city: "Seattle", zipcode: {base: 98101, plus4:1234}}},
		p1= {name:"Mary",age:21,children:[1,2,3],};
	if(clear) {
		["Array","Date","Object","Pattern"].forEach((name) => {
			if(store==ReasonDB.RedisStore) {
				RedisClient.hkeys(name,(err, values) => {
					if (err) {
						console.log("cleared err ",name,err,value)
					} else {
						if(values.length===0) {
							console.log("cleared empty ",name,err,values)
						} else {
							let multi = RedisClient.multi();
							values.forEach((id) => {
								multi = multi.hdel(name, id, function(err, res) {
									;
								})
							});
							multi.exec((err,replies) => {
								console.log("cleared ",name,err,values)
							});
						}
					}
				})
			}
		});
		let a1 = {city:"Seattle",zipcode:{base:98101,plus4:1234}},
			p2 = {wife:p1,name:"Joe",age:24,address:a1},
			p3 = {name:"Mary",birthday:new Date(1962,0,15)},
			activity = new ReasonDB.Activity(resolver);
		activity.step(() => i.put(o1));
		activity.step(() => i.put(p2));
		activity.step(() => i.put(p1));
		activity.step(() => i.put(p3));
		activity.step(resolver);
		activity.exec();
	} else {
		resolver();
	}

promise.then((results) => {
	describe("test", function() {
		describe("matches", function() {
			it('{birthday: {month:0}}', function(done) {
				i.match({birthday: {month:0}}).then((results) => {
					i.instances(results).then((results) => {
						//console.log('{birthday: {month:0}}',JSON.stringify(results));
						expect(results.length).to.equal(2);
						expect(results[0].birthday.month).to.equal(0);
						done();
					});
				});
			});
			it('{name: "Joe"}',function(done) {
				i.match({name: "Joe"}).then((results) => {
					i.instances(results).then((results) => {
						//console.log('{name: "Joe"}',JSON.stringify(results));
						expect(results.length).to.equal(2);
						expect(results[0].name).to.equal("Joe");
						done();
					});
				});
			});
			it('{name: {$eq: "Joe"}}',function(done) {
				i.match({name: {$eq: "Joe"}}).then((results) => {
					i.instances(results).then((results) => {
						//console.log('{name: {$eq: "Joe"}}',results);
						expect(results.length).to.equal(2);
						expect(results[0].name).to.equal("Joe");
						done();
					});
				});
			});
			it('{name: {$eq: "Joe"}, address: {city: "Seattle", zipcode: {base: 98101}}}',function(done) {
				i.match({name: {$eq: "Joe"}, address: {city: "Seattle", zipcode: {base: 98101}}}).then((results) => {
					i.instances(results).then((results) => {
						//console.log('{name: {$eq: "Joe"}, address: {city: "Seattle" , zipcode: {base: 98101}}}',JSON.stringify(results));
						expect(results.length).to.equal(2);
						expect(results[0].name).to.equal("Joe");
						expect(results[0].address.city).to.equal("Seattle");
						expect(results[0].address.zipcode.base).to.equal(98101);
						done();
					});
				});
			});
			it('{name: {$eq: "Joe"}, address: {city: "Seattle", zipcode: {base: 99999}}}',function(done) {
				i.match({name: {$eq: "Joe"}, address: {city: "Seattle", zipcode: {base: 99999}}}).then((results) => {
					i.instances(results).then((results) => {
						//console.log('{name: {$eq: "Joe"}, address: {city: "Seattle" , zipcode: {base: 99999}}}',JSON.stringify(results));
						expect(results.length).to.equal(0);
						done();
					});
				});
			});
			it('flush {name: {$eq: "Joe"}} and reload',function(done) {
				i.match({name: {$eq: "Joe"}}).then((result) => {
					setTimeout(() => { // due to delays in restoring objects and variable promise sequencing, this test fails and breaks other tests under IronCache unless it is forced to run "last"
						result.forEach((key) => {
							i.flush(key);
						});
						let promises = [];
						result.forEach((key) => {
							promises.push(i.get(key));
						});
						Promise.all(promises).then((results) => {
							expect(results.every((object) => { 
								return object.name==="Joe"; 
							})).to.equal(true);
							done();
						});
					},1000);
				});
			});
			it('{name: {$neq: "Joe"}}',function(done) {
				i.match({name: {$neq: "Joe"}}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				});
			});
			it('match: {address:{zipcode:{base:98101}}}', function(done) {
				i.match({address:{zipcode:{base:98101}}}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				})
			});
			it('match: {wife:{name:"Mary",children:{1:2}}}', function(done) {
				i.match({wife:{children:{1:2}}}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {wife:{name:"Mary",children:{1:1}}}', function(done) {
				i.match({wife:{name:"Mary",children:{1:1}}}).then((result) => {
					expect(result.length).to.equal(0);
					done();
				});
			});
			it('match: {children:{length:3}}}', function(done) {
				i.match({children:{length:3}}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {children:{$min:1}}}', function(done) {
				i.match({children:{$min:1}}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {children:{$max:3}}}', function(done) {
				i.match({children:{$max:3}}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {children:{$avg:2}}}', function(done) {
				i.match({children:{$avg:2}}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {zipcode:{base:98101}}', function(done) {
				i.match({zipcode:{base:98101}}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				});
			});
			it('match: {birthday:{date:15,day:1}}', function(done) {
				i.match({birthday:{date:15,day:1}}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				});
			});
			it('match: {$class: "Date", date:15}', function(done) {
				i.match({$class: "Date", date:15}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				});
			});
			it('match: {$class: "Array", 1:2}', function(done) {
				i.match({$class: "Array", 1:2}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {age:{$:(value)=> { return typeof(value)==="number" && value>=21; }}}', function(done) {
				i.match({age:{$:(value)=> { return typeof(value)==="number" &&  value>=21; }}}).then((result) => {
					expect(result.length).to.equal(3);
					done();
				});
			});
			it('match: {age:{$:(value)=> { return typeof(value)==="number" && value<=21; }}}', function(done) {
				i.match({age:{$:(value)=> { return typeof(value)==="number" && value<=21; }}}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {age:{$lt:22}}', function(done) {
				i.match({age:{$lt:22}}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {age:{$lte:21}}', function(done) {
				i.match({age:{$lte:21}}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {age:{$eq:21}}', function(done) {
				i.match({age:{$eq:21}}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {age:{$neq:24}}', function(done) {
				i.match({age:{$neq:24}}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
			it('match: {age:{$gte:24}}', function(done) {
				i.match({age:{$gte:24}}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				});
			});
			it('match: {age:{$gt:23}}', function(done) {
				i.match({age:{$gt:23}}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				});
			});
			it('match: {age:{$in:[24,25]}}', function(done) {
				i.match({age:{$in:[24,25]}}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				});
			});
			it('match: {age:{$nin:[34,35]}}', function(done) {
				i.match({age:{$nin:[34,35]}}).then((result) => {
					expect(result.length).to.equal(3);
					done();
				});
			});
			it('match: {age:{$between:[24,25,true]}}', function(done) {
				i.match({age:{$between:[24,25,true]}}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				});
			});
			it('match: {age:{$between:[24,25]}}', function(done) {
				i.match({age:{$between:[24,25]}}).then((result) => {
					expect(result.length).to.equal(0);
					done();
				});
			});
			it('match: {age:{$outside:[22,22]}}', function(done) {
				i.match({age:{$outside:[22,23]}}).then((result) => {
					expect(result.length).to.equal(3);
					done();
				});
			});
			it('match: {name:{$matches:"Joe"}}', function(done) {
				i.match({name:{$matches:"Joe"}}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				});
			});
			it('match: {name:{$echoes:"Jo"}}', function(done) {
				i.match({name:{$echoes:"Jo"}}).then((result) => {
					expect(result.length).to.equal(2);
					done();
				});
			});
			it('flush and match: {name:"Mary",age:21}', function(done) {
				let key = p1["@key"];
				this.timeout(3000);
				i.flush(key);
				i.match({name:"Mary",age:21}).then((result) => {
					expect(result.length).to.equal(1);
					done();
				});
			});
		});
		describe("queries (all match criteria above also supported)", function() {
			it('db.select().from({$e1: Object}).where({$e1: {name: {$eq: "Joe"}}})', function(done) {
				db.select().from({$e1: Object}).where({$e1: {name: {$eq: "Joe"}}}).exec().then((cursor) => { 
					expect(cursor.maxCount).to.equal(2); 
					done(); 
				});
			});
			it('db.select().from({$e1: Object}).where({$e1: {ssn: 999999999}})',function(done) {
				db.select().from({$e1: Object}).where({$e1: {ssn: 999999999}}).exec().then((cursor) => {
					expect(cursor.maxCount).to.equal(1);
					cursor.get(0).then((row) => {
						let id = row[0]["@key"],
							promise;
						let idx = Object.index;
						expect(row[0].ssn).to.equal(999999999);
						row[0].ssn = 111111111;
						if(!activate) {
							promise = db.save(row[0]).exec();
						} else {
							promise = Promise.resolve();
						}
						promise.then(() => {
							db.select().from({$e1: Object}).where({$e1: {ssn: 111111111}}).exec().then((cursor) => {
								expect(cursor.maxCount).to.equal(1);
								cursor.get(0).then((row) => {
									expect(row[0].ssn).to.equal(111111111);
									expect(row[0]["@key"]).to.equal(id);
									done();
								});
							});
						});
					});
				});
			});
			it('db.select().from({$e1: Object}).where({$e1: {name: {$: (v) => { return v==="Joe"; }}}})', function(done) {
				db.select().from({$e1: Object}).where({$e1: {name: {$: (v) => { return v==="Joe"; }}}}).exec().then((cursor) => { 
					expect(cursor.maxCount).to.equal(2); 
					done(); 
				});
			});
			it('db.select().from({$e1: Object}).where({$e1: {name: {$eq: "Joe"},birthday:{date:15,day:1}}})', function(done) {
				db.select().from({$e1: Object}).where({$e1: {name: {$eq: "Joe"},birthday:{date:15,day:1}}}).exec().then((cursor) => { 
					expect(cursor.maxCount).to.equal(1); 
					done(); 
				});
			});
			it('db.select().from({$p1: Object, $p2: Object}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}})', function(done) {
			 db.select().from({$p1: Object, $p2: Object}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}}).exec().then((cursor) => {
				 cursor.count().then((cnt) => {
					 expect(cnt>0).to.equal(true); 
						done(); 
				 });
			 });
			});
			it('db.select().from({$o1: Object,$o2: Object}).where({$o1: {name: {$neq: {$o2: "name"}}, "@key": {$neq: {$o2: "@key"}}}, $o2: {name: {$neq: null}}})', function(done) {
				db.select().from({$o1: Object,$o2: Object}).where({$o1: {name: {$neq: {$o2: "name"}}, "@key": {$neq: {$o2: "@key"}}}, $o2: {name: {$neq: null}}}).exec().then((cursor) => {
					cursor.count().then((cnt) => {
						 expect(cnt>0).to.equal(true); 
						 cursor.every((row,i) => {
								return row[0]["@key"]!==row[1]["@key"] && row[0].name!==row[1].name;
							}).then((result) => {
								expect(result).to.equal(true);
								done();
							})
					 });
				});
			});
			it('db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Joe"}}, $e2: {name: {$eq: "Joe"}}})', function(done) {
				db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Joe"}}, $e2: {name: {$eq: "Joe"}}}).exec().then((cursor) => { 
					 cursor.count().then((cnt) => {
						 expect(cnt).to.equal(4); 
							done(); 
					 });
				});	
			});
			it('db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Joe"}}, $e2: {name: {$neq: "Joe"}}})', function(done) {
				db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Joe"}}, $e2: {name: {$neq: "Joe"}}}).exec().then((cursor) => { 
					cursor.count().then((cnt) => {
						 expect(cnt).to.equal(4); 
							done(); 
					 }); 
				});	
			});
			it('db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: {$e2: "name"}}}})', function(done) {
				db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: {$e2: "name"}}}}).exec().then((cursor) => { 
					let count = 0;
					expect(cursor.maxCount>=8).to.equal(true);
					cursor.every((row) => {
						count++;
						return row[0].name!==row[1].name;
					}).then((result) => {
						expect(result).to.equal(true);
						expect(count).to.equal(8);
						done();
					}).catch((e) => {
						console.log(e)
					}); 
				 }); 
			});
			it('db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: null, $eq: {$e2: "name"}}}})', function(done) {
				db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: null, $eq: {$e2: "name"}}}}).exec().then((cursor) => { 
					let count = 0;
					expect(cursor.maxCount>=8).to.equal(true);
					cursor.every((row) => {
						count++;
						return row[0].name===row[1].name;
					}).then((result) => {
						expect(result).to.equal(true);
						done();
					});  
				});
			});
			it('db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}})', function(done) {
				db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}}).exec().then((cursor) => { 
					let count = 0;
					expect(cursor.maxCount>=8).to.equal(true);
					cursor.every((row) => {
						count++
						return row[0].name!==row[1].name;
					}).then((result) => {
						expect(result).to.equal(true);
						expect(count).to.equal(8);
						done();
					});  
				});
			});
			it('db.select().first(4).from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}})', function(done) {
				db.select().first(4).from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}}).exec().then((cursor) => { 
					let count = 0;
					expect(cursor.maxCount>=4).to.equal(true);
					cursor.every((row) => {
						count++;
						return row[0].name!==row[1].name;
					}).then((result) => {
						expect(result).to.equal(true);
						expect(count).to.equal(4);
						done();
					});   
				});
			});
			it('db.select().random(4).from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}})', function(done) {
				db.select().random(4).from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}}).exec().then((cursor) => { 
					let count = 0;
					expect(cursor.maxCount>=4).to.equal(true);
					cursor.every((row) => {
						count++;
						return row[0].name!==row[1].name;
					}).then((result) => {
						expect(result).to.equal(true);
						expect(count).to.equal(4);
						done();
					});  
				});
			});
			it('db.select().sample(.2,.05).from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}})', function(done) {
				db.select().sample(.2,.05).from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}}).exec().then((cursor) => { 
					let count = 0;
					expect(cursor.maxCount>=4).to.equal(true);
					cursor.every((row) => {
						count++;
						return row[0].name!==row[1].name;
					}).then((result) => {
						expect(result).to.equal(true);
						expect(count).to.equal(4);
						done();
					});  
				});
			});
			it('db.select({e1name: {$e1: "name"},e2name: {$e2: "name"}}).from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: {$e2: "name"}}}, $e2: {name: "Mary"}})', function(done) {
				return db.select({e1name: {$e1: "name"},e2name: {$e2: "name"}}).from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: null, $eq: {$e2: "name"}}}, $e2: {name: "Mary"}})
				.exec().then(function(cursor) {
					let count = 0;
					expect(cursor.maxCount>=4).to.equal(true);
					cursor.every((row) => {
						count++;
						return row.e1name==="Mary" && row.e2name==="Mary"; 
					}).then((result) => {
						expect(result).to.equal(true);
						expect(count>0).to.equal(true);
						done();
					}); 
				});
			});
			/*NOT YET SUPPORTED it('query select({name: {$o: "name"}}).from({$o: Object}).where({$o: {name: "Joe"}}).orderBy({$o1: {name: "asc"}})', function(done) {
				db.select({name: {$o: "name"}}).from({$o: Object}).where({$o: {name: "Joe"}}).orderBy({$o1: {name: "asc"}}).exec().then((cursor) => {
					expect(cursor.every((row) => { return row.name==="Joe"; })).to.equal(true);
					expect(cursor.some((row) => { return row.name==="Joe"; })).to.equal(true);
					expect(cursor.count()===1);
					done();
				});
			});*/
		});
		describe("streaming", function() {
			it('when({$o: {stream: true}}).from({$o: Object}).select()', function(done) {
				db.when({$o: {stream: true}}).from({$o: Object}).select().then(function(cursor) {
					expect(cursor.maxCount).to.equal(1);
					cursor.every((row) => { 
						return row[0].stream===true; 
					}).then((result) => {
						expect(result).to.equal(true);
						done();
					});
				});
				db.insert({stream:true}).into(Object).exec().then(() => {
					db.delete().from({$o1: Object}).where({$o1: {stream: true}}).exec();
				});
			});
			/*NOT YET SUPPORTED it('when({$o: {birthday: {month:1}}).from({$o: Object}).select()', function(done) {
				db.when({$o: {birthday: {month:1}}}).from({$o: Object}).select().then(function(cursor) {
					expect(cursor.count()).to.equal(1);
					expect(cursor.every((row) => { 
						return row[0].birthday.getMonth()===1;
					})).to.equal(true);
					done();
				});
				db.insert({birthday:new Date("03/15/90")}).into(Object).exec().then((instance) => {
					instance.birthday.setMonth(1); // need to add container management for this to work
					db.delete().from({$o1: Object}).where({$o1: {"@key": instance["@key"]}}).exec();
				});
			});*/
		});
	});	
}).catch((e) => {
	console.log(e);
});

					

