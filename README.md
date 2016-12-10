# reasondb

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/63a0d8f9cb0a4d14a9a2a44ffda76369)](https://www.codacy.com/app/syblackwell/reasondb?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=anywhichway/reasondb&amp;utm_campaign=Badge_Grade)

The first 100% native JavaScript automatically synchronizing object database with a SQL like syntax (JOQULAR) and swapable persistence engines for the browser or NodeJS. ReasonDB also supports JSON projections or live object result sets, pattern based and functional queries, asynchronous cursors, streaming analytics, 18 built-in predicates (including soundex and RegExp matching), in-line fat arrow predicates, predicate extensibility, indexable computed values, fully indexed Dates and Arrays including array summaries, joins, nested matching, built in statistical sampling, and configurable unique id properties in as little as 75K.

ReasonDB does not require that the class of objects stored be a subclass of any other class, nor does it require objects provide a special calling interface. ReasonDB is probably more compatible with existing object models than any other JSON database. All objects inserted to the database are activated, e.g.

```javascript
let o = {name: "Joe"};
db.insert(o).exec();
o.name = "Jo"; // will automatically cause an index and database update
```

Add JOQULAR query capability, joins, and streaming analytics to popular back-end stores including file systems, Redis, Memcached, LevelUP, LocalForage, and IronCache. Or, use our super fast JSONBlockStore. Not enough? Add your own favorite store in just an hour (we timed ourselves for Redis and MemCached :-).

If ReasonDB does not have a feature you want, you can [review and vote on enhancements](https://github.com/anywhichway/reasondb/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20is%3Aenhancement).



[![NPM](https://nodei.co/npm/reasondb.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/reasondb/)


## Installation

npm install reasondb

## Basic Use

### Loading

Users of Chrome 54.0 and greater can use the file at src/index.js so long as uuid is loaded first (72K). An unmodified, browserified copy of uuid v3.0.0 is provided in the `lib` directory for convenience: 

```javascript
<script src="../lib/uuid.js"></script>
<script src="../src/index.js"></script>
```

A browserified version of ReasonDB is located at browser/reasondb.js (264K). It will operate in Chrome, Firefox, Microsoft Edge (although Edge fails with localStorage). Chrome is almost twice as fast as either Firefox or Edge. **Note**: The unit tests only work reliably in Chrome. However, this is due to how the tests are written and/or the behavior of Mocha and Chai. In some cases the tests and examples are "decafinated" and print to the console rather than the browser page.

```javascript
<script src="../browser/reasondb.js"></script>
```

NodeJS 6.x users can use a smaller Babelified version with normal `require` syntax. The code actually loaded is in `lib/index.js` (135K): 

```javascript
require("index.js");
```

NodeJS 7.x users can use the version in the src directory so long as the --harmony-async-await flag is set. NodeJS will probably not support production use of async/await until April of 2017.

**Note**: Preliminary tests show ReasonDB running 25% faster using native Promises in Chrome rather than Bluebird, which is frequently used to try and get a performance boost.

### Example

The ReasonDB query language JOQULAR (JavaScript Object Query Language Representation) is designed to look and behave like SQL; however it also supports nested objects, the return of matching JavaScript instances, and streaming analytics. 

Unlike other object databases, the JavaScipt objects used with ReasonDB do not have to be subclassed from a special root class. You can even use  direct instances of Object! No special calling interfaces are required of the objects to be stored.


Below are examples of each primary operation supported drawn from code in the `examples/basic/index.js` file:

```javascript
var ReasonDB;
if(typeof(window)==="undefined") {
  ReasonDB = require("../../lib/index.js"); // Load ReasonDB if running on the server.
}

// Create a database at the directory location provided using @key as the primary key on all objects.
// Store data using localStorage. In the browser this is window.localStorage and the directory location is ignored.
// On the server JSON files are created in the directory. The argument `true` forces the creation of new storage 
// and indexes each time the example is run.

let db = new ReasonDB("./examples/basic/db", "@key", ReasonDB.LocalStore, true);

// Define a Person class. Classes are optional. ReasonDB can store items of type Object, Array, and Date by default.
// There is no need to tell the database about the class, it will be auto-indexed as soon as attempt is made to insert
// an instance.
class Person {
  constructor(name, birthday) {
    this.name = name;
    this.birthday = birthday;
  }
}

// Create a streaming analytics rule that fires every time a Person is added to the database.
db.when({$p: {name: {$neq: null}, partner: undefined}}).from({$p: Person}).select().then((cursor) => { 
  cursor.forEach((row) => {
    console.log("New " + row[0].constructor.name + ":", JSON.stringify(row[0]));
  });
});

//Create a streaming analytics rule that fires every time a Person is updated with a partner.
db.when({$p: {partner: {$neq: null}}}).from({$p: Person}).select().then((cursor) => { 
  cursor.forEach((row) => {
    console.log("Updated " + row[0].constructor.name + ":", JSON.stringify(row[0]));
  });
});

let p1 = new Person("Joe", new Date("1960-01-16"));

Promise.all([
    // Insert Objects into the Person index casting it to a Person as it is inserted, if not already a Person.
    db.insert([{name:"Mary", birthday:new Date("1961-01-15")}, {name:"Bill", birthday:new Date("1960-01-16")}, p1]).into(Person).exec(),
    
    // Insert an Object that looks like a Person into the Object index.
    db.insert({name:"Bill", birthday:new Date("1960-01-16")}).into(Object).exec(),
  ]).then(() => {
    // Delete a Person from the database where the name is "Joe". This will not match the Object
    // that looks like a person. It will only match one object, the Joe that is a Person.
    db.delete().from({$p: Person}).where({$p: {name: "Joe"}}).exec().then((result) => {
    console.log("Deleted:", result);
  }).then(() => {
    // Select and print Person's with non-null names. There will be two.
    db.select().from({$p: Person}).where({$p: {name: {$neq: null}}}).exec().then((cursor) => {
    cursor.forEach((row) => { console.log("Person", JSON.stringify(row[0])); }); 
  });
    // Select and print Objects with non-null names. There will be three since Person's are instances of Objects
    // and are stored in the Object index.
    db.select().from({$p: Object}).where({$p: {name: {$neq: null}}}).exec().then((cursor) => {
    cursor.forEach((row) => { console.log("Object", JSON.stringify(row[0])); }); 
  });
    // Print all possible pairs of Person not paired with themselves. There will be two, Mary and Bill plus Bill and Mary.
    db.select().from({$p1: Person, $p2: Person}).where({$p1: {name: {$neq: null}, "@key": {$neq: {$p2: "@key"}}}}).exec().then((cursor) => {
    cursor.forEach((row) => { console.log("Pair:", JSON.stringify(row[0]), JSON.stringify(row[1])); }); 
  });
    // Print all possible pairs of Person paired to named Objects with the same name and birthday. There will be one Bill.
    db.select().from({$p: Person, $o: Object}).where({$p: {name: {$o: "name"}, birthday: {time: {$o: "time"}}}).exec().then((cursor) => {
    cursor.forEach((row) => { console.log("Pair:", JSON.stringify(row[0]), JSON.stringify(row[1])); }); 
  });
    // Select a Person born on January 15th regardless of year.
    db.select().from({$p: Person}).where({$p: {name: {$neq: null}, birthday:{date:14, month:0}}}).exec().then((cursor) => {
    cursor.forEach((row) => { console.log("Born Jan 15th:", JSON.stringify(row[0])); }); 
  });
    // Just update a predefined Person object after it has been inserted and database/index updates happen automatically
    setTimeout(() => { p1.name = "John"; }); // timeout used so as not to disturb above queries
    
    // Alternatively, use the 'update' command to update based on query criteria, e.g. update the partner for all Persons, the last update will "win"
    db.update({$p1: Person, $p2: Person}).set({$p1: {partner: {$p2: "name"}}, $p2: {partner: {$p1: "name"}}}).where({$p1: {name: {$neq: null}, "@key": {$neq: {$p2: "@key"}}}}).exec();
  });
});
```

Review other files in the example directory or the unit tests under the test directory for more examples. Examples and unit tests can be run in the browser by loading the index.html file. The same examples and tests can be run in node.js by executing the index.js file from the command line, e.g. `node test/index.js`.

**Note**: Mocha and Instanbul currently break with ReasonDB under NodeJS even though they work in the browser. Test code is "decaffinated" prior to executing in NodeJS.

## Document Notation

The notation below uses the following conventions:

1) Elements to be replaced by the developer are contained in angle brackets, `< >`.

2) Optional elements are further surrounded by square brackets, e.g. `[< >]`.

3) Elipses, `...`, indicates the immediately previous form can be repeated.

## Creating A Database

The ReasonDB constructor signature is: `ReasonDB("<nameOrPath>", "<uniqueKeyName>"="@key", <storageType>, clear=false, activate=true, {<options>}={})`

`<nameOrPath>` - See storage types below for use.

`<uniqueKeyName>` - The property to add to objects to uniquely identify them. Using anything other than "@key" has not been heavily tested at this point.

`<storageType>` - The currently available storage types are listed below. **Note***: For all storage types except MemStrore, LocalStore, and LocalForageStore you will need to install the associated npm packages for production. They are only listed as dev dependencies in the ReasonDB/package.json file. This keeps the primary ReasonDB code smaller.

1) `ReasonDB.JSONBlockStore` provides a high-speed server based disk store for NodeJS that can be manually inspected using a regular JavaScript editor. `<nameOrPath>` is a path relative to the execution context of NodeJS where data should be stored. **Note**: Although the files can be inspected using an editor, they should not be edited. The records are legal JSON, but they are also stored in fixed length blocks which can be corrupted by editing.

