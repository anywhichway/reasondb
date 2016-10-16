var chai, expect, ReasonDB;
if(typeof(window)==="undefined") {
	chai = require("chai");
	expect = chai.expect;
	ReasonDB = require("../lib/index.js");
}

function decaf() {
	describe = function describe(name,group) {
		console.log(name);
		group.call({timeout:()=>{}});
	};
	it = function it(name,test) {
		console.log(name);
		try {
			test.call({timeout:()=>{}},()=>{});
		} catch(e) {
			console.log(e);
		}
	};
}

let store = ReasonDB.LocalStore; // ReasonDB.MemStore,ReasonDB.LocalStore,ReasonDB.LocalForageStore;

	if(store===ReasonDB.LocalForageStore || typeof(window)==="undefined") {
		decaf(); // localForage fails when using mocha and mocha fails when run in server mode!
	}
	let db = new ReasonDB("Test","@key",store,true,true), //MemStore, LocalStore, LocalForageStore
		i = Object.index,
		o1 = {name: "Joe", age:24, birthday: new Date("01/15/90"), address: {city: "Seattle", zipcode: {base: 98101, plus4:1234}}},
		a1 = {city:"Seattle",zipcode:{base:98101,plus4:1234}},
		p1 = {name:"Mary",age:21,children:[1,2,3]},
		p2 = {wife:p1,name:"Joe",age:24,address:a1},
		p3 = {name:"Mary",birthday:new Date(1962,0,15)};
	
	let promises = [i.put(p2),i.put(o1),i.put(p1),i.put(p3)]; //i.put(p2),i.put(o1),i.put(p1),i.put(p3)
	

					Promise.all(promises).then((results) => {
						describe("matches", function() {
							it('{birthday: {month:0}}', function(done) {
								i.match({birthday: {month:0}}).then((results) => {
									i.instances(results).then((results) => {
										//console.log('{birthday: {month:0}}',results);
										expect(results.length).to.equal(2);
										expect(results[0].birthday.month).to.equal(0);
										done();
									});
								});
							});
							it('{name: "Joe"}',function(done) {
								i.match({name: "Joe"}).then((results) => {
									i.instances(results).then((results) => {
										//console.log('{name: "Joe"}',results);
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
										//console.log('{name: {$eq: "Joe"}, address: {city: "Seattle" , zipcode: {base: 98101}}}',results);
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
										//console.log('{name: {$eq: "Joe"}, address: {city: "Seattle" , zipcode: {base: 99999}}}',results);
										expect(results.length).to.equal(0);
										done();
									});
								});
							});
							it('{name: {$eq: "Joe"}}',function(done) {
								i.match({name: {$eq: "Joe"}}).then((results) => {
									results.forEach((key) => {
										i.flush(key);
									});
									i.instances(results).then((results) => {
										//console.log("flush instances",results);
										expect(results.length).to.equal(2);
										expect(results[0].name).to.equal("Joe");
										done();
									});
								});
							});
							it('{name: {$neq: "Joe"}}',function(done) {
								i.match({name: {$neq: "Joe"}}).then((results) => {
									//console.log('{name: {$neq: "Joe"}}',results);
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
								let result = i.match({wife:{children:{1:2}}}).then((result) => {
									expect(result.length).to.equal(1);
									done();
								});
							});
							it('match: {wife:{name:"Mary",children:{1:1}}}', function(done) {
								let result = i.match({wife:{name:"Mary",children:{1:1}}}).then((result) => {
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
						describe("queries", function() {
							it('query select({name: {$o: "name"}}).from({$o: Object}).where({$o: {name: "Joe"}}).from({$o: Object})', function(done) {
								let promises = [];
								db.select({name: {$o: "name"}}).from({$o: Object}).where({$o: {name: "Joe"}}).orderBy({$o1: {name: "asc"}}).exec().then((cursor) => {
									expect(cursor.every((row) => { return row.name==="Joe"; })).to.equal(true);
									expect(cursor.some((row) => { return row.name==="Joe"; })).to.equal(true);
									expect(cursor.count===1);
									done();
								});
							});
							it('join select().from({$o1: Object,$o2: Object}).where({$o1: {name: {$neq: null, $o2: "name"}, "@key": {$neq: {$o2: "@key"}}}})', function(done) {
								db.select().from({$o1: Object,$o2: Object}).where({$o1: {name: {$neq: null, $o2: "name"}, "@key": {$neq: {$o2: "@key"}}}}).exec().then((cursor) => {
									expect(cursor.every((row,i) => {
										return row[0].name===row[1].name;
									})).to.equal(true);
									done();
								});
							});
							it('where: {$e1: {name: {$eq: "Joe"}}}', function(done) {
								db.select().from({$e1: Object}).where({$e1: {name: {$eq: "Joe"}}}).exec().then((cursor) => { 
									expect(cursor.count).to.equal(2); 
									done(); 
								});
							});
							it('where: {$e1: {name: {$eq: "Joe",birthday:{date:15,day:1}}}}}', function(done) {
								db.select().from({$e1: Object}).where({$e1: {name: {$eq: "Joe"},birthday:{date:15,day:1}}}).exec().then((cursor) => { 
									expect(cursor.count).to.equal(1); 
									done(); 
								});
							});
							it('where: {$e1: {name: {$eq: "Joe"}}, $e2: {name: {$eq: "Joe"}}}', function(done) {
								db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Joe"}}, $e2: {name: {$eq: "Joe"}}}).exec().then((cursor) => { 
									expect(cursor.count).to.equal(4); 
									done(); 
								});	
							});
							it('where: {$e1: {name: {$eq: "Joe"}}, $e2: {name: {$neq: "Joe"}}}', function(done) {
								db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Joe"}}, $e2: {name: {$neq: "Joe"}}}).exec().then((cursor) => { 
									expect(cursor.count).to.equal(4); 
									done(); 
								});	
							});
							it('where: {$e1: {name: {$e2: "name"}}}', function(done) {
								db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: null, $e2: "name"}}}).exec().then((cursor) => { 
									expect(cursor.every((row) => {
										return row[0].name===row[1].name;
									})).to.equal(true);
									expect(cursor.count).to.equal(8);
									done(); 
								});
								
							});
							
							it('where: {$e1: {name: {$eq: {$e2: "name"}}}}', function(done) {
								db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$neq: null, $eq: {$e2: "name"}}}}).exec().then((cursor) => { 
									expect(cursor.every((row) => {
										return row[0].name===row[1].name;
									})).to.equal(true);
									expect(cursor.count).to.equal(8);
									done(); 
								});
							});
							it('where: {$e1: {name: {$neq: {$e2: "name"}}}}', function(done) {
								db.select().from({$e1: Object,$e2: Object}).where({$e1: {name: {$: (v) => { return v!=null; }, $neq: {$e2: "name"}}}}).exec().then((cursor) => { 
									expect(cursor.every((row) => {
										return row[0].name!==row[1].name;
									})).to.equal(true); 
									expect(cursor.count).to.equal(8);
									done(); 
								});
							});
							it('projection: {e1name: {$e1: "name"},e2name: {$e2: "name"}} {$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: {$e1: "name"}}}}', function(done) {
								this.timeout(3000);
								db.select({e1name: {$e1: "name"},e2name: {$e2: "name"}}).from({$e1: Object,$e2: Object}).where({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$neq: null,$eq: {$e1: "name"}}}})
								.exec().then(function(cursor) {
									expect(cursor.every((row) => { 
										return row.e1name==="Mary" && row.e2name==="Mary"; 
									})).to.equal(true);
									done();
								});
							});
						});
						describe("streaming", function() {
							it('query select({name: {$o: "name"}}).from({$o: Object}).when({$o: {age: 26}}', function(done) {
								db.select({age: {$o: "age"}}).from({$o: Object}).when({$o: {age: 26}}).then(function(cursor) {
									expect(cursor.every((row) => { return row.age===26; })).to.equal(true);
									done();
								});
								o1.age = 26;
							});
						});
						
	}).catch((e) => {
		console.log(e);
	});

