var expect, ReasonDB, iIndexedDB;
if(typeof(window)==="undefined") {
	expect = require("chai").expect;
	ReasonDB = require("../index.js");
}

function Log() {
	//console.log(...arguments);
}



// property/value/type/classname/id   classname is the entry point
// property/value/classname/classname/id ... match(value,test,classname,results)

[ReasonDB.memDB,ReasonDB.indexedDB,ReasonDB.localStorageDB].forEach((dbType) => {
	if(!dbType) { return; }
	describe(dbType.name, function() {
		delete Object.index;
		delete Array.index;
		delete Date.index;
		let db = new ReasonDB("@key",dbType,"ReasonDB",true),
			w1results,
			w2results,
			w3results,
			w1 = db.select().from({$e1: db.Entity}).when({$e1: {name: {$eq: "Joe"}}}).then((results) => {  w1results = results;  }),
			w2 = db.select().from({$e1: db.Entity,$e2: db.Entity}).when({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}).then((results) => { w2results = results; }),
			w3 = db.select().from({$e1: db.Entity,$e2: db.Entity}).when({$e1: {name: {$e2: "name"}}}).then((results) => { Log("fire 3: ",results); w3results = results; }),
			a1 = new db.Entity({city:"Seattle",zipcode:{base:98101,plus4:1234}}),
			p1 = new db.Entity({name:"Mary",age:25,address:a1,children:[1,2,3]}),
			p2 = new db.Entity({wife:p1,age:24,address:a1,name:"Joe"})
			p3 = new db.Entity({name:"Mary",birthday:new Date(1962,0,16)});
		db.Entity.index.put(p2);
		db.Entity.index.put(p3);
		p3.birthday.setDate(15);
		
		/*if(dbType!=ReasonDB.memDB) {
			delete Object.index;
			delete Array.index;
			delete Date.index;
			db = new ReasonDB("@key",dbType,"ReasonDB");
		}*/
		
		describe("queries", function() {
			it('where: {$e1: {name: {$eq: "Mary"}}}', function(done) {
				db.select().from({$e1: db.Entity}).where({$e1: {name: {$eq: "Mary"}}}).then((cursor) => { expect(cursor.count).to.equal(2); done(); });
			});
			it('where: {$e1: {name: {$eq: "Mary",birthday:{date:15,day:1}}}}}', function(done) {
				db.select().from({$e1: db.Entity}).where({$e1: {name: {$eq: "Mary"},birthday:{date:15,day:1}}}).then((cursor) => { expect(cursor.count).to.equal(1); done(); });
			});
			it('where: {$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}', function(done) {
				db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}).then((cursor) => { expect(cursor.count).to.equal(2); done(); });	
			});
			it('where: {$e1: {name: {$e2: "name"}}}', function(done) {
				db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$e2: "name"}}}).then((cursor) => { expect(cursor.count).to.equal(3); done(); });
			});
			it('where: {$e1: {name: {$eq: {$e2: "name"}}}}', function(done) {
				db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$eq: {$e2: "name"}}}}).then((cursor) => { expect(cursor.count).to.equal(3); done(); });
			});
			it('flush and where: {$e1: {birthday:{date:15,day:1}}}}', function(done) {
				let key = p3["@key"];
				this.timeout(3000);
				db.Entity.index.flush(key);
				db.select().from({$e1: db.Entity}).where({$e1: {birthday:{date:15,day:1}}}).then((cursor) => { expect(cursor.count).to.equal(1); done(); });
			});
			it('projection: {e1name: {$e1: "name"},e2name: {$e2: "name"}}', function(done) {
				this.timeout(3000);
				db.select({e1name: {$e1: "name"},e2name: {$e2: "name"}}).from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: {$e1: "name"}}}})
				.then((cursor) => { 
					let p, promises = [];
					while(p = cursor.next()) {
						promises.push(p);
					}
					Promise.all(promises).then((results) => {
						if(results.every((row) => {
							return row.e1name==="Mary" && row.e2name==="Mary";
						})) {
							done();
						}
					});
				});
			});

		});
		describe("matches",function() {	
			it('match: {address:{zipcode:{base:98101}}}', function() {
				let result = db.Entity.index.match({address:{zipcode:{base:98101}}});
				expect(result.length).to.equal(2);
			});
			it('match: {wife:{name:"Mary",children:{1:2}}}', function() {
				let result = db.Entity.index.match({wife:{name:"Mary",children:{1:2}}});
				expect(result.length).to.equal(1);
			});
			it('match: {wife:{name:"Mary",children:{1:1}}}', function() {
				let result = db.Entity.index.match({wife:{name:"Mary",children:{1:1}}});
				expect(result.length).to.equal(0);
			});
			it('match: {children:{length:3}}}', function() {
				let result = db.Entity.index.match({children:{length:3}});
				expect(result.length).to.equal(1);
			});
			it('match: {children:{$min:1}}}', function() {
				let result = db.Entity.index.match({children:{$min:1}});
				expect(result.length).to.equal(1);
			});
			it('match: {children:{$max:3}}}', function() {
				let result = db.Entity.index.match({children:{$max:3}});
				expect(result.length).to.equal(1);
			});
			it('match: {children:{$avg:2}}}', function() {
				let result = db.Entity.index.match({children:{$avg:2}});
				expect(result.length).to.equal(1);
			});
			it('match: {zipcode:{base:98101}}', function() {
				let result = db.Entity.index.match({zipcode:{base:98101}});
				expect(result.length).to.equal(1);
			});
			it('match: {birthday:{date:15,day:1}}', function() {
				let result = db.Entity.index.match({birthday:{date:15}});
				expect(result.length).to.equal(1);
			});
			it('match: {age:{$:(value)=> { return typeof(value)==="number" && value>=21; }}}', function() {
				let result = db.Entity.index.match({age:{$:(value)=> { return typeof(value)==="number" &&  value>=25; }}});
				expect(result.length).to.equal(1);
			});
			it('match: {age:{$:(value)=> { return typeof(value)==="number" && value<=21; }}}', function() {
				let result = db.Entity.index.match({age:{$:(value)=> { return typeof(value)==="number" && value<=24; }}});
				expect(result.length).to.equal(1);
			});
			it('match: {age:{$lt:25}}', function() {
				let result = db.Entity.index.match({age:{$lt:25}});
				expect(result.length).to.equal(1);
			});
			it('match: {age:{$lte:24}}', function() {
				let result = db.Entity.index.match({age:{$lte:24}});
				expect(result.length).to.equal(1);
			});
			it('match: {age:{$eq:24}}', function() {
				let result = db.Entity.index.match({age:{$eq:24}});
				expect(result.length).to.equal(1);
			});
			it('match: {age:{$neq:24}}', function() {
				let result = db.Entity.index.match({age:{$neq:24}});
				expect(result.length).to.equal(1);
			});
			it('match: {age:{$gte:25}}', function() {
				let result = db.Entity.index.match({age:{$gte:25}});
				expect(result.length).to.equal(1);
			});
			it('match: {age:{$gt:24}}', function() {
				let result = db.Entity.index.match({age:{$gt:24}});
				expect(result.length).to.equal(1);
			});
			it('match: {age:{$in:[24,25]}}', function() {
				let result = db.Entity.index.match({age:{$in:[24,25]}});
				expect(result.length).to.equal(2);
			});
			it('match: {age:{$nin:[34,35]}}', function() {
				let result = db.Entity.index.match({age:{$nin:[34,35]}});
				expect(result.length).to.equal(2);
			});
			it('match: {age:{$between:[24,25,true]}}', function() {
				let result = db.Entity.index.match({age:{$between:[24,25,true]}});
				expect(result.length).to.equal(2);
			});
			it('match: {age:{$between:[24,25]}}', function() {
				let result = db.Entity.index.match({age:{$between:[24,25]}});
				expect(result.length).to.equal(0);
			});
			it('match: {age:{$outside:[23,24]}}', function() {
				let result = db.Entity.index.match({age:{$outside:[22,23]}});
				expect(result.length).to.equal(2);
			});
			it('match: {name:{$matches:"Joe"}}', function() {
				let result = db.Entity.index.match({name:{$matches:"Joe"}});
				expect(result.length).to.equal(1);
			});
			it('match: {name:{$echoes:"Joe"}}', function() {
				let result = db.Entity.index.match({name:{$echoes:"Joe"}});
				expect(result.length).to.equal(1);
			});
			it('instances: {wife:{name:"Mary",children:{1:2}}}',function(done) {
				let result = db.Entity.index.match({wife:{name:"Mary",children:{1:2}}});
				db.Entity.index.instances(result).then((instances) => {
					expect(instances.length).to.equal(1);
					expect(instances[0]).to.be.instanceOf(db.Entity);
					done();
				});
			});
			it('flush and match: {wife:{name:"Mary",children:{1:2}}}', function(done) {
				let key = p3["@key"];
				this.timeout(3000);
				db.Entity.index.flush(key);
				let result = db.Entity.index.match({wife:{name:"Mary",children:{1:2}}});
				expect(result.length).to.equal(1);
				done();
			});
		});
		describe("index access",function() {
			it("get",function(done) {
				let key = p2["@key"];
				expect(!!db.Entity.index[key]).to.equal(true);
				db.Entity.index.get(key).then((result) => {
					expect(typeof(result)).to.equal("object");
					expect(result.name).to.equal("Joe");
					expect(result).to.be.instanceof(db.Entity);
					done();
				});
			});
			it("flush & get",function(done) {
				let key = p3["@key"];
				this.timeout(3000);
				db.Entity.index.flush(key);
				expect(db.Entity.index[key]).to.equal(true);
				db.Entity.index.get(key).then((result) => {
					expect(typeof(result)).to.equal("object");
					expect(result.name).to.equal("Mary");
					expect(result).to.be.instanceof(db.Entity);
					done();
				});
			});
			it("delete & get",function(done) {
				let key = p2["@key"];
				db.Entity.index.delete(key);
				expect(db.Entity.index[key]).to.equal(undefined);
				db.Entity.index.get(key).then((result) => {
					expect(result).to.equal(undefined);
					done();
				});
			});
		});
		describe("streaming analytics",function() {
			it('when: {$e1: {name: {$eq: "Joe"}}}', function(done) {
				expect(w1results.count).to.equal(1);
				done();
			});
			it('when: {$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}', function(done) {
				 expect(w2results.count).to.equal(1);
				 done();
			});
			it('when: {$e1: {name: {$e2: "name"}}}', function(done) {
				 expect(w3results.count).to.equal(3);
				 done();
			});
		});
	});
});