2) `ReasonDB.MemStore` provides a high-speed in memory database for the browser and NodeJS. `<nameOrPath>` is ignored.

3) `ReasonBD.LocalStore` uses browser localStorage in Chrome and Firefox. Microsoft Edge just fails. In NodeJS the same API saves to disk with no quota limitations. `<nameOrPath>` is ignored in the browser. On NodeJS, it is a path relative to the execution context of NodeJS.

4) `ReasonDB.LocalForageStore` is built on-top of IndexedDB. It is slow and not recommended unless you need to store a lot of data in the browser. In fact, using a remote `ReasonDB.RedisStore` is generally faster. Configuring with this store will fallback to `ReasonBD.LocalStore` on NodeJS.

5) `ReasonDB.IronCacheStore` - Create your IronCache client before creating the database and pass it in as a property `ironCacheClient` in the options object, e.g. `{ironCacheClient: <theClient>}`. `<nameOrPath>` is ignored. No support is currently provided for addressing value expiration. ***Note:*** To limit package dependencies, `iron-cache` is a dev dependency not a package dependency. If you wish to use `iron-cache` you should make it part of your app package. Also,
unit testing has occassional tests that fail due to timing interactions with the iron-cache server, i.e. key updates are not
complete prior to a request for an updated key originating on the client. It is not clear what causes this, i.e. if the cause is
in ReasonDB code or the iron-cache architecture.

