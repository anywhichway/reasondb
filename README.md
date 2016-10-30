# reasondb

A 100% native JavaScript browser or NodeJS database with a SQL like syntax (JOQULAR), JSON projections or live object result sets, streaming analytics, 18 built-in predicates (including soundex and RegExp matching), in-line fat arrow predicates, predicate extensibility, indexable computed values, fully indexed Dates and Arrays including array summaries, joins, nested matching, swapable persistence engines, built in statistical sampling, and automatic synchronization of object changes into the database and indexes in as little as 55K.


## Installation

npm install reasondb

## Basic Use

### Loading

Users of Chrome 54.0 and greater can use the file at src/index.js so long as node-uuid is loaded first (55K): 

```
<script src="../node_modules/node-uuid/uuid.js"></script>
<script src="../src/index.js"></script>
```

A browserified version is located at browser/reasondb.js (765K). It will operate in Chrome, Firefox, Microsoft Edge (although Edge fails with localStorage). Chome is almost twice as fast as either Firefox or Edge.

```
<script src="../browser/reasondb.js"></script>
```

NodeJS 6.x users can use a smaller babelified version with normal `require` syntax. The code actually loaded is in `lib/index.js` (91K): 

```
require("index.js");
```

NodeJS 7.x users can use the version in the src directory so long as the --harmony-async-await flag is set. NodeJS will probably not support production use of async/await until April of 2017.

**Note**: Preliminary tests show ReasonDB running 25% faster using native Promises in Chrome rather than Bluebird, which is frequently used to try and get a performance boost.

### Example

The ReasonDB query language JOQULAR (JavaScript Object Query Language Representation) is designed to look and behave like SQL; however is also supports nested objects, the return of matching JavaScript instances, and streaming analytics. Below are examples of each primary operation supported drawn from code in the `examples/basic/index.js` file:

