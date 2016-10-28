# reasondb

A 100% native JavaScript client and server database with a SQL like syntax, columnar projections, object instance result sets, streaming analytics, 18 built-in predicates (including soundex and RegExp matching), in-line fat arrow predicates, predicate extensibility, fully indexed Dates and Arrays, joins, nested matching, swapable persistence engines, and automatic synchronization of object changes into the database and indexes in as little as 45K.


## Installation

npm install reasondb

## Basic Use

### Loading

Users of Chrome 54.0 and greater can use the file at src\index.js so long as node-uuid is loaded first (45K): 

```
<script src="../node_modules/node-uuid/uuid.js"></script>
<script src="../browser/reasondb.js"></script>
```

A browserified version is located at browser/reasondb.js (755K). It will operate in Chrome and Firefox. Microsoft Edge throws undown errors.

```
<script src="../browser/reasondb.js"></script>
```

Node.js users can use a smaller babelified version with normal `require` syntax. The code actually loaded is in `lib/index.js` (81K): 

```
require("index.js");
```

**Note**: Preliminary tests show ReasonDB running 25% faster using native Promises in Chrome rather than Bluebird, which is frequently used to try and get a performance boost.

### Example

The ReasonDB query language JOQULAR (JavaScript Object Query Language Representation) is designed to look and behave like SQL; however is also supports nested objects, the return of matching JavaScript instances, and streaming analytics. Below are examples of each primary operation supported drawn from code in the `examples/basic` directory:

```
var ReasonDB;
if(typeof(window)==="undefined") {
	ReasonDB = require("../../lib/index.js"); // Load ReasonDB if running on the server.
}

// Create a database at the directory location provided using @key as the primary key on all objects.
// Store data using localStorage. In the browser this is window.localStorage and the directory location is ignored.
// On the server JSON files are created. The arguments `true`, `true`, and `true` force the sharing of indexes across
// objects, the creation of new storage and indexes each time the example is run, and the activation of all inserted objects
// such that changes to them automatically update the database and indexes.

let db = new ReasonDB("./examples/basic/db","@key",ReasonDB.LocalStore,true,true,true);

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
	        		   db.update({$p1: Person, $p2: Person}).set({$p1: {partner: {$p2: "name"}}, $p2: {partner: {$p1: "name"}}}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}}).exec();
	        	   });
	           });
```

Review other files in the example directory or the unit tests under the test directory for more examples. Examples and unit tests can be run in the browser by loading the index.html file. The same examples and tests can be run in node.js by executing the index.js file.

**Note**: Mocha and Instanbul currently break with ReasonDB under NodeJS even though they work in the browser. Test code is "decaffinated" prior to executing in NodeJS.

## JOQULAR

The notation below uses the following conventions:

1) Elements replaced by the developer are contained in angle brackets, `< >`.

2) Optional elements are further surrounded by square brackets, e.g. `[< >]`.

3) Elipses, `...`, indicates the immediatly previous form can be repeated.

### Patterns

Query patterns take the top level form: `{<classVariable>: {<property>: {<predicate>: <value> [,...]} [,...} [,...}`.

`classVariable` refers to a variable created in a `from` clause, e.g. `{$o1: Object}` creates the variable `$o1`. Variables must start with a `$` sign.

`predicate` can be any of the supported predicates, see Predicates below.

Continuing with the `$o1` variable: `{$o1: {age: {$gte: 18, $lte: 20}, state: {$in: ["OH","IN","WA"]}}` matches all objects with age betwen 18 and 20 inclusive in the states of Ohio, Indiana, and Washington.

### Insert

`db.insert(<object>).into(<indexed class>)[.as(<class>)].exec().then(() => { <function body> })`. `then` is chainable as a Promise.

Inserting an object into the database activates it such a way that any subsequent changes to the object automatically result in updates to the index into which it is inserted as well as automatic saving of the object into the configured persistence store. Inserted objects have a unique v4 uuid as the value for thier key property. The name of the key property is provided when creating a database.

### Delete

`db.delete().from({<classVariable>: <class> [,...]}).where(<pattern>).exec().then((count) => { <function body> })`. `then` is chainable as a Promise. `count` is the number of objects deleted.

The `from` clause is an object the properties of which are variable names to be used in the `where` clause. The values of the properties are classes.

See Patterns above for a description of the `where` clause.

Deleting an object from the database removes its unique key and removes it from its index and the persistent store.

### Select

`db.select([<projection>]).from({<classVariable>: <class>[,...]}).where(<pattern>).exec().then((cursor) => { <function body> });`. `then` is chainable as a Promise. `cursor` is an instance of a Cursor.

A Cursor has three iterating methods, `forEach(<function>)`, `some(<function>)`, `every(<function>)` and a computational method, `count`. It also has the data element `maxCount`. `<function>` can be a normal function or a fat arrow function. The signature is `(row,rowNumber,cursor)`. `row` will either be an array of objects in the order specified in the `from` clause or a single object created from the row by using an optionaly provided <projection>.

The `from` clause is an object, the properties of which are variable names to be used in the `where` clause. The values of the properties are classes.

See Patterns above for a general description of the `where` clause.

In order to optimize memory and speed, objects are not retrieved from the database until a cursor row is accessed. Furthermore, the cursor is implemented using a smart crossproduct engine with row instantiation join restrictions. As a result, the acutal number of non-empty rows may be less than `maxCount` and there is no way to get the actual count without looping through all records; hence `count` is implemented as a function. Requiring a function call to get `count` is intended to have the programmer be thoughtful about its use. The iteration methods skip over empty rows so the programmer may experience jumps in the `rowNumber`. If there is only a need to process a limited number of records, then using `some` or `every` with a test to break the loop if far more efficient than first calling `count`.

### When - Streaming Analytics