6) `ReasonDB.RedisStore` - Create your Redis client before creating the database and pass it in as a property `redisClient` in the options object, e.g. `{redisClient: <theClient>}`. `<nameOrPath>` is ignored because the name of the cache bucket is tied to client creation. No support is currently provided for addressing value expiration, but Redis values do not expire unless an expiration is specifically set.  ***Note:*** To limit package dependencies, `redis` is a dev dependency not a package dependency. If you wish to use `redis` you should make it part of your app package. 

7) `ReasonDB.MemcachedStore` - Create your Memcached client before creating the database and pass it in as a property `memcachedClient` in the options object, e.g. `{memcachedClient: <theClient>}`.`<nameOrPath>` is ignored because the name of the cache bucket is tied to client creation. No support is currently provided for addressing value expiration.  ***Note:*** To limit package dependencies, `memjs` (the Memcached client) is a dev dependency not a package dependency. If you wish to use `memjs` you should make it part of your app package.

8) `ReasonDB.LevelUPStore` - Open your LevelUP database before creating the ReasonDB database and pass it in as a property `levelUPClient` in the options object, e.g. `{levelUPClient: <theDatabase>}`.`<nameOrPath>` is ignored because the name of the database is tied to LevelUP creation.

All storage types are referenced in the example and test files, you just need to provide client creation credentials and change the ReasonDB constructor call to test them out.
 
With the exception of LevelUP, all data stored in ReasonDB, including indexes, is human readable as JSON directly in the store.
 
