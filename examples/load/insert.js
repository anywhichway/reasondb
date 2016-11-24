var ReasonDB,
	IronCacheClient,
	RedisClient,
	MemJSClient,
	LevelUPClient;
if(typeof(window)==="undefined") {
	//Promise = require("bluebird");
	//Promise.longStackTraces();
	ReasonDB = require("../../src/index.js"); // Load ReasonDB if running on the server.
	let levelup = require("levelup");
	LevelUPClient = levelup; //("./examples/basic/db");
}
//Create a database at the directory location provided using @key as the primary key on all objects.
//Store data using localStorage. In the browser this is window.localStorage and the directory location is ignored.
//On the server JSON files are created. The first argument `true` forces the creation of new storage and indexes each 
//time the example is run, the second ensures objects are activated.
let db = new ReasonDB("./examples/load/db","@key",ReasonDB.MemStore,true,true,{ironCacheClient:IronCacheClient,redisClient:RedisClient,memcachedClient:MemJSClient,levelUPClient:LevelUPClient});


// Define a Person class. Classes are optional. ReasonDB can store items of type Object, Array, and Date by default.
class Person {
	constructor(name,birthday) {
		this.name = name;
		this.birthday = birthday;
	}
}
// Create a streaming analytics rule that fires every time a Person is added to the database.
//db.when({$p: {name: {$neq: null}, partner: undefined}}).from({$p: Person}).select().then((cursor) => { 
//	cursor.forEach((row) => {
//		console.log("New " + row[0].constructor.name + ":",JSON.stringify(row[0]));
//	});
//});

function now() {
	if(typeof(window)!=="undefined") {
		return window.performance.now();
	}
	return Date.now();
}
let count = 1000,
	data = [];
while(data.length<count) {
	data.push({name:"person"+data.length});
}
let start =  now(),
	next;
db.insert(...data).into(Person).exec().then((results) => {
	next = now();
	console.log("records/sec ", count/((next-start)/1000));
}).then(() => {
	db.select().from({$p: Person}).where({$p: {name: {$neq: null}}}).exec().then((cursor) => {
		let end = now();
		console.log("records/sec ", cursor.maxCount/((end-next)/1000));
	});
});



	




