var expect, ReasonDB, iIndexedDB;
if(typeof(window)==="undefined") {
	expect = require("chai").expect;
	ReasonDB = require("../index.js");
	iIndexedDB = require("../lib/iIndexexDB");
}

describe("ReasonDB", function() {
	describe("memDB", function() {
		let db = new ReasonDB(),
			w1results,
			w2results,
			w3results,
			w1 = db.select().from({$e1: db.Entity}).when({$e1: {name: {$eq: "Joe"}}}).then((results) => { console.log("fire 1:",results), w1results = results;  }),
			w2 = db.select().from({$e1: db.Entity,$e2: db.Entity}).when({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}).then((results) => { console.log("fire 2:",results); w2results = results; }),
			w3 = db.select().from({$e1: db.Entity,$e2: db.Entity}).when({$e1: {name: {$e2: "name"}}}).then((results) => { console.log("fire 3: ",results); w3results = results; }),
			a1 = new db.Entity({city:"Seattle",zipcode:{base:98101,plus4:1234}}),
			p1 = new db.Entity({name:"Mary",address:a1,children:[1,2,3]}),
			p2 = new db.Entity({wife:p1,address:a1,name:"Joe"})
			p3 = new db.Entity({name:"Mary"});
		db.Entity.index.put(p2);
		db.Entity.index.put(p3);
		describe("matches",function() {	
			let result = db.Entity.index.match({address:{zipcode:{base:98101}}});
			console.log(result);
			result = db.Entity.index.match({wife:{name:"Mary",children:{1:2}}});
			console.log(result);
			result = db.Entity.index.match({zipcode:{base:98101}});
			console.log(result);
			console.log(JSON.stringify(a1));
			console.log(JSON.stringify(p1));
			console.log(JSON.stringify(p2));
			console.log(JSON.stringify(p3));
		});
		describe("queries", function() {
			it("simple $eq", function(done) {
				db.select().from({$e1: db.Entity}).where({$e1: {name: {$eq: "Mary"}}}).then((cursor) => { expect(cursor.count).to.equal(2); done(); });
			});
			it("multi", function(done) {
				db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}).then((cursor) => { expect(cursor.count).to.equal(2); done(); });	
			});
			it("direct join", function(done) {
				db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$e2: "name"}}}).then((cursor) => { expect(cursor.count).to.equal(3); done(); });
			});
			it("$eq join", function(done) {
				db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$eq: {$e2: "name"}}}}).then((cursor) => { expect(cursor.count).to.equal(3); done(); });
			});
			it("projection", function(done) {
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
		describe("streaming analytics",function() {
			it("simple match", function(done) {
				expect(w1results.count).to.equal(1);
				done();
			});
			it("multi match", function(done) {
				 expect(w2results.count>0).to.equal(true);
				 done();
			});
			it("join match", function(done) {
				 expect(w3results.count>0).to.equal(true);
				 done();
			});
		});
	});
	
	describe("indexedDB",function() {
		let db = new ReasonDB("@key",ReasonDB.indexedDB,"ReasonDB"),
			//w1results,
			//w2results,
			//w3results,
			//w1 = db.select().from({$e1: db.Entity}).when({$e1: {name: {$eq: "Joe"}}}).then((results) => { console.log("fire 1:",results), w1results = results;  }),
			//w2 = db.select().from({$e1: db.Entity,$e2: db.Entity}).when({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}).then((results) => { console.log("fire 2:",results); w2results = results; }),
			//w3 = db.select().from({$e1: db.Entity,$e2: db.Entity}).when({$e1: {name: {$e2: "name"}}}).then((results) => { console.log("fire 3: ",results); w3results = results; }),
			a1 = new db.Entity({city:"Seattle",zipcode:{base:98101,plus4:1234}}),
			p1 = new db.Entity({name:"Mary",address:a1,children:[1,2,3]}),
			p2 = new db.Entity({wife:p1,address:a1,name:"Joe"})
			p3 = new db.Entity({name:"Mary"});
		db.Entity.index.put(p2);
		db.Entity.index.put(p3);
		delete Object.index;
		delete Array.index;
		describe("queries", function() {
			it("simple $eq", function(done) {
				db.select().from({$e1: db.Entity}).where({$e1: {name: {$eq: "Mary"}}}).then((cursor) => { expect(cursor.count).to.equal(2); done(); });
			});
			it("multi", function(done) {
				db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}).then((cursor) => { expect(cursor.count).to.equal(2); done(); });	
			});
			it("direct join", function(done) {
				db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$e2: "name"}}}).then((cursor) => { expect(cursor.count).to.equal(3); done(); });
			});
			it("$eq join", function(done) {
				db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$eq: {$e2: "name"}}}}).then((cursor) => { expect(cursor.count).to.equal(3); done(); });
			});
			it("projection", function(done) {
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
	});
});