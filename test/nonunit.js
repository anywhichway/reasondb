var ReasonDB = require("../index.js");

let dbType = ReasonDB.localForageDB,
	db = new ReasonDB("@key",dbType,"ReasonDB",true,true),
	a1 = new db.Entity({city:"Seattle",zipcode:{base:98101,plus4:1234}}),
	p1 = new db.Entity({name:"Mary",age:25,children:[1,2,3],address:a1}), 
	p2 = new db.Entity({name:"Joe",age:24,wife:p1,address:a1});
	p3 = new db.Entity({name:"Mary",birthday:new Date(1962,0,15)}); //16
db.Entity.index.put(p2).then(() => {
	db.Entity.index.match({address:{zipcode:{base:98101}}}).then((result) => {
		//expect(result.length).to.equal(2);
		console.log(result);
	});
})