See [Extending ReasonDB](#extending) for how to add new storage types. 

`clear` - Clear storage when creating the database.

`activate` - Activate objects to automatically update the database and indexes when changed. `false` dooes not currently work but is under development.

`options` - See storage types above for the only current options, which are instantiated storage clients. Additionally, inserts can be made fasters by setting `{saveIndexAsync:true}` in the options object. When set to true, indexes are only saved during otherwise idle time rather than after each update.

## JOQULAR - JavaScript Object QUery LAnguage Representation

ReasonDB supports both a pattern based query mechanism using the predicates below and a functional query mechanism. See the documentation for `select` for more details.

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

*$in* - Tests to see if a value is in the specified sequence, e.g. `{age:{$in:[24, 25]}}` only matches 24 and 25. Types must match.

*$nin* - Tests to see if a value is not in the specified sequence, e.g. `{age:{$nin:[24, 25]}}` matches everything except 24 and 25. Types must match.

*$between* - Tests to see if a value is between the first and second elements, e.g. `{age:{$between:[24, 25, true]}}`. The flag `true` includes the boundaries in the test. Types must match. Between is unordered, `{age:{$between:[25, 24, true]}}` produces the same result.

*$outside* - Tests to see if a value is outside the first and second elements, e.g. `{age:{$outside:[24, 25]}}`. Types must match. Outside is unordered, `{age:{$outside:[25, 24]}}` produces the same result.

See ##Extending ReasonDB to find out how to add your own predicates.

### Patterns

Query patterns take the top level form: `{<classVariable>: {<property>: {<predicate>: <value> [, ...]} [, ...]} [, ...]}`.

`classVariable` refers to a variable created in a `from` clause, e.g. `{$o1: Object}` creates the variable `$o1`. Variables must start with a `$` sign.

`predicate` can be any of the supported predicates, see ###Predicates above.

Continuing with the `$o1` variable: `{$o1: {age: {$gte: 18, $lte: 20}, state: {$in: ["OH", "IN", "WA"]}}` matches all objects with age between 18 and 20 inclusive in the states of Ohio, Indiana, and Washington. This pattern does the same: `{$o1: {age: {$between: [18, 20, true]}, state: {$in: ["OH", "IN", "WA"]}}`

### Insert

`db.insert(<object>, ...).into(<indexed class>).exec().then((<instanceArray>) => { <function body> })`. `then` is chainable as a Promise.

Inserted objects have a unique v4 uuid as the value for their key property. The name of the key property is provided when creating a database.

`<object>`s that are not instances of `<indexed class>` are saved to the database in such a way that when they are retrieved they will be instances of `<indexed class>`. This makes it easy to convert plain objects, e.g. `{name: "Joe"}`. The converted object instances are also resolved as an Array, `<instanceArray>`.

Inserting an object into the database activates it in such a way that any subsequent changes to the object automatically result in updates to the index into which it is inserted as well as automatic saving of the object into the configured persistence store. For example, the below code would actually result in an Person with the name "Mary" being stored in the database.

```
let p1 = new Person("Joe");
db.insert(p1).exec().then(() => {
  p1.name = "Mary";
});
```

A future release will support an optional second boolean argument to the `into` subclause indicating inserted objects should be passive. This will require they be updated using explict update commands.

### Delete

`db.delete().from({<classVariable>: <class> [, ...]}).where(<pattern>).exec().then((count) => { <function body> })`. `then` is chainable as a Promise. `count` is the number of objects deleted.

The `from` clause is an object, the properties of which are variable names to be used in the `where` clause. The values of the properties are classes.

See Patterns above for a description of the `where` clause.

Deleting an object from the database removes its unique key and removes it from its index and the persistent store.

Single objects can also be deleted direclty using `<class>.index.delete(<object id>)`. Deleting from the index also deletes the persisted data.


### Select

`db.select([<projection>])[.first(number) | .random(number) | .sample(confidence, range)].from({<classVariable>: <class>[, ...]}).where(<pattern>|<function>).exec().then((cursor) => { <function body> });`. `then` is chainable as a Promise. `cursor` is an instance of a Cursor.

A Cursor has three iterating methods, `forEach(<function>)`, `some(<function>)`, `every(<function>)`. These work in a manner similar to the standard JavaScript iteration functions. `<function>` can be a normal function or a fat arrow function. It can return a value or a Promise. The signature is `(row, rowNumber, cursor)`. `row` will either be an array of objects in the order specified in the `from` clause or a single object created from the row created using an optionaly provided `<projection>`. All the methods are asynchronous and return Promises. Cursors also have a retriever `get(index)`, and a computational method, `count` and a data element `maxCount`. See the ###Cursor documentation for more details.

In order to optimize memory and speed, except in the case of functional queries, objects are not retrieved from the database until a cursor row is accessed. Furthermore, the cursor is implemented using a smart crossproduct engine with row instantiation join restrictions. As a result, the actual number of non-empty rows may be less than `maxCount` and there is no way to get the actual count without looping through all records; hence `count` is implemented as a function. The iteration methods skip over empty rows so the programmer may experience jumps in the `rowNumber`. If there is only a need to process a limited number of records, then using `some` or `every` with a test to break the loop is far more efficient than first calling `count()`.

A `projection` specification takes the form `{<desiredPropertyName>: {<classVariable>: "<resultPropertyName"}[, ...]}`.

`.first(number)` results in a fixed cursor with the first N records or all the records if N is greater than the count of all records.

`.random(number)` results in a fixed cursor with random N records or all the records if N is greater than the count of all records.

`.sample(confidence, range)` results in a fixed cursor with a `confidence` that the included records are representative of the entire result set at +/- the `range`.

The `from` clause is an object, the properties of which are variable names to be used in the `where` clause. The values of the properties are classes.

See ###Patterns above for a general description of `<pattern>` in the `where` clause.

To create a functional query, provide `<function>` in the `where` clause rather than `<pattern>`. The function must return an an array of rows of objects, i.e. array of arrays. The column order of the row arrays should match that of the passed in classes. ReasonDB continues to manage projections and statistical sampling or row count limits. The function will be passed all the classes named in the `from` clause. The class indecies can be accessed from within the query function, or the program can use its own mechanisms for keeping track of instances.

#### Projections

By default `select` clauses return a Promise which yields a cursor with rows represented by arrays of objects. By providing a projection, the row will be replaced with a single object that is a merger of data across the objects in the row.

A `<projection>` takes the form `{<propertyName: {<classVariable: "<objectProperty>"}[, ...]}`.

For example `{e1name: {$e1: "name"}, e2name: {$e2: "name"}}` will result in rows of the form `{e1name: "Joe", e2name: "Mary"}` assuming there are objects with the name "Joe" and "Mary" in database.


#### Joins

Select statements can join data from across classes in the `where` and `when` clauses. For example:

 `db.select().from({$p: Person, $o: Object}).where({$p: {name: {$o: "name"}}})`
 
 Or
 
 `db.select().from({$p: Person, $o: Object}).where({$p: {name: {$eeq: {$o: "name"}}}})`
 
 At the present time, joins are only supported at the top level. They can't be used in nested query clauses. The below will not return any results:
 
 `db.select().from({$p: Person, $o: Object}).where({$p: {name: {$o: "name"}, birthday: {time: {$eeq: {$o: "time"}}}}})`
 
 Additionally, join restrictions should be placed on the left side of the join. The below permutation of the first join above will not return expected results.
 
  `db.select().from({$p: Person, $o: Object}).where({$p: {name: {$neq: null}}, $o: {name: {$p: "name}}})`.
  
Only two way joins have been tested in the current release v0.x.x.
 
### When - Streaming Analytics

`db.when(<pattern>).from({<classVariable>: <class>[, ...]}).select([<projection>]).then((cursor) => { <function body> });`. `then` is not currently chainable like Promise. Also unlike a Promise, it can be invoked mutiple times. `cursor` is an instance of a Cursor (see explanation above under ### Select).

Whenever `<pattern>` is matched based on new data being inserted or existing data being changed, the function specified in `then` will be invoked.


### Update

As noted above, changes to objects already inserted into the database result in automatic data and index updates; however, there is also an `update` command that can be used to base updates on query criteria.

`db.update({<classVariable>: <class>[, ...]}).set({<classVariable>: {property: <value | {<classVariable>: "<property>"}> [, ...]} [, ...]}).where(<pattern>).exec()`

For exampe: `db.update({$p1: Person, $p2: Person}).set({$p1: {partner: {$p2: "name"}}, $p2: {partner: {$p1: "name"}}}).where({$p1: {name: {$neq: null}, "@key": {$neq: {$p2: "@key"}}}})` pairs Persons and adds partner names.


### Direct Index Use

The indecies associated with each class can be accessed via a `.index` property on the class. Instance keys can be looked-up by using an asynchronous match method, e.g.

`Person.index.match({name: {$eq: "Joe"}}).then((result) => {  })`

The `result` is an array of ids associated with objects that match the pattern.

`<class>.index.match(<pattern>).then((array) => { })`

The return keys can be resolved all at once with a call to `.instances`, e.g.:

`<class>.index.match(<pattern>).then((keyArray) => { <class>.index.instances(keyArray).then((objectArray) => { }); })`

Alternatively, objects can be retrieved with `.get`, e.g.

`<class>.index.get(uniqeKey).then((object) => { })`

Single objects can be deleted directly using `<class>.index.delete(<object id>)`. Deleting from the index also deletes the persisted data.


### Array Matching

Arrays are treated like objects for matching, e.g. `{children: {1:"Joe"}}`, matches an object `{children:["Mary", "Joe"]}`.

The max, average and min values of all arrays are indexed and can be tested using special "predicates" (they are actually indexed properties):

*$max* - `{sizes: {$max: 5}}` matches `{sizes: [3, 5, 4, 2]}`.
*$avg* - `{sizes: {$avg: 3.5}}` matches `{sizes: [3, 5, 4, 2]}`.
*$min* - `{sizes: {$min: 2}}` matches `{sizes: [3, 5, 4, 2]}`.

Normal mathematical tests can also be combined with $max, $min, and $avg, e.g. `{sizes: {$max: {$gt: 4}}}`

Invoking Array modification functions such as `push`, `splice`, etc. forces re-indexing of the modified Array.

### Date Matching

All properties equivalent to the get methods on Date objects are indexed, e.g. getMonth can be matched as `{month: <some month>}` and getUTCMonth as `{UTCMonth: <some month>}`.

Invokving date modification functions such as `setTime` forces re-indexing of the modified Date.

## Advanced Use

## Indexing Hidden or Computed Values

ReasonDB supports the indexing of hidden and computed values. Just add an Array called `.indexKeys` as a property on a class and all instances will be indexed by the keys in the array.  `.indexKeys` will also eliminate keys from indexing if they are not listed. If you want to index all enumerable properties plus some function results and hidden properties, then insert an asterisk, `*`, into the array to tell ReasonDB to index all properties in addition to those listed. Below is the ReasonDB definition for `Array`. `Date` is handled in a similar manner.

`Array.indexKeys = ["length", "$max", "$min", "$avg", "*"]`

***Note*** Functions must be callable with no arguments or default values for all arguments.

## Skipping Indexing

If you wish to skip indexing certain properties, then add them to a class property called `.skipKeys`. Alternatively, use `.indexKeys` and only list the keys you wish to index.

## Forcing Reindexing

Sometimes it may be necessary to force a re-index of an object based on changes that are a side effect of calling a method. The approach to handling this is similar to indexing computed values. Just add a class property called `.reindexCalls` than lists the methods you wish to drive re-indexing.  Below is the ReasonDB definition for `Array`. `Date` is handled in a similar manner.

`Array.reindexCalls = ["push", "pop", "splice", "reverse", "fill", "shift", "unshift"]`


## Extending ReasonDB<a name="extending"></a>

### Adding Predicates

Adding predicates can be done in as little as one line of code!

Here is the definition of the RegExp predicate:

`Index.$matches = function(value, testValue) { return value.search(testValue)>=0; }`

Just choose a predicate name, it must start with a `$`, and add it as a class property to `Index` with the value being a boolean function taking two arguments. The first argument will be the value stored in the index, the second value will be the value extracted from the patterns used in `where` and `when` clauses of JOQULAR qeuries. The first value will always be a primitive, i.e. `number`, `string`, or `boolean`.

### Adding Persistence Engines

Adding a persistence engine takes between 5 and 7 methods. A template is below:

```javascript
class <StoreName> extends Store {
  constructor(name, keyProperty, db, clear) {
      super(name, keyProperty, db);
      // Initialize your store here.
      // Save data to the this.__metadata__ object, NOT the store itself!
      // If you need config options, then add them to the top level database instance and access them from the db argument.
    }
  // lets the ReasonDB engine know if classnames can be used to split storage for efficiency by not sharing. This will usually be false.
  static get split() { return false; };
  async clear() {
    // Clear all data from the store and return true if successful, false if not.
    // The superclass does nto provide any methods to do this. It must be implemented by the child.
  }
  async delete(key) {
    // Delete promise the data associated with the key and resolve to true if successful, false if not.
    return super.delete(key, () => new Promise((resolve, reject) => { <insert code here> resolve(true); })) 
  }
  async get(key) {
    // Return the data associated with the key as an object and undefined if the key does not exists.
    // The superclass will handle resolving referencs to other classes.
    return super.get(key, () => new Promise((resolve, reject) => { < insert code here> resolve(object); }));
  }
  async set(key, value, normalize) {
    // Set the data associated with the key and return true if successful, false if not.
    // The superclass will normalize the object if it contains references to other objects and ensure they are also persisted by
    // calling back down to the child.
    return super.set(key, value, normalize, (normalized) => new Promise((resolve, reject) => { < insert code here > resolve(true); }));
  }
  async restore(json) {
    // An optional utility method that should return an instantiated class including instantiated
    // references to other objects. The superclass already provides this; but it can be overridden.
  }
  normalize(instance) {
    // An optional utility method to convert the instance into plain JSON with embedded references 
    // to other objects using their keys. Depending on your situation, you may need to make this 
    // asynchronous and use it so save embedded objects. The superclass already provides this; but it can be overridden.
  }
}
```

## Internals

### Philosophy

ReasonDB was designed to:

1) Be 100% JavaScript.

2) Leverage the massive number of hours that have gone into optimizing object property access by Mozilla and Google. See [Indexing With JavaScript Objects, Millions Of Ops/Second](http://anywhichway.github.io/indexing.html).

3) Be extensible from a command, predicate, and persistence store perspective.

