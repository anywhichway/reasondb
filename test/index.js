import {ReasonDB} from "../index.js";

const getChai = () => _chai;

var storage,
	db,
	authenticate,
	_chai;

class SWDB {
	constructor(name,location,options) {
		this.name = name;
		this.location = location;
		this.options = Object.assign({},options);
		if (typeof(navigator)!=="undefined" && navigator.serviceWorker) {
		  navigator.serviceWorker.register(`/swdb.js?name=${name}`)
		  .then(() => {
		  	if(this.onready) this.onready();
		  })
		  .catch(e => console.log(e));
		}
	}
	async clear() {
		const options = Object.assign({},this.options),
			path = this.location + "/swdb/" + this.name;
		options.method = "DELETE";
		const response = await fetch(path,options);
		if(response.ok) return await response.json();
		return false;
	}
	async getItem(key,direct) {
		const options = Object.assign({},this.options),
			path = this.location + "/swdb/" + this.name + (key[0]==="/" ? "" : "/") + key;
		options.method = "GET";
		if(direct) {
			
		}
		const response = await fetch(path,options),
			result = response.ok ? await response.json() : null;
		return result;
	}
	async setItem(key,value,{forward}={}) {
		const options = Object.assign({},this.options),
			path = this.location + "/swdb/" + this.name + (key[0]==="/" ? "" : "/") + key;
		options.method = "PUT";
		options.body = typeof(value)==="string" && value[0]==="{" && value[value.length-1]==="}" ? value : JSON.stringify(this);
		options.headers = {
				"Content-Type": "application/json; charset=utf-8",
				"Content-Length": options.body.length
		};
		const response = await fetch(path,options),
			txt = await response.text();
		return options.body===txt;
	}
	async removeItem(key,{forward}={}) {
		const options = Object.assign({},this.options),
			path = this.location + "/swdb/" + this.name + (key[0]==="/" ? "" : "/") + key;
		options.method = "DELETE";
		const response = await fetch(path,options);
		if(response.ok) return await response.json();
		return false;
	}
}

	console.log("Testing ...");
	
	xdescribe("load",function() {
		var performance;
		if(typeof(window)==="undefined") performance = { now: require("performance-now")};
		else performance = window.performance;
		it("put #",function(done) {
			const expireAt = new Date(),
				c = typeof(_chai)!=="undefined" ? _chai : chai;
			c.db.putItem({address:{city:"seattle",zipcode:{base:98101,plus4:0}}},{force:true,expireAt,atomic:true}).then(() => { done(); });
		});
		it("get #",function(done) {
			const expireAt = new Date(),
				c = typeof(_chai)!=="undefined" ? _chai : chai;
			c.db.putItem({address:{city:"seattle",zipcode:{base:98101,plus4:0}}},{force:true,expireAt,atomic:true}).then(() => { done(); });
		});
		it("put 250 no wait #",function(done) {
			const start = performance.now(),
				expireAt = new Date(),
				c = typeof(_chai)!=="undefined" ? _chai : chai;
			for(let i=0;i<250;i++) {
				c.db.putItem({id:i,address:{city:"seattle",zipcode:{base:98101,plus4:0}}},{force:true,expireAt,atomic:true});
			}
			//console.log("put 250 no wait rec/sec",250/(performance.now() - start));
			done();
		}).timeout(10000);
		it("put 250 await #",async function() {
			const start = performance.now(),
				expireAt = new Date();
			for(let i=250;i<500;i++) {
				await (_chai||chai).db.putItem({id:i,address:{city:"seattle",zipcode:{base:98101,plus4:0}}},{force:true,expireAt,atomic:true});
			}
			//console.log("put 250 await rec/sec",250/(performance.now() - start));
			return Promise.resolve();
		}).timeout(30000);
		it("get 250 await #",async function() {
			const start = performance.now(),
				c = typeof(_chai)!=="undefined" ? _chai : chai;
			for(let i=250;i<500;i++) {
				for await(const item of c.db.match({id:i})) { ; };
			}
			//console.log("get 250 await rec/sec",250/(performance.now() - start));
			return Promise.resolve();
		}).timeout(20000);
	});

	let o1,
		o2;
	
