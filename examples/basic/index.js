var ReasonDB;
if(typeof(window)==="undefined") {
	ReasonDB = require("../../lib/index.js"); // Load ReasonDB if running on the server.
}
// Create a database at the directory location provided using @key as the primary key on all objects.
// Store data using localStorage. In the browser this is window.localStorage and the directory location is ignored.
// On the server JSON files are created. The arguments `true` and `true` force the sharing of indexes across
// objects and the creation of new storage and indexes each time the example is run.
let db = new ReasonDB("./examples/basic/db","@key",ReasonDB.LocalStore,true,true);

// Define a Person class. Classes are optional. ReasonDB can store items of type Object, Array, and Date by default.
class Person {
	constructor(name,birthday) {
		this.name = name;
		this.birthday = birthday;
	}
}
// Let the database know that Person instances should be indexed. The index will be shared with Object based on the
// database creation parameters above.
db.index(Person);
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
				 // Insert an Object into the Object index casting it to a Person as it is inserted.
	           db.insert({name:"Mary",birthday:new Date("1961-01-15")}).into(Object).as(Person).exec(),
	           // Insert a person into the Object index.
	           db.insert(new Person("Joe",new Date("1961-01-15"))).into(Object).exec(),
	           // Insert an Object that looks like a Person into the Object index.
	           db.insert({name:"Joe",birthday:new Date("1960-01-16")}).into(Object).exec(),
	           // Insert another Object into the Object index casting it to a Person as it is inserted.
	           db.insert({name:"Bill",birthday:new Date("1960-01-16")}).into(Object).as(Person).exec()
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
	        		   // Select and print Objects with non-null names. There will be three since Person's are instances of Objects
	        		   // and are stored in the Object index.
	        		   db.select().from({$p: Object}).where({$p: {name: {$neq: null}}}).exec().then((cursor) => {
	        			  cursor.forEach((row) => { console.log("Object",JSON.stringify(row[0])); }); 
	        		   });
	        		   // Print all possible pairs of Person not paired with themselves. There will be two, Mary and Bill plus Bill and Mary.
	        		   db.select().from({$p1: Person, $p2: Person}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}}).exec().then((cursor) => {
		        			  cursor.forEach((row) => { console.log("Pair:",JSON.stringify(row[0]),JSON.stringify(row[1])); }); 
		        	   });
		        	   // Select a Person born on January 15th regardless of year.
	        		   db.select().from({$p: Person}).where({$p: {name: {$neq: null}, birthday:{date:14,month:0}}}).exec().then((cursor) => {
	        			  cursor.forEach((row) => { console.log("Born Jan 15th:",JSON.stringify(row[0])); }); 
	        		   });
	        		   // Update the partner for all Persons, the last update will "win"
	        		   db.update({$p1: Person, $p2: Person}).set({$p1: {partner: {$p2: "name"}}, $p2: {partner: {$p1: "name"}}}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}}).exec().then((count) => {
	        			  console.log(count + " updates"); 
	        		   });
	        	   });
	           });
	




