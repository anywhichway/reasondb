var ReasonDB,
	IronCacheClient,
	RedisClient,
	MemJSClient;
if(typeof(window)==="undefined") {
	ReasonDB = require("../../lib/index.js"); // Load ReasonDB if running on the server.
	//IronCacheClient = require("iron-cache").createClient({"project":"/","token":"/"});
	//RedisClient = require("redis").createClient(,"",{no_ready_check: true});
	//RedisClient.auth("",function(err) {
	//	if(err) {
	//		console.log(err);
	//	}
	//});
	//RedisClient.on("connect", function() {
	//    console.log('Connected to Redis');
	//});
	//MemJSClient = require("memjs").Client.create("",{username: "", password:""});
}
//Create a database at the directory location provided using @key as the primary key on all objects.
//Store data using localStorage. In the browser this is window.localStorage and the directory location is ignored.
//On the server JSON files are created. The first argument `true` forces the creation of new storage and indexes each 
//time the example is run, the second ensures objects are activated.
let db = new ReasonDB("./examples/basic/db","@key",ReasonDB.LocalStore,true,true,{ironCacheClient:IronCacheClient,redisClient:RedisClient,memcachedClient:MemJSClient});


// Define a Person class. Classes are optional. ReasonDB can store items of type Object, Array, and Date by default.
class Person {
	constructor(name,birthday) {
		this.name = name;
		this.birthday = birthday;
	}
}
// Create a streaming analytics rule that fires every time a Person is added to the database.
db.when({$p: {name: {$neq: null}, partner: undefined}}).from({$p: Person}).select().then((cursor) => { 
	cursor.forEach((row) => {
		console.log("New " + row[0].constructor.name + ":",JSON.stringify(row[0]));
	});
});
//Create a streaming analytics rule that fires every time a Person is updated with a partner.
db.when({$p: {partner: {$neq: null}}}).from({$p: Person}).select().then((cursor) => { 
	cursor.forEach((row) => {
		console.log("Updated " + row[0].constructor.name + ":",JSON.stringify(row[0]));
	});
});
Promise.all([
           // Insert Objects into the Person index casting it to a Person as it is inserted.
           db.insert({name:"Mary",birthday:new Date("1961-01-15")}).into(Person).exec(),
           db.insert({name:"Bill",birthday:new Date("1960-01-16")}).into(Person).exec(),
           // Insert a person into the Person index.
           db.insert(new Person("Joe",new Date("1961-01-15"))).into(Person).exec(),
           // Insert an Object that looks like a Person into the Object index.
           db.insert({name:"Bill",birthday:new Date("1960-01-16")}).into(Object).exec(),
           ]).then(() => {
           	// Delete a Person from the database where the name is "Joe". This will not match the Object
           	// that looks like a person. It will only match one object, the Joe that is a Person.
        	   db.delete().from({$p: Person}).where({$p: {name: "Joe"}}).exec().then((result) => {
        		   console.log("Deleted:",result);
        	   }).then(() => {
        	   	   // Select and print Person's with non-null names. There will be two.
        		   db.select().from({$p: Person}).where({$p: {name: {$neq: null}}}).exec().then((cursor) => {
        			  cursor.forEach((row) => { console.log("Person",JSON.stringify(row[0])); }); 
        		   });
         		   // Print all possible pairs of Person not paired with themselves. 
        		   // There will be two, Mary and Bill plus Bill and Mary.
        		   db.select().from({$p1: Person, $p2: Person}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}}).exec().then((cursor) => {
	        			  cursor.forEach((row) => { console.log("Pair:",JSON.stringify(row[0]),JSON.stringify(row[1])); }); 
	        	   });
        		   // Print all possible pairs of Person paired to named Objects with the same name and birthday. 
        		   // There will be one Bill.
        		   db.select().from({$p: Person, $o: Object}).where({$p: {name: {$o: "name"}}}).exec().then((cursor) => {
	        			  cursor.forEach((row) => { console.log("Cross Pair:",JSON.stringify(row[0]),JSON.stringify(row[1])); }); 
	        	   });
	        	   // Select a Person born on January 15th regardless of year.
        		   db.select().from({$p: Person}).where({$p: {name: {$neq: null}, birthday:{date:14,month:0}}}).exec().then((cursor) => {
        			  cursor.forEach((row) => { console.log("Born Jan 15th:",JSON.stringify(row[0])); }); 
        		   });
        		   // Update the partner for all Persons, the last update will "win"
        		   db.update({$p1: Person, $p2: Person}).set({$p1: {partner: {$p2: "name"}}, $p2: {partner: {$p1: "name"}}}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}}).exec();
        	   });
           });
	




