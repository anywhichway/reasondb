var chai, expect, ReasonDB;
if(typeof(window)==="undefined") {
	chai = require("chai");
	expect = chai.expect;
	//Promise = require("bluebird");
	ReasonDB = require("../lib/index.js");
}

function decaf() {
	describe = function describe(name,group) {
		console.log(name);
		group.call({timeout:()=>{}});
	};
	it = function it(name,test) {
		try {
			test.call({timeout:()=>{}},()=>{});
			console.log(name);
		} catch(e) {
			console.log(name,e);
		}
	};
}

let store = ReasonDB.LocalStore, // ReasonDB.MemStore,ReasonDB.LocalStore,ReasonDB.LocalForageStore;
	clear = true;

if(store===ReasonDB.LocalForageStore || typeof(window)==="undefined") {
	decaf(); // localForage fails when using mocha and mocha fails when run in server mode!
}
	

let db = new ReasonDB("Test","@key",store,true,clear), //MemStore, LocalStore, LocalForageStore
	i = Object.index,
		promises = [],
		resolver,
		promise = new Promise((resolve,reject) => {
			resolver = resolve;
		}),
		o1 = {name: "Joe", age:24, birthday: new Date("01/15/90"), address: {city: "Seattle", zipcode: {base: 98101, plus4:1234}}},
		p1= {name:"Mary",age:21,children:[1,2,3]};
	if(clear) {
		let a1 = {city:"Seattle",zipcode:{base:98101,plus4:1234}},
			p2 = {wife:p1,name:"Joe",age:24,address:a1},
			p3 = {name:"Mary",birthday:new Date(1962,0,15)};
			//promises = [i.put(o1),i.put(p2),i.put(p1),i.put(p3)];
			//promises = [i.put(o1),i.put(p2)];
			i.put(o1).then(() => { i.put(p2).then(() => { i.put(p1).then(() => { i.put(p3).then(() => { resolver(); })})})});
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
			it('{name: {$eq: "Joe"}}',function(done) {
				i.match({name: {$eq: "Joe"}}).then((result) => {
					result.forEach((key) => {
						i.flush(key);
					});
					i.instances(result).then((result) => {
						expect(result.length).to.equal(2);
						expect(result[0].name).to.equal("Joe");
						done();
					});
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
			it('match: {date:15}', function(done) {
				i.match({date:15}).then((result) => {
					expect(result.length).to.equal(2);
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
					expect(cursor.count()).to.equal(2); 
					done(); 
				});
			});
			it('db.select().from({$e1: Object}).where({$e1: {name: {$: (v) => { return v==="Joe"; }}}})', function(done) {
				db.select().from({$e1: Object}).where({$e1: {name: {$: (v) => { return v==="Joe"; }}}}).exec().then((cursor) => { 
					expect(cursor.count()).to.equal(2); 
					done(); 
				});
			});
			it('db.select().from({$e1: Object}).where({$e1: {name: {$eq: "Joe"},birthday:{date:15,day:1}}})', function(done) {
				db.select().from({$e1: Object}).where({$e1: {name: {$eq: "Joe"},birthday:{date:15,day:1}}}).exec().then((cursor) => { 
					expect(cursor.count()).to.equal(1); 
					done(); 
				});
			});
			it('db.select().from({$p1: Object, $p2: Object}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}})', function(done) {
			 db.select().from({$p1: Object, $p2: Object}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}}).exec().then((cursor) => {
   			  	expect(cursor.count()>0).to.equal(true); 
				done(); 
			 });
			});
			it('db.select().from({$o1: Object,$o2: Object}).where({$o1: {name: {$neq: {$o2: "name"}}, "@key": {$neq: {$o2: "@key"}}}, $o2: {name: {$neq: null}}})', function(done) {
				db.select().from({$o1: Object,$o2: Object}).where({$o1: {name: {$neq: {$o2: "name"}}, "@key": {$neq: {$o2: "@key"}}}, $o2: {name: {$neq: null}}}).exec().then((cursor) => {
					expect(cursor.count()>0).to.equal(true);
					expect(cursor.every((row,i) => {
						return row[0]["@key"]!==row[1]["@key"] && row[0].name!==row[1].name;
					})).to.equal(true);
					done();
				});
			});
			it('db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Joe"}}, $e2: {name: {$eq: "Joe"}}})', function(done) {
				db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Joe"}}, $e2: {name: {$eq: "Joe"}}}).exec().then((cursor) => { 
					expect(cursor.count()).to.equal(4); 
					done(); 
				});	
			});
			it('db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Joe"}}, $e2: {name: {$neq: "Joe"}}})', function(done) {
				db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Joe"}}, $e2: {name: {$neq: "Joe"}}}).exec().then((cursor) => { 
					expect(cursor.count()).to.equal(4); 
					done(); 
				});	
			});
			it('db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: {$e2: "name"}}}})', function(done) {
				db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: {$e2: "name"}}}}).exec().then((cursor) => { 
					expect(cursor.every((row) => {
						return row[0].name!==row[1].name;
					})).to.equal(true);
					expect(cursor.count()).to.equal(8);
					done(); 
				});
				
			});
			it('db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: null, $eq: {$e2: "name"}}}})', function(done) {
				db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: null, $eq: {$e2: "name"}}}}).exec().then((cursor) => { 
					expect(cursor.count()).to.equal(8);
					expect(cursor.every((row) => {
						return row[0].name===row[1].name;
					})).to.equal(true);
					done(); 
				});
			});
			it('db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}})', function(done) {
				db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}}).exec().then((cursor) => { 
					expect(cursor.every((row) => {
						return row[0].name!==row[1].name;
					})).to.equal(true); 
					expect(cursor.count()).to.equal(8);
					done(); 
				});
			});
			it('db.select({e1name: {$e1: "name"},e2name: {$e2: "name"}}).from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: {$e2: "name"}}}, $e2: {name: "Mary"}})', function(done) {
				db.select({e1name: {$e1: "name"},e2name: {$e2: "name"}}).from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: null, $eq: {$e2: "name"}}}, $e2: {name: "Mary"}})
				.exec().then(function(cursor) {
					expect(cursor.count()>0).to.equal(true);
					expect(cursor.every((row) => { 
						return row.e1name==="Mary" && row.e2name==="Mary"; 
					})).to.equal(true);
					done();
				});
			});
			/*it('query select({name: {$o: "name"}}).from({$o: Object}).where({$o: {name: "Joe"}}).orderBy({$o1: {name: "asc"}})', function(done) {
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
					expect(cursor.count()).to.equal(1);
					expect(cursor.every((row) => { 
						return row[0].stream===true; 
					})).to.equal(true);
					done();
				});
				db.insert({stream:true}).into(Object).exec().then(() => {
					db.delete().from({$o1: Object}).where({$o1: {stream: true}}).exec();
				});
			});
			/*it('when({$o: {birthday: {month:1}}).from({$o: Object}).select()', function(done) {
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

					