4) Leverage knowledge of SQL while not compromising native JavaScript syntax and semantics or requiring the implementation of a parser/compiler.

5) Minimize memory usage by large result sets.

6) Simplify initial development by eliminating the need to make decisions about indexing and updating the database. Scaling back indexes is simple, keys to not index can be explicitly listed for a class. Or, classes can be configured to index only specific keys. Eliminating auto-updates is straight-forward to implement and should show up in v2.0.

### Indexes & Data Storage

The internal data structure for an index is:

`{<property>: {<value>: {<type>: {<id>: true}[, ...]}[, ...]}[, ...]}[, ...]}`

For example:

```javascript
{identifier: {Joe: {string: {Person@1: true, Person@3: true}}, {Mary: {string: {Person@2: true}},
 age: {21: {number: {Person@1: true, Person@2: true}}, {24: {number: {Person@3: true}}}
```

is an index for the below three objects:

```javascript
{indentifier: "Joe", age: 21, @key: "Person@1"}
{indentifier: "Joe", age: 24, @key: "Person@3"}
{indentifier: "Mary", age: 21, @key: "Person@2"}
```

For storage, indexes are partitioned by property into KeyValue stores with `<className>.<property>` being the key and the rest of the index node being the value. Objects are just stored using their primary key. This means that almost any KeyValue store can be used as a persistence engine for ReasonDB.

