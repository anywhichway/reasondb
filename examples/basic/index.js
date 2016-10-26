var ReasonDB;
if(typeof(window)==="undefined") {
	ReasonDB = require("../../lib/index.js");
}
let db = new ReasonDB("./examples/basic/db","@key",ReasonDB.LocalStore,true,true);

class Person {
	constructor(name,birthday) {
		this.name = name;
		this.birthday = birthday;
	}
}
db.index(Person);
/*db.when({$p: {name: {$neq: null}}}).from({$p: Person}).select().then((cursor) => { 
	cursor.forEach((row) => {
		console.log("New " + row[0].constructor.name + ":",JSON.stringify(row[0]));
	});
});*/
Promise.all([
	           db.insert({name:"Mary",birthday:new Date("1961-01-15")}).into(Object).as(Person).exec(),
	           db.insert(new Person("Joe",new Date("1961-01-15"))).into(Object).exec(),
	           db.insert({name:"Joe",birthday:new Date("1960-01-16")}).into(Object).exec(),
	           db.insert({name:"Bill",birthday:new Date("1960-01-16")}).into(Object).as(Person).exec()
	           ]).then(() => {
	        	   db.delete().from({$p: Person}).where({$p: {name: "Joe"}}).exec().then((result) => {
	        		   console.log("Deleted:",result);
	        	   }).then(() => {
	        		   db.select().from({$p: Person}).where({$p: {name: {$neq: null}}}).exec().then((cursor) => {
	        			  cursor.forEach((row) => { console.log("Person",JSON.stringify(row[0])); }); 
	        		   });
	        		   db.select().from({$p: Person}).where({$p: {name: {$neq: null}}}).exec().then((cursor) => {
	        			  cursor.forEach((row) => { console.log("Object",JSON.stringify(row[0])); }); 
	        		   });
	        		   db.select().from({$p1: Person, $p2: Person}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}}).exec().then((cursor) => {
		        			  cursor.forEach((row) => { console.log("Pair:",JSON.stringify(row[0]),JSON.stringify(row[1])); }); 
		        	   });
	        		   db.select().from({$p: Person}).where({$p: {name: {$neq: null}, birthday:{date:14,month:0}}}).exec().then((cursor) => {
	        			  cursor.forEach((row) => { console.log("Born Jan 15th:",JSON.stringify(row[0])); }); 
	        		   });
	        		  
	        	   });
	           });
	