describe("basic",function() {
	it("auto create path",function(done) {
		db.get("/a/b/c").forEach(async node => {
			_chai.expect(node.path).equal("/a/b/c");
			done();
		});
	});
	it("direct primitive value",function(done) {
		db.get("/a/b").value(0).then(value => {
			try { _chai.expect(value).equal(0); } catch(e) { done(e); return; }
			done();
		});
	});
	it("second direct primitive value",function(done) {
		db.get("/a/b/c").value(0).then(value => {
			try { _chai.expect(value).equal(0); } catch(e) { done(e); return; }
			done();
		});
	});
	it("primitive value test /a/b:>=0/c:=>c==0",function(done) {
		db.get("/a/b:>=0/c:=>c==0")
			.value()
			.then(value => {
				try { _chai.expect(value).equal(0); } catch(e) { done(e); return; }
				done();
			});
	});
	it("primitive value predicate test /a/b/c:$gt(-1)",function(done) {
		db.get("/a/b/c:$gt(-1)")
			.value()
			.then(value => {
				try { _chai.expect(value).equal(0); } catch(e) { done(e); return; }
				done();
			});
	});
	it("path key test /==='a'/(key)=>key==='b':>=0/c:=>c==0",function(done) {
		db.get("/==='a'/(key)=>key==='b':>=0/c:=>c==0")
			.value()
			.then(value => {
				try { _chai.expect(value).equal(0); } catch(e) { done(e); return; }
				done();
			});
	});
	it("path predicate test /$eq('a')/b/c:$gt(-1)",function(done) {
		db.get("/$eq('a')/b/c:$gt(-1)")
			.value()
			.then(value => {
					try { _chai.expect(value).equal(0); } catch(e) { done(e); return; }
					done();
				});
	});
	it("direct object value",function(done) {
		db.get("/a/b/c/d").value({count:1}).then(value => {
			try { 
				_chai.expect(typeof(value)).equal("object"); _chai.expect(value.count).equal(1); 
			} catch(e) { done(e); return; }
			done();
		});
	}).timeout(3000);
	it("direct object patch",function(done) {
		db.get("/a/b/c/d").patch({count:2}).then(value => {
			try {
				_chai.expect(typeof(value)).equal("object"); _chai.expect(value.count).equal(2);
			} catch(e) { done(e); return; }
			done();
		});
	});
	it("on value change",function(done) {
		db.get("onvalue").forEach(async node => {
			await node.put(0);
			await node.on({change:value => { 
				try { _chai.expect(value).equal(1); } catch(e) { done(e); return; } done(); }});
			node.put(1);
		});
	});
	it("on value no change",function(done) {
		db.get("onvalue")
			.forEach(async node => {
				await node.put(1);
				await node.on({change:value => done(new Error("Un_chai.expected trigger firing"))});
				await node.put(1);
				done();
			});
	});
	it("on value get",function(done) {
		db.get("onvalue").forEach(async node => {
			await node.on({get:
					value => {
						return value + 1
					}
			});
			db.get("onvalue")
				.value()
				.then(value => {
					try { _chai.expect(value).equal(2); } catch(e) { done(e); return; }
					done();
				});
		});
	});
});
describe("match atomic",function() {
		it("nested",function(done) {
			db.putItem({expires:true, address:{city:"seattle",zipcode:{base:98101,plus4:0}}},{force:true,expireAt:new Date(),atomic:true}).then(value => o2 = value).then(object => {
					_chai.expect(object.address.city).equal("seattle");
					done();
			})
		}).timeout(4000);
		it("expire",function(done) {
			setTimeout(() => {
				let some = 0;
				db.match({expires:true}).forEach(object => { 
					console.log(object)
					some++; _chai.expect(object.address.city).equal("seattle");
				}).then(() => some ? done(new Error("_chai.expected result")) : done()).catch(e => done(e));
			},3000)
		}).timeout(5000);
});
describe("put merge",function() {
	it("put",function(done) {
		db.putItem({id:1,children:{2:true}})
			.then(object => {
				_chai.expect(object.id).equal(1);
				_chai.expect(object.children[2]).equal(true);
				done();
			})
	}).timeout(3000);
	it("match",function(done) {
		let some = 0;
		db.match({id:1,children:{2:true}})
			.forEach(object => { 
				some++; 
				_chai.expect(object.id).equal(1);
				object.children["3"] = true;
				object.children["2"] = false;
				db.putItem(object).then(object => {
					_chai.expect(object.children["3"]).equal(true);
					_chai.expect(object.children["2"]).equal(false);
					done();
				})
			}).then(() => some || done(new Error("Missing result"))).catch(e => done(e));
	}).timeout(3000);
});
describe("arbitration",function() {
	it("ignore past",function(done) {
		db.match({id:1})
			.forEach(object => {
				object.id=2;
				//object._ = Object.assign({},object._);
				//object._.modifiedAt = new Date(Date.now()-500);
				const metadata = Object.assign({},object._);
				object = Object.assign({},object);
				object.id=2;
				object["#"] = metadata["#"];
				object._ = metadata;
				object._.modifiedAt = new Date(object._.modifiedAt.getTime()-1);
				db.putItem(object).then(object => {
					_chai.expect(object).equal(undefined);
					done();
				}).catch(e => done(e))
			}).catch(e => done(e))
	});
	it("merge more recent",function(done) {
		db.match({id:1})
			.forEach(object => {
				object.id=2;
				object._.modifiedAt = new Date(object._.modifiedAt.getTime()+1);
				let some = 0;
				db.putItem(object).then(object => {
					_chai.expect(object.id).equal(2);
					done()
				}).catch(e => done(e))
			}).catch(e => done(e))
	}).timeout(5000);
	it("created latest",function(done) {
		db.match({id:2})
			.forEach(object => {
				object.id=3;
				object._.createdAt = new Date(object._.createdAt.getTime()+10);
				db.putItem(object).then(object => {
					_chai.expect(object.id).equal(3);
					done();
				}).catch(e => done(e))
			}).catch(e => done(e))
	}).timeout(5000);
	it("lexically less",function(done) {
		db.match({id:3})
			.forEach(object => {
				object.id=4;
				object._["#"] = object._["#"].substring(0,object._["#"].length-1);
				db.putItem(object).then(object => {
					_chai.expect(object.id).equal(4);
					done();
				}).catch(e => done(e))
			}).catch(e => done(e))
	});
	it("schedule future",function(done) {
		db.match({id:4}).forEach(object => {
			object.id=5;
			object._.modifiedAt = new Date(Date.now()+1000);
			db.putItem(object).then(object => {
				_chai.expect(object).equal(undefined);
				let some = 0;
				setTimeout(() => {
					db.match({id:5}).forEach(object => {
						some++;
					})
					.then(() => { some ? done() : done(new Error("Missing result"))}).catch(e => done(e));
				},5000);
			}).catch(e => done(e))
		}).catch(e => done(e))
	}).timeout(6000);
});
describe("matching", function() {
	describe("match",function() {
		xit("overhead ##", function(done) { done(); });
		it("secure",function(done) {
			Promise.all([
				db.get("Object/secret").on({get:value => "****"}),
				db.get("Object/protected").secure({},{"#":"user1"}),
				db.get("Object/hide").secure({write:true},{"#":"user1"}),
				db.get("Object/read").secure({read:true},{"#":"user1"}),
				db.get("Object/readwrite").secure({write:true},{"#":"user2"}),
				db.get("Object/age").secure({read:true,write:true},"*").then(edge => db.get("Object/age").secure({write:true},{"#":"user2"}))
			]).then(() => done())
		});
		it("putItem promised",function(done) {
			let some = 0;
			db.putItem({
				name:"mary",
				address:{city:"nyc"},
				geopoint: new db.GeoPoint()
				})
				.then(object => { _chai.expect(typeof(object["#"])).equal("string"); done(); })
				.catch(e => done(e));
		}).timeout(15000);
		it("put nested item",function(done) {
			db.putItem({
				birthday: _chai.TESTDATE,
				name:"joe",
				age:27,
				size:10,
				secret:24,
				hide: "hide",
				read: "read",
				readwrite: "readwrite",
				ssn:"555-55-5555",
				ip:"127.0.0.1",
				email: "joe@somewhere.com",
				address:{city:"seattle",zipcode:{base:98101,plus4:1}},
				notes: "loves how he lives",
				favoriteNumbers:[7,15,Infinity,NaN]})
				.then(value => o1 = value).then(object => {
					_chai.expect(object.name).equal("joe"); 
					_chai.expect(object.age).equal(27);
					done();
				})
		}).timeout(10000);
		it("wild card key",function(done) {
			let some = 0;
			db.match({$_:{$eq: "joe"}})
			.forEach(object => { some++; _chai.expect(object.name).equal("joe"); })
			.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("RegExp key",function(done) {
			let some = 0;
			db.match({[/.*name/]:{$eq: "joe"}})
			.forEach(object => { some++; _chai.expect(object.name).equal("joe"); })
			.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("partial",function(done) {
			let some = 0;
			db.match({name:"joe"},{partial:true})
				.forEach(object => { some++; _chai.expect(object.name).equal("joe"); _chai.expect(Object.keys(object).length).equal(1);})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("double property",function(done) {
			let some = 0;
			db.match({name:"joe",age:27})
				.forEach(object => { some++; _chai.expect(object.name).equal("joe"); _chai.expect(object.age).equal(27);})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("inline property",function(done) {
			let some = 0;
			db.match({[key => key==="age"]:{$lt:28}})
				.forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("inline value true",function(done) {
			let some = 0;
			db.match({age:value => value < 28})
				.forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("inline value false",function(done) {
			let some = 0;
			db.match({age:value => value < 27}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done(new Error("Un_chai.expected result")) :  done()).catch(e => done(e));
		});
		it("functional key",function(done) {
			let some = 0;
			db.match({[key => key==="name"]:{$typeof:"string"}})
				.forEach(object => { some++; _chai.expect(typeof(object.name)).equal("string"); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$",function(done) {
			let some = 0;
			db.match({name:{$:value=>value==="joe"}}).forEach(object => { some++; _chai.expect(object.name).equal("joe"); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$lt",function(done) {
			let some = 0;
			db.match({age:{$lt:28}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$lte",function(done) {
			let some = 0;
			db.match({age:{$lte:27}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$eq",function(done) {
			let some = 0;
			db.match({age:{$eq:27}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$eq string",function(done) {
			let some = 0;
			db.match({age:{$eq:"27"}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$eeq",function(done) {
			let some = 0;
			db.match({age:{$eeq:27}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$neq string",function(done) {
			let some = 0;
			db.match({age:{$neq:"5"}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$neeq",function(done) {
			let some = 0;
			db.match({age:{$neeq:5}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$eeq string",function(done) {
			let some = 0;
			db.match({age:{$eeq:"27"}}).forEach(object => { some++; })
				.then(() => some ? done(new Error("Extra result")) : done()).catch(e => done(e))
		});
		it("$between",function(done) {
			let some = 0;
			db.match({age:{$between:[26,28]}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$between inclusive",function(done) {
			let some = 0;
			db.match({age:{$between:[27,28,true]}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$outside higher",function(done) {
			let some = 0;
			db.match({age:{$outside:[25,26]}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$outside lower",function(done) {
			let some = 0;
			db.match({age:{$outside:[28,29]}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$gte",function(done) {
			let some = 0;
			db.match({age:{$gte:27}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$gt",function(done) {
			let some = 0;
			db.match({age:{$gt:26}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$echoes",function(done) {
			let some = 0;
			db.match({name:{$echoes:"jo"}}).forEach(object => { some++; _chai.expect(object.name).equal("joe");})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$instanceof by string",function(done) {
			let some = 0;
			db.match({favoriteNumbers:{$instanceof:"Array"}}).forEach(object => { 
				some++; 
				_chai.expect(object.favoriteNumbers.length).equal(4);
				})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$instanceof by constructor",function(done) {
			let some = 0;
			db.match({favoriteNumbers:{$instanceof:Array}}).forEach(object => { 
				some++; 
				_chai.expect(object.favoriteNumbers.length).equal(4);
				})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$isArray",function(done) {
			let some = 0;
			db.match({favoriteNumbers:{$isArray:null}}).forEach(object => { 
				some++; 
				_chai.expect(object.favoriteNumbers.length).equal(4);
				})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$isEmail",function(done) {
			let some = 0;
			db.match({email:{$isEmail:null}}).forEach(object => { some++; _chai.expect(object.name).equal("joe"); _chai.expect(object.email).equal("joe@somewhere.com");})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$isEven",function(done) {
			let some = 0;
			db.match({size:{$isEven:null}}).forEach(object => { some++; _chai.expect(object.name).equal("joe"); _chai.expect(object.size).equal(10);})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$isIPAddress",function(done) {
			let some = 0;
			db.match({ip:{$isIPAddress:null}}).forEach(object => { some++; _chai.expect(object.name).equal("joe"); _chai.expect(object.ip).equal("127.0.0.1");})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$isOdd",function(done) {
			let some = 0;
			db.match({age:{$isOdd:null}}).forEach(object => { some++; _chai.expect(object.name).equal("joe"); _chai.expect(object.age).equal(27);})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$isSSN",function(done) {
			let some = 0;
			db.match({ssn:{$isSSN:null}}).forEach(object => { some++; _chai.expect(object.name).equal("joe"); _chai.expect(object.age).equal(27);})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$in",function(done) {
			let some = 0;
			db.match({name:{$in:["joe"]}}).forEach(object => { some++; _chai.expect(object.name).equal("joe");})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$instanceof",function(done) {
			let some = 0;
			db.match({address:{$instanceof:Object}}).forEach(object => { some++; _chai.expect(object.address instanceof Object).equal(true)})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$instanceof cname",function(done) {
			let some = 0;
			db.match({address:{$instanceof:"Object"}}).forEach(object => { some++; _chai.expect(object.address instanceof Object).equal(true)})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$matches",function(done) {
			let some = 0;
			db.match({name:{$matches:["joe"]}}).forEach(object => { some++; _chai.expect(object.name).equal("joe"); _chai.expect(object.age).equal(27);})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$nin",function(done) {
			let some = 0;
			db.match({name:{$nin:["mary"]}}).forEach(object => { some++; _chai.expect(object.name).equal("joe");})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$typeof",function(done) {
			let some = 0;
			db.match({name:{$typeof:"string"}}).forEach(object => { some++; _chai.expect(typeof(object.name)).equal("string");})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$and single",function(done) {
			let some = 0;
			db.match({age:{$and:{$lt:28,$gt:26}}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$and nested",function(done) {
			let some = 0;
			db.match({age:{$and:{$lt:28,$and:{$gt:26}}}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$and array",function(done) {
			let some = 0;
			db.match({age:{$and:[{$lt:28},{$gt:26}]}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$or single",function(done) {
			let some = 0;
			db.match({age:{$or:{$eeq:28,$eq:27}}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$or nested",function(done) {
			let some = 0;
			db.match({age:{$or:{$eeq:28,$or:{$eeq:27}}}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$or array",function(done) {
			let some = 0;
			db.match({age:{$or:[{$eeq:28},{$eeq:27}]}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$xor",function(done) {
			let some = 0;
			db.match({age:{$xor:{$eeq:28,$eq:27}}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$not",function(done) {
			let some = 0;
			db.match({age:{$not:{$eeq:28}}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$not $xor",function(done) {
			let some = 0;
			db.match({age:{$not:{$xor:{$eeq:27,$eq:27}}}}).forEach(object => { some++; _chai.expect(object.age).equal(27); })
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("$search", function(done) {
			let some = 0;
			db.match({notes:{$search:"lover lives"}}).forEach(object => { some++; _chai.expect(object.notes.indexOf("loves")>=0).equal(true); })
			.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		for(const key of ["date","day","fullYear","hours","milliseconds","minutes","month","seconds","time","UTCDate","UTCDay","UTCFullYear","UTCHours","UTCSeconds","UTCMilliseconds","UTCMinutes","UTCMonth","year"]) {
			const fname = `get${key[0].toUpperCase()}${key.substring(1)}`;
			it("$" + key, Function("getChai",`return function(done) {
				let some = 0;
				getChai().db.match({birthday:{["$${key}"]:getChai().TESTDATE}}).forEach(object => { 
					some++; 
					//console.log(object);
					getChai().expect(object.birthday["${fname}"]()).equal(getChai().TESTDATE["${fname}"]()); 
				})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
			}`)(getChai));
			it("$" + key + " from time", Function("getChai",`return function(done) {
				let some = 0;
				//debugger;
				getChai().db.match({birthday:{time:{["$${key}"]:getChai().TESTDATE}}}).forEach(object => { 
					some++; 
					getChai().expect(object.birthday["${fname}"]()).equal(getChai().TESTDATE["${fname}"]()); 
				})
				.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
			}`)(getChai));
		}
		it("secret", function(done) {
			let some = 0;
			db.match({name:"joe"}).forEach(object => { some++; _chai.expect(object.name).equal("joe"); _chai.expect(object.secret).equal("****");})
					.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("handle Infinity and NaN ",function(done) {
			let some = 0;
			db.match({favoriteNumbers:{$isArray:null}})
				.forEach(object => { 
					some++; 
					_chai.expect(object.favoriteNumbers[2]).equal(Infinity);
					_chai.expect(typeof(object.favoriteNumbers[3])).equal("number");
					_chai.expect(isNaN(object.favoriteNumbers[3])).equal(true);
					})
					.then(() => some ? done() : done(new Error("Missing result")))
					.catch(e => done(e));
		});
		it("match nested",function(done) {
			let some = 0;
			db.match({address:{city:"seattle"}})
				.forEach(object => { some++; _chai.expect(object.address.city).equal("seattle")})
					.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
			});
		it("join",function(done) {
			let some = 0;
			db.join({name:{$neq:null}},{name:{$neq:null}},([o1,o2]) => o1.name===o2.name).forEach(record => { some++; _chai.expect(record.length).equal(2); _chai.expect(record[0].name).equal(record[1].name); })
			.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
		});
		it("find",async function() {
			try {
				const object = await db.match({address:{city:"seattle"}})
					.find(object => object.address.city==="seattle");
					_chai.expect(object.address.city).equal("seattle");
				} catch(e) { return e; }
		});
		it("findIndex",async function() {
			try {
				const i = await db.match({address:{city:"seattle"}}).findIndex(object => object.address.city==="seattle");
				_chai.expect(i).equal(0);
			} catch(e) { return e; }
		});
		it("findIndex not",async function() {
			try {
				const i = await db.match({address:{city:{$neq:null}}}).findIndex(object => object.address.city==="miami");
				_chai.expect(i).equal(-1);
			} catch(e) { return e; }
		});
		it("slice",function(done) {
			let some = 0;
			db.match({address:{city:"seattle"}}).slice().forEach(object => { 
				some++; _chai.expect(object.address.city).equal("seattle")
			})
			.then(() => {
				some ? done() : done(new Error("Missing result"));
			}).catch(e => done(e));
		});
		it("withMemory",function(done) {
			db.match({id:{$gt:0}}).withMemory().resolved[1].then(value => {
				_chai.expect(value.id).to.be.greaterThan(0);
				done();
			})
		});
		it("withMemory seek",function(done) {
			db.match({id:{$gt:0}}).withMemory({seek:true})[1].then(value => {
				_chai.expect(value.id).to.be.greaterThan(0);
				done();
			})
		});
		it("delete",function(done) {
			db.removeItem(o1).then(() => {
				let some = 0;
				db.match({name:"joe"}).forEach(object => { some++;})
						.then(() => some ? done(new Error("Extra result")) : done()).catch(e => done(e))
			});
		}).timeout(3000);
	});
});
describe("select projections", function() {
	it("$as",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string",$as:"Name"}})
			.forEach(object => { 
				some++;
				_chai.expect(typeof(object.Name)).equal("string");
				})
			.then(() => some ? done() : done(new Error("Missing result"))).catch(e => done(e));
	});
	it("$compute",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string"},computed:{$compute: function() { return this.name}}})
			.forEach(object => { 
				some++;
				_chai.expect(object.computed).equal(object.name);
				})
			.then(() => some ? done() : done(new Error("Missing result")))
			.catch(e => done(e));
	});
	it("$default",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string"},dummy:{$default: "dummy"}})
			.forEach(object => { 
				some++;
				_chai.expect(typeof(object.name)).equal("string");
				_chai.expect(object.dummy).equal("dummy");
				})
			.then(() => some ? done() : done(new Error("Missing result")))
			.catch(e => done(e));
	});
});
describe("validation", function() {
	it("$valid pass",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string",$valid:{$typeof: "string"}}})
			.forEach(object => { 
				some++;
				_chai.expect(typeof(object.name)).equal("string");
				})
			.then(() => some ? done() : done(new Error("Missing result")))
			.catch(e => done(e));
	});
	it("$valid fail",function(done) {
		db.match({name:{$typeof:"string",$valid:{$typeof: "number"}}})
			.some(() => true)
			.then(() => done(new Error("unexpected success")))
			.catch(e => done());
	});
});
describe("$freeze",function() {
	it("primitive",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string",$freeze:true}})
			.forEach(object => {
				some++;
				const {configurable,writable} = Object.getOwnPropertyDescriptor(object,"name");
				_chai.expect(configurable).equal(false);
				_chai.expect(writable).equal(false);
			})
			.then(() => some ? done() : done(new Error("Missing result")))
	});
	it("object and property",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string"},address:{$freeze:{}}})
			.forEach(object => {
				some++;
				const {configurable,writable} = Object.getOwnPropertyDescriptor(object,"address");
				_chai.expect(configurable).equal(false);
				_chai.expect(configurable).equal(false);
				_chai.expect(Object.isFrozen(object.address)).equal(true);
			})
			.then(() => some ? done() : done(new Error("Missing result")))
	});
	it("object and not property",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string"},address:{$freeze:{property:false}}})
			.forEach(object => {
				some++;
				const {configurable,writable} = Object.getOwnPropertyDescriptor(object,"address");
				_chai.expect(configurable).equal(true);
				_chai.expect(configurable).equal(true);
				_chai.expect(Object.isFrozen(object.address)).equal(true);
			})
			.then(() => some ? done() : done(new Error("Missing result")))
	})
});
describe("$return",function() {
	it("value",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string",$return:value=>value}})
			.forEach(object => {
				some++;
				_chai.expect(typeof(object.name)).equal("string");
			})
			.then(() => some ? done() : done(new Error("Missing result")))
	});
	it("configured",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string",$return:{enumerable:false}}})
			.forEach(object => {
				some++;
				const {enumerable,configurable} = Object.getOwnPropertyDescriptor(object,"name");
				_chai.expect(enumerable).equal(false);
				_chai.expect(configurable).equal(true);
			})
			.then(() => some ? done() : done(new Error("Missing result")))
	});
	it("configured $value",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string",$return:{$value:value=> 1}}})
			.forEach(object => {
				some++;
				_chai.expect(object.name).equal(1);
			})
			.then(() => some ? done() : done(new Error("Missing result")))
	});
	it("configured value",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string",$return:{value:1}}})
			.forEach(object => {
				some++;
				_chai.expect(object.name).equal(1);
			})
			.then(() => some ? done() : done(new Error("Missing result")))
	});
	it("nested",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string"},address:{$return:({city}) => city}})
			.forEach(object => {
				some++;
				_chai.expect(typeof(object.address)).equal("string");
			})
			.then(() => some ? done() : done(new Error("Missing result")))
	})
	it("nested get",function(done) {
		let some = 0;
		db.match({name:{$typeof:"string"},address:{$return:{get:()=>1}}})
			.forEach(object => {
				some++;
				_chai.expect(object.address).equal(1);
			})
			.then(() => some ? done() : done(new Error("Missing result")))
	})
});
class Person {
	constructor(config) {
		Object.assign(this,config);
	}
}
describe("sql-like syntax",function() {
	it("insert",function(done) {
		db.insert({name:"juliana",age:58},{name:"joe",age:56})
			.into(Person)
			.exec()
			.then(count => {
				_chai.expect(count).equal(2);
				done();
			});
	});
	it("select",function(done) {
		db.select()
			.from(Person)
			.exec()
			.forEach(() => true)
			.then((count) => {
				_chai.expect(count).equal(2);
				done()
			});
	});
	it("select random",function(done) {
		db.select()
			.from(Person)
			.exec()
			.random(1)
			.then((values) => {
				_chai.expect(Array.isArray(values)).equal(true);
				_chai.expect(values.length).equal(1);
				done()
			});
	});
	it("select random extra",function(done) {
		db.select()
			.from(Person)
			.exec()
			.random(3)
			.then((values) => {
				_chai.expect(Array.isArray(values)).equal(true);
				_chai.expect(values.length).equal(2);
				done()
			});
	});
	it("select sample",function(done) {
		db.select()
			.from(Person)
			.exec()
			.sample({me:.6,key:"age"})
			.then((values) => {
				_chai.expect(Array.isArray(values)).equal(true);
				_chai.expect(values.length).equal(1);
				done()
			});
	});
	it("select where",function(done) {
		db.select()
			.from(Person)
			.where({name:"juliana",age:{$eq:58}})
			.exec()
			.forEach((Person) => {
				_chai.expect(Person.name).equal("juliana");
				_chai.expect(Person.age).equal(58);
				done();
			});
	});
	it("select where same cname alias",function(done) {
		db.select()
			.from(Person)
			.where({Person:{name:"juliana",age:{$eq:58}}})
			.exec()
			.forEach((Person) => {
				_chai.expect(Person.name).equal("juliana");
				_chai.expect(Person.age).equal(58);
				done();
			});
	});
	it("select where aliased",function(done) {
		db.select()
			.from({p:Person})
			.where({p:{name:"juliana",age:{$eq:58}}})
			.exec()
			.forEach(({p}) => {
				_chai.expect(p.name).equal("juliana");
				_chai.expect(p.age).equal(58);
				done();
			});
	});
	it("select where aliased as",function(done) {
		db.select({p:{name:"Name",age:"Age",gender:{as:"Gender",default:"TBD"},halfAge:{default:({Age})=>Age/2},twiceAge:{default:({p}) => p.age*2}}}).from({p:Person})
			.where({p:{name:"juliana",age:{$eq:58}}})
			.exec()
			.forEach((item) => {
				_chai.expect(item.Name).equal("juliana");
				_chai.expect(item.Age).equal(58);
				_chai.expect(item.Gender).equal("TBD");
				_chai.expect(item.halfAge).equal(58/2);
				_chai.expect(item.twiceAge).equal(58*2);
				done();
			});
	});
	it("select where aliased avg",function(done) {
		db.select({p:{name:"Name",age:"Age",avgAge:{$: {avg:"age"}}}}).from({p:Person})
			.where({p:{name:"juliana",age:{$eq:58}}})
			.exec()
			.forEach((item) => {
				_chai.expect(item.Name).equal("juliana");
				_chai.expect(item.Age).equal(58);
				_chai.expect(item.avgAge).equal(58);
			})
			.then((count) => {
				_chai.expect(count).equal(1);
				done();
			});
	});
	it("select where aliased running avg",function(done) {
		db.select({p:{name:"Name",age:"Age",runningAvgAge:{$: {avg:"age",running:true}}}}).from({p:Person})
			.where({p:{age:{$gt: 50}}})
			.exec()
			.every((item) => {
				_chai.expect(item.runningAvgAge===56||item.runningAvgAge===58||item.runningAvgAge===57).equal(true);
				return true;
			})
			.then((count) => {
				_chai.expect(count).equal(2);
				done();
			})
	});
	it("select where join",function(done) {
		db.select()
			.from({p1:Person,p2:Person})
			.where({p1:{name:{$eq:"juliana"}},p2:{name:{$eq:{p1:{name:"$"}}}}})
			.exec()
			.every(({p1,p2}) => {
			p1.name==="juliana";
			p2.name==="juliana";
			return true;
		}).then(count => {
			_chai.expect(count>0).equal(true);
			done();
		});
	});
	it("select join",function(done) {
		db.select()
			.from({p1:Person})
			.join({p2:Person})
			.on(({p1,p2}) => p1.name==="juliana" && p1.name===p2.name ? {p1,p2} : false)
			.exec()
			.every(({p1,p2}) => p1.name==="juliana" && p1.name===p2.name)
			.then(count => { 
				_chai.expect(count>0).equal(true); 
				done(); 
			});
	});
	it("select join queries on",function(done) {
		db.select()
			.from({p1:db.select().from(Person)})
			.join({p2:db.select().from(Person)})
			.on(({p1,p2}) => p1.name==="juliana" && p1.name===p2.name ? {p1,p2} : false)
			.exec()
			.every(({p1,p2}) => {
				return p1.name==="juliana" && p1.name===p2.name
			})
			.then(count => { 
				_chai.expect(count>0).equal(true); 
				done(); 
			});
	});
	it("select join using",function(done) {
		db.select()
			.from({p1:Person})
			.join({p2:Person})
			.using("name")
			.exec()
			.every(({p1,p2}) => p1.name===p2.name)
			.then(count => { 
				_chai.expect(count).equal(2); 
				done(); 
			});
	});
	it("natural join",function(done) {
		db.select()
			.from({p1:Person})
			.natural()
			.join({p2:db.select().from(Person)})
			.exec()
			.some(({p1,p2}) => p1.name==="juliana" && p2.name==="juliana")
			.then(() => done());
	});
	xit("cross join",function(done) {
			db.select()
				.from({p1:Person})
				.cross()
				.join({p2:db.select().from(Person)})
				.exec()
				.forEach(item => console.log(item))
				.then(() => done()); //item.name==="juliana"
	});
	it("update",function(done) {
		db.update(Person)
			.set({age:60,city:"seattle"})
			.exec()
			.then(count => {
				_chai.expect(count).equal(2);
				done();
			})
	});
	it("update where",function(done) {
		db.update(Person)
			.set({age:61,city:"Bainbridge Island"})
			.where({name:"juliana"})
			.exec()
			.then(count => {
				_chai.expect(count).equal(1);
				done();
			})
	});
	it("delete none",function(done) {
		db.delete()
			.from(Person)
			.where({age:{$eq:58}})
			.exec()
			.then(count => {
				_chai.expect(count).equal(0);
				done();
			});
	});
	it("delete one",function(done) {
		db.delete()
			.from(Person)
			.where({age:{$eq:60}})
			.exec()
			.then(count => {
				_chai.expect(count).equal(1);
				done();
			});
	});
});

			function initDB({name,storage,promisify=false,workerArgumentList,workerInstanceVariable,workerName,peers,cache}={}) {
				return db = ReasonDB.db({
					name,
					clear: true,
					storage,
					graphPut:true,
					inline:true,
					indexDates:true, //"full",
					expirationInterval:1000,
					authenticate,
					explicitSearchable:true,
					promisify,
					workerInstanceVariable,
					workerArgumentList,
					workerName,
					cache,
					schema: {
						Object: {
							ctor: Object,
							searchable: {
								notes: true
							},
							secure: {
							//	"readwrite":{read:true,write:true,authorized:["user1"]}
							}
						}
					},
					peers,
					onError: (e) => { console.log(e); }
				});
			}
			if(typeof(window)==="undefined") {
				_chai = require("chai");
				//benchtest = require("benchtest");
				//BlockStore = require("blockstore");
				//scatteredStore = require('scattered-store');
				//KVVS = require("kvvs");
				
				const	Redis = require('ioredis');

				class RedisStorage extends Redis {
					constructor(...args) {
						super(...args);
					}
					async clear() {
						return this.flushdb();
					}
					async getItem(key) {
						return this.get(key);
					}
					async removeItem(key) {
						return this.del(key);
					}
					async setItem(key,value) {
						return this.set(key,value);
					}
				}
					
				const storage = new RedisStorage();
				
				before(function(done) {
				//storage = new KVVS("data/kvvs"); initDB(); done();
				//storage = new BlockStore("data/blockstore",{cache:true,clear:true,encoding:"utf8"}); initDB(); done();
				//storage = scatteredStore.create("data/scattered",() => { initDB(); done(); });
					storage.on("ready",() => {
						_chai.db = initDB({storage,promisify:true});
						_chai.TESTDATE = new Date();
						_chai.db.clear().then(() => done());
					});
				});
				/*beforeEach(function() { 
					benchtest.register(this.currentTest); 
					if(!benchtest.testable(this.currentTest)) {
						this.currentTest.skip(); 
					}
				});
				afterEach(function () { benchtest.test(this.currentTest); });
				after(() => benchtest.run({log:"md"}));*/
				
				
				authenticate = () => "user1";

				
			} else {
				authenticate = function() { 
					return authenticate.id || (authenticate.id = prompt("Enter user #")); 
				}
				authenticate();
				let storage;
				before(() => {
					//initDB({storage:ReasonDB.db.memoryStorage});
					chai.db = initDB({storage:window.localStorage,cache:true}); ////peers:{"http://localhost:8081/data":{}}
					chai.TESTDATE = new Date();
					_chai = chai;
					//storage = new SWDB("testdb","http://localhost:8080");storage.onready=()=>initDB({storage}); //,peers:{"http://localhost:8080/data":{}}
					//initDB({storage:localforage});
					//storage = localforage;initDB({workerInstanceVariable:"localforage",useWorker:true});
					//storage = localforage; localforage.config({driver:localforage.WEBSQL});
					//storage = new IdbKvStore("idbkvstore");initDB();
					//storage = new IdbKvStore("idbkvstore");initDB({workerArgumentsList:["idbkvstore"],useWorker:true,workerName:"IdbKvStore"});
					//initDB({storage:new Idbkv("idbkv"));
				});
			}

		
		