Continuing with the above example, the below is pseudocode for how ReasonDB handles things internally:

```javascript
store.set("Person.identifier", {Joe: {string: {Person@1: true, Person@3: true}}, {Mary: {string: {Person@2: true}});
store.set("Person.age", age: {21: {number: {Person@1: true, Person@2: true}}, {24: {number: {Person@3: true}});
store.set("Person@1", {indentifier: "Joe", age: 21, @key: "Person@1"});
store.set("Person@3", {indentifier: "Joe", age: 24, @key: "Person@3"});
store.set("Person@2", {indentifier: "Mary", age: 21, @key: "Person@2"});
```

### Cursors

Cursors are asynchronous to simplify integration with third-party storage engines that may already return data asynchronously. Asynchronous cursors also simplify the creation of client/server based applications.

Most ReasonDB cursors do not store all permutations of data required to form a row resulting from a query. Instead, they encapsulate a light-weight cross-product engine that given an offset will assemble the row on the fly. See http://phrogz.net/lazy-cartesian-product. The cross-product engine in ReasonDB can also handle join restrictions.

The cross-product approach has two values:

1) It dramatically reduces the amount of memory required to represent large result sets.

2) A result set can be returned faster.

A side effect of the above is that it is not currently possible to know the actual number of rows in a cursor without doing additional computation to determine which rows are excluded as a result of join restrictions.

