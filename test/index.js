var chai, chaiAsPromised, expect, ReasonDB, iIndexedDB;
if(typeof(window)==="undefined") {
	chai = require("chai");
	//chaiAsPromised = require("chai-as-promised");
	//chai.use(chaiAsPromised);
	expect = chai.expect;
	ReasonDB = require("../index.js");
}




function Log() {
	//console.log(...arguments);
}

function unmocha() {
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
//unmocha();

// property/value/type/classname/id   classname is the entry point
// property/value/classname/classname/id ... match(value,test,classname,results)

//[MemStore].forEach((dbType) => { // LocalForageStore
//	if(!dbType) { return; }
dbType = MemStore;
//	describe(dbType.name, function() {
		//this.timeout(5000);
		//delete Object.index;
		//delete Array.index;
		//delete Date.index;
		
		let db = new Database("Test","@key",dbType,true,true),
				w1results,
				w2results,
				w3results,
				/*w1 = db.select().from({$e1: db.Entity}).when({$e1: {name: {$eq: "Joe"}}}).then((results) => {  w1results = results;  }),
				w2 = db.select().from({$e1: db.Entity,$e2: db.Entity}).when({$e1: {name: {$eq: "Mary"}}, $e2: {name: {$eq: "Joe"}}}).then((results) => { w2results = results; }),
				w3 = db.select().from({$e1: db.Entity,$e2: db.Entity}).when({$e1: {name: {$e2: "name"}}}).then((results) => { Log("fire 3: ",results); w3results = results; }),*/
			//	a1 = new db.Entity({city:"Seattle",zipcode:{base:98101,plus4:1234}}),
			//	p1 = new db.Entity({name:"Mary",age:25,children:[1,2,3],address:a1}), 
			//	p2 = new db.Entity({name:"Joe",age:24,wife:p1,address:a1});
			//	p3 = new db.Entity({name:"Mary",birthday:new Date(1962,0,15)});  //16 
				a1 = {city:"Seattle",zipcode:{base:98101,plus4:1234}},
				p1 = {name:"Mary",age:25,children:[1,2,3],address:a1}, 
				p2 = {name:"Joe",age:24,wife:p1,address:a1};
				p3 = {name:"Mary",birthday:new Date(1962,0,15)};  //16 
		//let promises = [db.Entity.index.put(p2), db.Entity.index.put(p3)];
				Object.index.put(p2); Object.index.put(p3);
		let promises = [Object.index.put(p2), Object.index.put(p3)];
		Promise.all(promises).then(() => {
			//p3.birthday.setDate(15);
			console.log("ok");
			/*describe("queries", function() {
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
					db.select().from({$e1: db.Entity,$e2: db.Entity}).where({$e1: {name: {$e2: "name"}}}).then((cursor) => { 
						expect(cursor.count).to.equal(3); 
						done(); });
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
				it('match: {address:{zipcode:{base:98101}}}', function(done) {
					db.Entity.index.match({address:{zipcode:{base:98101}}}).then((result) => {
						expect(result.length).to.equal(2);
						done();
					})
				}); 
				it('match: {wife:{name:"Mary",children:{1:2}}}', function(done) {
					let result = db.Entity.index.match({wife:{name:"Mary",children:{1:2}}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {wife:{name:"Mary",children:{1:1}}}', function(done) {
					let result = db.Entity.index.match({wife:{name:"Mary",children:{1:1}}}).then((result) => {
						expect(result.length).to.equal(0);
						done();
					});
				});
				it('match: {children:{length:3}}}', function(done) {
					db.Entity.index.match({children:{length:3}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {children:{$min:1}}}', function(done) {
					db.Entity.index.match({children:{$min:1}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {children:{$max:3}}}', function(done) {
					db.Entity.index.match({children:{$max:3}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {children:{$avg:2}}}', function(done) {
					db.Entity.index.match({children:{$avg:2}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {zipcode:{base:98101}}', function(done) {
					db.Entity.index.match({zipcode:{base:98101}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {birthday:{date:15,day:1}}', function(done) {
					db.Entity.index.match({birthday:{date:15,day:1}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {date:15}', function(done) {
					db.Entity.index.match({date:15}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {age:{$:(value)=> { return typeof(value)==="number" && value>=21; }}}', function(done) {
					db.Entity.index.match({age:{$:(value)=> { return typeof(value)==="number" &&  value>=25; }}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {age:{$:(value)=> { return typeof(value)==="number" && value<=21; }}}', function(done) {
					db.Entity.index.match({age:{$:(value)=> { return typeof(value)==="number" && value<=24; }}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {age:{$lt:25}}', function(done) {
					db.Entity.index.match({age:{$lt:25}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {age:{$lte:24}}', function(done) {
					db.Entity.index.match({age:{$lte:24}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {age:{$eq:24}}', function(done) {
					db.Entity.index.match({age:{$eq:24}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {age:{$neq:24}}', function(done) {
					db.Entity.index.match({age:{$neq:24}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {age:{$gte:25}}', function(done) {
					db.Entity.index.match({age:{$gte:25}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {age:{$gt:24}}', function(done) {
					db.Entity.index.match({age:{$gt:24}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {age:{$in:[24,25]}}', function(done) {
					db.Entity.index.match({age:{$in:[24,25]}}).then((result) => {
						expect(result.length).to.equal(2);
						done();
					});
				});
				it('match: {age:{$nin:[34,35]}}', function(done) {
					db.Entity.index.match({age:{$nin:[34,35]}}).then((result) => {
						expect(result.length).to.equal(2);
						done();
					});
				});
				it('match: {age:{$between:[24,25,true]}}', function(done) {
					db.Entity.index.match({age:{$between:[24,25,true]}}).then((result) => {
						expect(result.length).to.equal(2);
						done();
					});
				});
				it('match: {age:{$between:[24,25]}}', function(done) {
					db.Entity.index.match({age:{$between:[24,25]}}).then((result) => {
						expect(result.length).to.equal(0);
						done();
					});
				});
				it('match: {age:{$outside:[23,24]}}', function(done) {
					db.Entity.index.match({age:{$outside:[22,23]}}).then((result) => {
						expect(result.length).to.equal(2);
						done();
					});
				});
				it('match: {name:{$matches:"Joe"}}', function(done) {
					db.Entity.index.match({name:{$matches:"Joe"}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('match: {name:{$echoes:"Joe"}}', function(done) {
					db.Entity.index.match({name:{$echoes:"Joe"}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
				it('instances: {wife:{name:"Mary",children:{1:2}}}',function(done) {
					db.Entity.index.match({wife:{name:"Mary",children:{1:2}}}).then((result) => {
						// resolves ids to their instances
						db.Entity.index.instances(result).then((instances) => {
							expect(instances.length).to.equal(1);
							expect(instances[0]).to.be.instanceOf(db.Entity);
							done();
						});
					})
					
				});
				it('flush and match: {wife:{name:"Mary",children:{1:2}}}', function(done) {
					let key = p3["@key"];
					this.timeout(3000);
					db.Entity.index.flush(key);
					db.Entity.index.match({wife:{name:"Mary",children:{1:2}}}).then((result) => {
						expect(result.length).to.equal(1);
						done();
					});
				});
			});
			*/
			/*describe("index access",function() {
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
						db.Entity.index.put(p2).then(() => {
							done();
						})
					});
				});
			});*/
			/*describe("streaming analytics",function() {
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
			});*/
		});
//	})
//});
