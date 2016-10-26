# reasondb

A 100% native JavaScript client and server database with a SQL like syntax, streaming analytics, 18 built-in predicates (including soundex and RegExp matching), in-line fat arrow predicates, predicate extensibility, fully indexed Dates and Arrays, joins, nested matching, and swapable persistence engines in as little as 45K.


# Installation

npm install reasondb

# Basic Use

## Loading

Users of Chrome 54.0 and greater can use the file at src\index.js so long as node-uuid is loaded first (45K): 

```
<script src="../node_modules/node-uuid/uuid.js"></script>
<script src="../browser/reasondb.js"></script>
```

A browserified version is located at browser\reasondb.js (755K). It will operate in Chrome and Firefox. Microsoft Edge throws undown errors.

```
<script src="../browser/reasondb.js"></script>
```

Node.js users can use a smaller babelified version with normal `require` syntax. The code actually loaded is in `lib\index.js` (81K): 

```
require("index.js");
```

**Note**: Preliminary tests show ReasonDB running 25% faster using native Promises in Chrome rather than Bluebird, which is frequently used to try and get a performance boost.

## Example

The ReasonDB query language JOQULAR (JavaScript Object Query Language Representation) is designed to look and behave like SQL; however is also supports nested objects, the return of matching JavaScript instances, and streaming analytics. Below are examples of each primary operation supported drawn from code in the `examples/basic` directory:

```
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
db.when({$p: {name: {$neq: null}}}).from({$p: Person}).select().then((cursor) => { 
	cursor.forEach((row) => {
		console.log("New " + row[0].constructor.name + ":",JSON.stringify(row[0]));
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
	        		  
	        	   });
	           });
```

Review other files in the example directory or the unit tests under the test directory for more examples. Examples and unit tests can be run in the browser by loading the index.html file. The same examples and tests can be run in node.js by executing the index.js file.

**Note**: Mocha and Instanbul currently break with ReasonDB under NodeJS even though they work inthe browser. Test code is "decaffinated" prior to executing in NodeJS.

# JOQULAR

## Insert

## Delete

## Select

## Predicates

$ - Inline test, e.g. '{age:{$:(value)=> { return typeof(value)==="number" && value>=21; }}}'.

$typeof - Ensures the value in a property is of the type specified, e.g. '{id: {$typeof: "number"}}'.

$lt - Less than test, e.g. '{age: {$lt: 21}}'. Aliased to `<`, e.g. '{age: {"<": 21}}'.

$lte - Less than or equal test, e.g. '{age: {$lte: 21}}'. Aliased to `<=`, e.g. '{age: {"<=": 21}}'.

$eq - Relaxed equal test, e.g. '{age: {$eq: 21}}' and `{age: {$eq: "21"}}` will match the same objects. Aliased to `==`.

$neq - Relaxed not equal test, e.g. '{age: {$neq: 21}}' or `{age: {$neq: "21"}}` will match the same objects. Aliased to `!=`.

$neeq - Not exact equal test, e.g. '{age: {$neq: 21}}' or `{age: {$neq: "21"}}` will not match the same objects since type is taken into consideration. Aliased to `!==`.

$eeq - Exact equal test, e.g. '{age: {$eq: 21}}' and `{age: {$eq: "21"}}` will not match the same objects since type is taken into consideration. . Aliased to `===`.
Index["==="] = $eeq;

$gte - Greater than or equal test, e.g. '{age: {$gte: 21}}'. Aliased to `>=`, e.g. '{age: {">=": 21}}'.

$gt - Greater than test, e.g. '{age: {$gt: 21}}'. Aliased to `>`, e.g. '{age: {">": 21}}'.

$echoes - Implements soundex comparison, e.g. `{name:{$echoes:"Jo"}}` would match an object with `{name: "Joe"}`.

$matches - Implements RegExp mathing, e.g. `{name:{$matches: <RegExp>}}`. RegExp can either be a regular expression using shorthand notation, or a string that looks like a regular expression, i.e starts and ends with `/`.

$in - Tests to see if a value is in the specified sequence, e.g. `{age:{$in:[24,25]}}` only matches 24 and 25. Types must match.

$nin - Tests to see if a value is not in the specified sequence, e.g. `{age:{$nin:[24,25]}}` matches everything except 24 and 25. Types must match.

$between - Tests to see if a value is between the first and second elements, e.g. `{age:{$between:[24,25,true]}}`. The flag `true` includes the boundaries in the test. Types must match.

$outside - Tests to see if a value is outside the first and second elements, e.g. `{age:{$outside:[24,25]}}`. Types must match.

## Array Matching

Arrays are treated like objects for matching, e.g. `{children: {1:"Joe"}}`, matches an object `{children:["Mary","Joe"]}`.

The max, average and min values of all arrays are indexed and can be tested using special predicates:

$max - `{sizes: {$max: 5}}` matches `{sizes: [3,5,4,2]}`.
$avg - `{sizes: {$avg: 3.5}}` matches `{sizes: [3,5,4,2]}`.
$min - `{sizes: {$min: 2}}` matches `{sizes: [3,5,4,2]}`.

## Date Matching

All the properties equivalent to the get methods on Date objects are indexed, e.g. getMonth can be matched as `{month: <some month>}` and getUTCMonth as `{UTCMonth: <some month>}`.

#Extending ReasonDB

## Adding Predicates

## Adding Persistence Engines

# Building & Testing

Building, testing and quality assessment are conducted using Travis, Mocha, Chai, Istanbul, Code Climate, and Codacity.

For code quality assessment purposes, the cyclomatic complexity threshold is set to 10.

# Notes


# Updates (reverse chronological order)

2016-10-25 v0.0.3 First npm publication.


# License

This software is provided as-is under the [MIT license](https://opensource.org/licenses/MIT).