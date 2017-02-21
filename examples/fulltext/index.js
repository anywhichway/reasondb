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
let db = new ReasonDB("./examples/basic/db","@key",ReasonDB.LocalStore,true,true,{ironCacheClient:IronCacheClient,redisClient:RedisClient,memcachedClient:MemJSClient,levelUPClient:LevelUPClient});


// Define a Book class. Classes are optional. ReasonDB can store items of type Object, Array, and Date by default.
class Book {
	constructor(title,summary) {
		this.title = title;
		this.summary = summary;
	}
}
Book.fullTextKeys = ["summary"];


// Insert Objects into the Person index casting it to a Person as it is inserted.
db.insert(
	new Book("JavaScript","This book is a very long book about how to code JavaScript applications."),
	new Book("JavaScript","This book is a very short book on the history of JavaScript."),
	new Book("C#","This book is a very long book about how to code C# applications."),
	new Book("C++","This book is a very long book about how to code C++ applications.")
).into(Book).exec().then(() => {
	db.select({title: {$b: "title"}}).from({$b: Book}).where({$b: {summary: {$search: "code"}}}).exec().then((cursor) => {
		cursor.forEach((row) => {
			console.log(row); //prints 3 rows
		});
	});
	db.select({title: {$b: "title"}}).from({$b: Book}).where({$b: {title: {$contains: "JavaScript"}, summary: {$search: "code"}}}).exec().then((cursor) => {
		cursor.forEach((row) => {
			console.log(row); //prints 1 row
		});
	});
	db.select({title: {$b: "title"}}).from({$b: Book}).where({$b: {summary: {$search: "javascript"}}}).exec().then((cursor) => {
		cursor.forEach((row) => {
			console.log(row); //prints 2 rows
		});
	});
});

	