An exception to the cross-product based cursor, is a cursor that results from down selection. The select clauses `first`, `random`, `sample`, result in the return of cursors with fixed pre-computed rows. However, the calling interface is identical. In fact, the same class is used to implement both types of cursor.

## Performance

Performance is tested using a single member object in a batch insertion or selection of 1, 000 records, i.e. one insert statement with multiple records. When `insert` is async, objects are immediately persisted, but indexes are persisted only during otherwise idle time. The `select` test does a query but does not resolve data in the records, only ids are returned; hence, only index load and query time is included. The `read` test is the same as `select` but loads data for the selected object ids. The `cached select/read` is done immediately after an insert, so no additional disk access is required.

Testing was conducted under Windows 10 64-bit on an Intel i7 Quad Core 2.6GHz machine with 8GB RAM and fixed hard drives. Numbers provided are the average of 5 runs.


| Storage                    | insert async/sync | select rec/sec | read rec/sec | cached select/read rec/sec |
|----------------------------|-------------------|----------------|--------------|----------------------------|
| JSONBlockStore (server)    | 5, 000/750         | 43, 500         | 4, 000        | 85, 000                     |
| LocalStore (browser)       | 1, 750/350         | 22, 500         | 1, 850        | 55, 400                     |
| LocalStore (server)        | 180/60            | 13, 150         | 1, 750        | 29, 400                     |
| LocalForageStore (browser) | 10                | 2, 000          | 500          | 45, 250                     |
| LevelUpStore (server)      | 120/120           | 1, 800          | 1, 200        | 17, 150                     |
| MemStore (browser)         | 4, 100/4, 100       | 42, 800         | 42, 800       | 42, 800                     |
| MemStore (server)          | 10, 100/10, 100     | 75, 700         | 75, 700       | 75, 700                     |
| RedisStore (server)        | 1, 000/350         | 21, 000         | 2, 500        | 58, 000                     |
| RedisStore (remote)        | 12/10             | 2, 550          | 1, 250        | 27, 750                     |
| IronCacheStore (remote)    | 5/3               | 1, 550          | BLOCKS/ERRS  | 41, 600                     |


