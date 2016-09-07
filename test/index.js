var expect, ReasonDB;
if(typeof(window)==="undefined") {
	expect = require("chai").expect;
	ReasonDB = require("../index.js");
}

describe("ReasonDB ", function() {
	it("should support normal matching",function() {
		let db = new ReasonDB();

		db.select().from({$e1: db.Entity}).when({$e1: {name: {$eq: "Mary"}}}).then((results) => { console.log("fired 1: ",results); });
		db.select().from({$e1: db.Entity,$e2: db.Entity}).when({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}).then((results) => { console.log("fired 2: ",results); });

		let a1 = new db.Entity({city:"Seattle",zipcode:{base:98101,plus4:1234}}),
			p1 = new db.Entity({name:"Mary",address:a1,children:[1,2,3]}),
			p2 = new db.Entity({wife:p1,address:a1,name:"Joe"})
			p3 = new db.Entity({name:"Mary"}),
		db.Entity.index.put(p2);
		db.Entity.index.put(p3);
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

		db.select().from({$e1: db.Entity}).where({$e1: {name: {$eq: "Mary"}}}).then((cursor,matches) => { console.log("selected 1: ",cursor,matches); });
		db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}).then((cursor,matches) => { console.log("selected 2: ",cursor,matches); });
		db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$e2: "name"}}}).then((cursor,matches) => { console.log("selected 3: ",cursor,matches); });
		db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$eq: {$e2: "name"}}}}).then((cursor,matches) => { console.log("selected 4: ",cursor,matches); });
		db.select({e1name: {$e1: "name"},e2name: {$e2: "name"}}).from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: {$e1: "name"}}}})
			.then((cursor,matches) => { 
				console.log("selected 5: ",cursor,matches);
				let p;
				while(p = cursor.next()) {
					p.then((row) => { console.log(row); })
				}
			});

	});
});