```
var ReasonDB;
if(typeof(window)==="undefined") {
	ReasonDB = require("../../lib/index.js"); // Load ReasonDB if running on the server.
}

// Create a database at the directory location provided using @key as the primary key on all objects.
// Store data using localStorage. In the browser this is window.localStorage and the directory location is ignored.
// On the server JSON files are created. The argument `true` forces the creation of new storage and indexes each 
// time the example is run.

let db = new ReasonDB("./examples/basic/db","@key",ReasonDB.LocalStore,true);

// Define a Person class. Classes are optional. ReasonDB can store items of type Object, Array, and Date by default.
// There is no need to tell the database about the class, it will be auto-indexed as soon as attempt is made to insert
// an instance.
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
	        		   // Select and print Objects with non-null names. There will be three since Person's are instances of Objects
	        		   // and are stored in the Object index.
	        		   db.select().from({$p: Object}).where({$p: {name: {$neq: null}}}).exec().then((cursor) => {
	        			  cursor.forEach((row) => { console.log("Object",JSON.stringify(row[0])); }); 
	        		   });
	        		   // Print all possible pairs of Person not paired with themselves. There will be two, Mary and Bill plus Bill and Mary.
	        		   db.select().from({$p1: Person, $p2: Person}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}}).exec().then((cursor) => {
		        			  cursor.forEach((row) => { console.log("Pair:",JSON.stringify(row[0]),JSON.stringify(row[1])); }); 
		        	   });
		        	   // Print all possible pairs of Person paired to named Objects with the same name and birthday. There will be one Bill.
	        		   db.select().from({$p: Person, $o: Object}).where({$p: {name: {$o: "name"}, birthday: {time: {$o: "time"}}}).exec().then((cursor) => {
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

## Document Notation

The notation below uses the following conventions:

1) Elements to be replaced by the developer are contained in angle brackets, `< >`.

2) Optional elements are further surrounded by square brackets, e.g. `[< >]`.

3) Elipses, `...`, indicates the immediatly previous form can be repeated.

## Creating A Database

The ReasonDB constructor signature is: `ReasonDB(<nameOrPath>,<uniqueKeyName>,<storageType>,clear=false)`

<nameOrPath> is currently ignored except when using ReasonDB.LocalStore on NodeJS. In which case it is a path relative to the execution context.

The currently available storage types are `ReasonDB.MemStore`, `ReasonBD.LocalStore`, `ReasonDB.LocalForageStore`.

1) `ReasonDB.MemStore` provides a high-speed in memory database.

2) `ReasonBD.LocalStore` uses browser localStorage in Chrome and Firefox. In NodeJS the same API saves to disk with no quota limitations.

3) `ReasonDB.LocalForageStore` is built on-top of IndexedDB. It is slow and not recommended unless you need to store a lot of data in the browser.
 
See ## Extending ReasonDB for how to add new storage types. Configuring with this store will fallback to `ReasonBD.LocalStore` on NodeJS.

All data stored in ReasonDB, including indexes, is readable as JSON.

## JOQULAR - JavaScript Object QUery LAnguage Representation

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

`db.select([<projection>])[.first(number) | .random(number) | .sample(confidence,range)].from({<classVariable>: <class>[,...]}).where(<pattern>).exec().then((cursor) => { <function body> });`. `then` is chainable as a Promise. `cursor` is an instance of a Cursor.

A Cursor has three iterating methods, `forEach(<function>)`, `some(<function>)`, `every(<function>)`, a retriever `get(index)`, and a computational method, `count`. It also has the data element `maxCount`. `<function>` can be a normal function or a fat arrow function. It can return a value or a Promise. The signature is `(row,rowNumber,cursor)`. `row` will either be an array of objects in the order specified in the `from` clause or a single object created from the row created using an optionaly provided <projection>. All the methods are asynchronous and return Promises. 

In order to optimize memory and speed, objects are not retrieved from the database until a cursor row is accessed. Furthermore, the cursor is implemented using a smart crossproduct engine with row instantiation join restrictions. As a result, the acutal number of non-empty rows may be less than `maxCount` and there is no way to get the actual count without looping through all records; hence `count` is implemented as a function. The iteration methods skip over empty rows so the programmer may experience jumps in the `rowNumber`. If there is only a need to process a limited number of records, then using `some` or `every` with a test to break the loop is far more efficient than first calling `count`.

A `projection` specification takes the form `{<desiredPropertyName>: {<classVariable>: "<resultPropertyName"}[,...]}`.

The `from` clause is an object, the properties of which are variable names to be used in the `where` clause. The values of the properties are classes.

See ###Patterns above for a general description of the `where` clause.


See the ##Cursor documentation for more details.

### When - Streaming Analytics

`db.when(<pattern>).from({<classVariable>: <class>[,...]}).select([<projection>]).then((cursor) => { <function body> });`. `then` is not currently chainable like Promise. Also unlike a Promise, it can be invoked mutiple times. `cursor` is an instance of a Cursor (see explanation above under ### Select).

Whenever `<pattern>` is matched based on new data being inserted or existing data being changed, the function specified in `then` will be invoked.

#### Projections

By default `select` clauses return a Promise which yields a cursor with rows represented by arrays of objects. By providing a projection, the row will be replaced with a single object that is a merger of data across the objects in the row.

A `<projection>` takes the form `{<propertyName: {<classVariable: "<objectProperty>"}[,...]}`.

For example `{e1name: {$e1: "name"},e2name: {$e2: "name"}}` will result in rows of the form `{e1name: "Joe",e2name: "Mary"}` assuming there are objects with the name "Joe" and "Mary" in database.


#### Joins

Select statements can join data from across classes in the `where` and `when` clauses. For example:

 `db.select().from({$p: Person, $o: Object}).where({$p: {name: {$o: "name"}}})`
 
 Or
 
 `db.select().from({$p: Person, $o: Object}).where({$p: {name: {$eeq: {$o: "name"}}}})`
 
 At the present time, joins are only supported at the top level. They can't be used in nested query clauses. The below will not return any results:
 
 `db.select().from({$p: Person, $o: Object}).where({$p: {name: {$o: "name"}, birthday: {time: {$eeq: {$o: "time"}}}}})`
 
 Additionally, join restrictions should be placed on the left side of the join. The below permutation of the first join above will not return expected results.
 
  `db.select().from({$p: Person, $o: Object}).where({$p: {name: {$neq: null}}, $o: {name: {$p: "name}}})`.
  
  Only two way joins have been tested in the current release v1.0.
 

### Update

`db.update({<classVariable>: <class>[,...]}).set({<classVariable>: {property: <value | {<classVariable>: "<property>"}> [,...]} [,...]}).where(<pattern>).exec()`

For exampe: `db.update({$p1: Person, $p2: Person}).set({$p1: {partner: {$p2: "name"}}, $p2: {partner: {$p1: "name"}}}).where({$p1: {name: {$neq: null},"@key": {$neq: {$p2: "@key"}}}})` pairs Persons and adds partner names.


### Direct Index Matching

The indecies associated with each class can be accessed via a `.index` property on the class. Instance keys can be looked-up by using an asynchronous match method, e.g.

`Person.index.match({name: {$eq: "Joe"}}).then((result) => {  })`

The `result` is an array of ids associated with objects that match the pattern.

`match(<pattern>).then((Array) => { })`


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

See ##Extending ReasonDB to find out how to add your own predicates.

### Array Matching

Arrays are treated like objects for matching, e.g. `{children: {1:"Joe"}}`, matches an object `{children:["Mary","Joe"]}`.

The max, average and min values of all arrays are indexed and can be tested using special predicates:

$max - `{sizes: {$max: 5}}` matches `{sizes: [3,5,4,2]}`.
$avg - `{sizes: {$avg: 3.5}}` matches `{sizes: [3,5,4,2]}`.
$min - `{sizes: {$min: 2}}` matches `{sizes: [3,5,4,2]}`.

### Date Matching

All properties equivalent to the get methods on Date objects are indexed, e.g. getMonth can be matched as `{month: <some month>}` and getUTCMonth as `{UTCMonth: <some month>}`.

## Advanced Use

## Indexing Hidden and Computed Values

ReasonDB supports the indexing of hidden and computed values. Just add an Array called `.indexKeys` as a property on a class and all instances will be indexed by the keys in the array.  `.indexKeys` will also eliminate keys from indexing. If you want to index all enumerable properties plus some functions and hidden properties, then insert an asterisk, `*`, into the array to tell ReasonDB to index all properties in addition to those listed. Below is the ReasonDB definition for `Array`. `Date` is handled in a similar manner.

`Array.indexKeys = ["length","$max","$min","$avg","*"]`

***Note*** Functions must be callable with no arguments or default values for all arguments.

## Forcing Redindexing

Sometimes it may be necessary to force a re-index of an object based on changes that are a side effect of calling a method. The approach to handling this is similar to indexing computed values. Just add a class property called `.reindexCalls` than lists the methods you wish to drive re-indexing.  Below is the ReasonDB definition for `Array`. `Date` is handled in a similar manner.

`Array.reindexCalls = ["push","pop","splice","reverse","fill","shift","unshift"]`


## Extending ReasonDB

### Adding Predicates

Adding predicates can be done in as little as one line of code!

Here is the definitions of the RegExp predicate:

`Index.$matches = function(value,testValue) { return value.search(testValue)>=0; }`

Just choose a predicate name, it must start with a `$`, and add it as a class property to `Index` with the value being a boolean function taking two arguments. The first argument will be the value stored in the index, the second value will be the value extracted from the patterns used in `where` and `when` clauses of JOQULAR qeuries. The first value will always be a primitive, i.e. `number`, `string`, or `boolean`.

### Adding Persistence Engines

Adding a persistence engine takes between 5 and 7 methods. A template is below:

```
class <StoreName> extends Store {
	constructor(name,keyProperty,db,clear) {
			super(name,keyProperty,db);
			// Initialize your store here.
			// Save data to the this.__metadata__ object, NOT the store itself!
			// If you need config options, then add them to the top level database instance and access them from the db argument.
		}
	async clear() {
		// Clear all data from the store and return true if successful, false if not.
	}
	async delete(key) {
		// Delete the data associated with the key and return true if successful, false if not.
	}
	async get(key) {
		// Return the data associated with the key and undefined if the key does not exists.
		// If your data is class based, then instantiate the class using the data returned if
		// the underlying engine does not already do this. The async ultility method super.restore 
		// may work for you if your keys are of the form <className>@<unique id>, await super.restore(data).
		// This will load embedded object references.
	}
	async set(key,value) {
		// Set the data associated with the key and return true if successful, false if not.
		// If the value potentially contains references to other objects and you are using keys of the form
		// <className>@<unique id>, you may be able to use super.normalize(value).
	}
	async restore(json) {
		// An optional utility method that should return an instantiated class including instantiated
		// references to other objects.
	}
	normalize(instance) {
		// An optional utility methos to convert the instance into plain JSON with embedded references 
		// to other objects using their keys. Depending on your situation, you may need to make this 
		// asynchronous and use it so save embedded objects.
	}
}
```

## Internals

### Indexes & Data Storage

The internal data structure for an index is:

`{<property>: {<value>: {<type>: {<id>: true}[,...]}[,...]}[,...]}[,...]}`

For example:

```
{identifier: {Joe: {string: {Person@1: true, Person@3: true}}, {Mary: {string: {Person@2: true}},
 age: {21: {number: {Person@1: true, Person@2: true}}, {24: {number: {Person@3: true}}}
```

is an index for the below three objects:

```
{indentifier: "Joe", age: 21, @key: "Person@1"}
{indentifier: "Joe", age: 24, @key: "Person@3"}
{indentifier: "Mary", age: 21, @key: "Person@2"}
```

For storage, indexes are partitioned by property into KeyValue stores with `<className>.<property>` being the key and the rest of the index node being the value. Objects are just stored using their primary key. This means that almost any KeyValue store can be used as a persistence engine for ReasonDB.

Continuing with the above example, the below is pseudocode for how ReasonDB handles things internally:

```
store.set("Person.identifier",{Joe: {string: {Person@1: true, Person@3: true}}, {Mary: {string: {Person@2: true}});
store.set("Person.age",age: {21: {number: {Person@1: true, Person@2: true}}, {24: {number: {Person@3: true}});
store.set("Person@1",{indentifier: "Joe", age: 21, @key: "Person@1"});
store.set("Person@3",{indentifier: "Joe", age: 24, @key: "Person@3"});
store.set("Person@2",{indentifier: "Mary", age: 21, @key: "Person@2"});
```

### Cursors

Cursors are asynchronous to simplify integration with third-party storage engines that may already return data asynchronously. Asynchronous cursors will also simplify the creation of client/server based applications.

Most cursors do not store all permutations of combinations on data required to form a row resulting from a query. Instead, they encapsulate a light-weight cross-product engine that given an offset will assemble the row on the fly. See http://phrogz.net/lazy-cartesian-product. The cross-product engine in ReasonDB can also handle join restrictions.

The cross-product approach has two values:

1) It dramatically reduces the amount of memory required to represent large result sets.
2) A result set can be returned faster.

As side effect of the above is that it is not currently possible to know the actual number of rows in a cursor without doing additional computation to determine which rows are excluded as a result of join restrictions.

An exception to the cross-product based cursor, is a cursor that results from down selection. The select clauses `first`, `random`, `sample`, result in the return of cursors with fixed pre-computed rows. However, the calling interface is identical. In fact, the same class is used to implement both types of cursor.

## Building & Testing

Building, testing and quality assessment are conducted using Travis, Mocha, Chai, Istanbul, Code Climate, and Codacity.

For code quality assessment purposes, the cyclomatic complexity threshold is set to 10.

## Notes


## Updates (reverse chronological order)

2016-10-30 v0.1.0 Added `first`, `random`, and `sample` to `select`. Made cursor calls to `forEach`, `every`, `some`, `get` asynchronous. See documentation for rationale. Deprecated shared indexes, they did not scale well under volume and made working with localStorage somewhat obscure. This resulted in dropping the `as` clause for `insert`.

2016-10-28 v0.0.6 Added Update statement. Enhanced database to take a start-up flag that makes activating objects for automatic database and index update optional. Repaired 'delete' which broke when cursor.count was changed to a function. Added documentation. Published to npm.

2016-10-27 v0.0.5 Added documentation. Repaired 'when' which broke when cursor.count was changed to a function. Published to npm.

2016-10-26 v0.0.4 Added documentation. Changed `count` on Cursor instances to a function and added `maxCount` as a data member. Not published to npm.

2016-10-25 v0.0.3 First npm publication.


## License

This software is provided as-is under the [MIT license](https://opensource.org/licenses/MIT).