## Building & Testing

Building, testing and quality assessment are conducted using Travis, Mocha, Chai, Istanbul, Code Climate, and Codacy.

For code quality assessment purposes, the cyclomatic complexity threshold is set to 10.

The unit tests and examples can be run on the server in NodeJS by executing just the index.js files in the relevant directories.

## Notes

The codebase is currently light on error handling and test coverage is only at 40%.

Only two way joins are currently supported.

ReasonDB currently supports Isolation and Durabilty but is not yet ACID compliant. However, there is nothing in the architecture that will prevent it from being ACID for some storage engines. It is currently possible for an object to be written to the database and have a power failure prior to index updates, in which case it will look like the object is not in the database until some type of recovery process is run to index the object. It is also possible for an object to be deleted from an index and have a power failure prior to it being deleted from disk. If some type of recovery process is then run, the object will "magically" re-appear in the index. The first ACID support is likely to be with JSONBlockStore.

Currently updates to object properties are indepedently saved to the database automatically; hence, it is not possible to treat a set of changes to an object as a single transaction. This will be a addressed in a subsequent release by extensions to the `insert` command that will prevent object activation and require explicit database updates to commit changes.

## Updates (reverse chronological order)

2016-12-01 v0.2.5 Added function queries. `where` clause can now be a function that returns an array of rows of objects and ignores the normal look-up process, i.e. array of arrays. ReasonDB continues to handle projections and statistical sampling or row count limits.

2016-11-29 v0.2.4 Added `skipKeys` as a class configuration option to prevent indexing of specified properties.

2016-11-27 v0.2.3 Added `saveIndexAsync:true` as a database startup option. Saves indexes only during idle time, tripling or quadrupling insert speed for locally hosted databases.

2016-11-25 v0.2.2 Introduced the use of `const` producing substantial performance improvements. Tested against local copy of Redis.

2016-11-24 v0.2.1 Updated examples to use `/lib/uuid.js` since the update to v3.0.0 of `uuid` made `uuid` not directly browser loadable. Documentation updates.

2016-11-23 v0.1.9 Documentation updates, code quality improvements.

2016-11-23 v0.1.8 Documentation updates, code quality improvements updated uuid package to v3.0.0.

2016-11-20 v0.1.7 Documentation updates.

2016-11-20 v0.1.6 Added JSONBlockStore.

2016-11-15 v0.1.5 Added performance tests in `examples/load` directory.

2016-11-13 v0.1.4 Further optimizations to ensure action sequencing is correct when using a remote datastore. This fixed issues with Redis. Simplified coding to add new persistence stores.

2016-11-02 v0.1.3 Optimizations to help ensure all the actions required to support one change to a data element are complete prior to initiating another on the same element. This involved replacing Promise calls is functions with a passed reference to the resolver for a top level Promise. Added support for multiple arguments for `insert`, `delete`. Added LevelUpStore. Identified an fixed a couple of edge case Promises that contained `this` references. Corrected a join issue that resulted in right sides that were unrestricted for Redis and Memcache.

2016-10-31 v0.1.2 1.1 was pushed with incorrect test case config.

2016-10-31 v0.1.1 Added support for IronCache, Redis, and Memcached. Improved documentation.

2016-10-30 v0.1.0 Added `first`, `random`, and `sample` to `select`. Made cursor calls to `forEach`, `every`, `some`, `get` asynchronous. See documentation for rationale. Deprecated shared indexes, they did not scale well under volume and made working with localStorage somewhat obscure. This resulted in dropping the `as` clause for `insert`.

2016-10-28 v0.0.6 Added Update statement. Enhanced database to take a start-up flag that makes activating objects for automatic database and index update optional. Repaired 'delete' which broke when cursor.count was changed to a function. Added documentation. Published to npm.

2016-10-27 v0.0.5 Added documentation. Repaired 'when' which broke when cursor.count was changed to a function. Published to npm.

2016-10-26 v0.0.4 Added documentation. Changed `count` on Cursor instances to a function and added `maxCount` as a data member. Not published to npm.

2016-10-25 v0.0.3 First npm publication.

Prior to being re-named, ReasonDB existed as the first auto-synchronizing in-memory JavaScript object database JOQULAR, originally published in April of 2015.


## License

This software is provided as-is under the [MIT license](https://opensource.org/licenses/MIT).