`db.when(<pattern>).from({<classVariable>: <class>[,...]}).select([<projection>]).then((cursor) => { <function body> });`. `then` is not currently chainable like Promise. Also unlike a Promise, it can be invoked mutiple times. `cursor` is an instance of a Cursor (see explanation above under ### Select).

Whenever `<pattern>` is matched based on new data being inserted or existing data being changed, the function specified in `then` will be invoked.

#### Projections

By default `select` clauses return a Promise which yields a cursor with rows represented by arrays of objects. By providing a projection, the row will be replaced with a single object that is a merger of data across the objects in the row.

A `<projection>` takes the form `{<propertyName: {<classVariable: "<objectProperty>"}[,...]}`.

For example `{e1name: {$e1: "name"},e2name: {$e2: "name"}}` will result in rows of the form `{e1name: "Joe",e2name: "Mary"}` assuming there are objects with the name "Joe" and "Mary" in database.


#### Joins

Select statements can join data from across classes in the `where` and `when` clauses.

### Update

`db.update({<classVariable>: <class>[,...]}).set({<classVariable>: {property: <value | {<classVariable>: "<property>"}> [,...]} [,...]}).where(<pattern>).exec()`

For exampe: `db.update({$p1: Person, $p2: Person}).set({$p1: {partner: {$p2: "name"}}, $p2: {partner: {$p1: "name"}}}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}})` pairs Persons and adds partner names.


### Direct Index Matching



### Predicates

*$* - Inline test, e.g. `{age:{$:(value)=> { return typeof(value)==="number" && value>=21; }}}`.

*$typeof* - Ensures the value in a property is of the type specified, e.g. `{id: {$typeof: "number"}}`.

*$lt* - Less than test, e.g. `{age: {$lt: 21}}`. Aliased to `<`, e.g. `{age: {"<": 21}}`.

*$lte* - Less than or equal test, e.g. `{age: {$lte: 21}}`. Aliased to `<=`, e.g. `{age: {"<=": 21}}`.

*$eq* - Relaxed equal test, e.g. `{age: {$eq: 21}}` and `{age: {$eq: "21"}}` will match the same objects. Aliased to `==`.

*$neq* - Relaxed not equal test, e.g. `{age: {$neq: 21}}` or `{age: {$neq: "21"}}` will match the same objects. Aliased to `!=`.

*$neeq* (not yet implemented) - Not exact equal test, e.g. `{age: {$neq: 21}}` or `{age: {$neq: "21"}}` will not match the same objects since type is taken into consideration. Aliased to `!==`.

*$eeq* - Exact equal test, e.g. `{age: {$eq: 21}}` and `{age: {$eq: "21"}}` will not match the same objects since type is taken into consideration. . Aliased to `===`.

*$gte* - Greater than or equal test, e.g. `{age: {$gte: 21}}`. Aliased to `>=`, e.g. `{age: {">=": 21}}`.

*$gt* - Greater than test, e.g. `{age: {$gt: 21}}`. Aliased to `>`, e.g. `{age: {">": 21}}`.

*$echoes* - Implements soundex comparison, e.g. `{name:{$echoes:"Jo"}}` would match an object with `{name: "Joe"}`.

*$matches* - Implements RegExp matching, e.g. `{name:{$matches: <RegExp>}}`. RegExp can either be a regular expression using shorthand notation, or a string that looks like a regular expression, i.e starts and ends with `/`.

*$in* - Tests to see if a value is in the specified sequence, e.g. `{age:{$in:[24,25]}}` only matches 24 and 25. Types must match.

*$nin* - Tests to see if a value is not in the specified sequence, e.g. `{age:{$nin:[24,25]}}` matches everything except 24 and 25. Types must match.

*$between* - Tests to see if a value is between the first and second elements, e.g. `{age:{$between:[24,25,true]}}`. The flag `true` includes the boundaries in the test. Types must match.

*$outside* - Tests to see if a value is outside the first and second elements, e.g. `{age:{$outside:[24,25]}}`. Types must match.

### Array Matching

Arrays are treated like objects for matching, e.g. `{children: {1:"Joe"}}`, matches an object `{children:["Mary","Joe"]}`.

The max, average and min values of all arrays are indexed and can be tested using special predicates:

$max - `{sizes: {$max: 5}}` matches `{sizes: [3,5,4,2]}`.
$avg - `{sizes: {$avg: 3.5}}` matches `{sizes: [3,5,4,2]}`.
$min - `{sizes: {$min: 2}}` matches `{sizes: [3,5,4,2]}`.

### Date Matching

All the properties equivalent to the get methods on Date objects are indexed, e.g. getMonth can be matched as `{month: <some month>}` and getUTCMonth as `{UTCMonth: <some month>}`.

##Extending ReasonDB

### Adding Predicates

### Adding Persistence Engines

## Internals

### Index

### Cursor

## Building & Testing

Building, testing and quality assessment are conducted using Travis, Mocha, Chai, Istanbul, Code Climate, and Codacity.

For code quality assessment purposes, the cyclomatic complexity threshold is set to 10.

## Notes


## Updates (reverse chronological order)

2016-10-28 v0.0.6 Added Update statement. Enhanced database to take a start-up flag that makes activating objects for automatic database and index update optional. Repaired 'delete' which broke when cursor.count was changed to a function. Added documentation. Published to npm.

2016-10-27 v0.0.5 Added documentation. Repaired 'when' which broke when cursor.count was changed to a function. Published to npm.

2016-10-26 v0.0.4 Added documentation. Changed `count` on Cursor instances to a function and added `maxCount` as a data member. Not published to npm.

2016-10-25 v0.0.3 First npm publication.


## License

This software is provided as-is under the [MIT license](https://opensource.org/licenses/MIT).