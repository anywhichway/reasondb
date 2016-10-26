# reasondb

A 100% native JavaScript client and server database with a SQL like syntax, streaming analytics, 17 built-in predicates (including soundex and RegExp matching), in-line fat arrow predicates, predicate extensibility, fully indexed Dates and Arrays, joins, nested matching, and swapable persistence engines in as little as 45K.


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

## Example

The ReasonDB query language JOQULAR (JavaScript Object Query Language Representation) is designed to look and behave like SQL; however is also supports nested objects, the return of matching JavaScript instances, and streaming analytics. Below are examples of each primary operation supported:

db.insert({name:"Joe",birthday:new Date("1961-01-15")}).into(Object).as(Object).exec().then(() => {	});
db.insert({name:"Mary",birthday:new Date("1961-01-15")}).into(Object).as(Object).exec().then(() => { });
db.insert({name:"Jane",birthday:new Date("1960-02-15")}).into(Object).as(Object).exec().then(() => { });
db.insert({name:"Bill",birthday:new Date("1960-02-15")}).into(Object).as(Object).exec().then(() => {	});
db.delete.from(Object).where({name: "Bill"});

```
// select all Objects where name is not null
db.select().from({$e1: Object}).where({$e1: {name: {$neq: null}}}).exec().then((cursor) => { });
```
```
// select all Objects with a birthday of January 15th
db.select().from({$e1: Object}).where({$e1: {name: {$neq: null},birthday:{date:14,month:0}}}).exec().then((cursor) => { });
```
```
// select all objects where name is not null and pair them with all other objects that do not have the same key			
db.select().from({$o1: Object,$o2: Object}).where({$o1: {name: {$neq: null, $o2: "name"}, "@key": {$neq: {$o2: "@key"}}}}).exec().then((cursor) => {	});
```

				db.select().from({$o: Object}).when({$o: {age: 22}}).then(function(cursor) {
					expect(cursor.count).to.equal(1);
					expect(cursor.every((row) => { return row[0].age===22; })).to.equal(true);
					done();
				});
				db.insert({age:22}).into(Object).as(Object).exec().then(() => {
					db.delete().from({$o1: Object}).where({$o1: {age: 22}}).exec();
				});
			});
		});
```





## Debugging and Testing

Just above the run command a few lines up, you can see a call to .trace. RuleReactor has 3 trace levels that print to the JavaScript console. A value of 0 turns tracing off.

1. Prints when:
	* RuleReactor is starting to run.
	* A specific rule is firing
2. Prints when:
	* A rule is being activated when all it conditions have been met
	* A rule is being de-activated when its conditions are no longer being met or immediately after executing its action
3. Prints when:
	* A new rule is being created
	* New data is being inserted into RuleReactor
	* Data is being bound or unbound from rule. This immediately follows insert for all impacted rules.
	* An object with an impact on a rule is being modified. 
	* A rule is being tested. This happens when at least one of every object in the domain for the rule is bound. It will repeat if a relevant property is changed on a bound object.
	* An object is being removed from the RuleReactor.
	
But, most importantly you can set regular JavaScript break points in your rule conditions! If you have a complex condition, then break it into several functions while doing development.

Note: Breakpoints will not be activated if the RuleReactor is created with the second argument `boost` set to true, because boosting re-writes rule conditions as more performant functions.

To assist in unit testing rules, RuleReactor keeps track of the maximum number of potential matches found for a rule as well as how many times it was tested, activated, or fired. These statistics are printed to the console in the order just listed when the .run command completes if the trace level is set to 3. They are also available as data properties of a rule instance.


# Performance & Size

Preliminary tests show performance close to that of Nools. However, the rule-reactor core is just 41K (19K minified) vs 577K (227K minified) for Nools. At runtime, rule-reactor will also consume many megabytes less memory than nools for its pattern and join processing.


# Building & Testing

Building, testing and quality assessment are conducted using Travis, Mocha, Chai, Istanbul, Code Climate, and Codacity.

For code quality assessment purposes, the cyclomatic complexity threshold is set to 10.

# Notes


# Updates (reverse chronological order)

2016-10-08 v0.1.3 Testing fix for issue #15. Not pushed to npm. See test/issue15.html.

2016-10-08 v0.1.2 Fixed issue #10 and #11 courtesy of @tve. Added test case test/issue11.html. Added example async-assertions.html to provide some guidance on how to integrated with an http server. An example using an actually http server will be forthcoming.

2016-09-14 v0.1.1 Enhanced family example to address question posed in [Issue 2](https://github.com/anywhichway/rule-reactor/issues/2) regarding embedded object matching.

2016-09-06 v0.1.0 Production release. License changed from AGPL to MIT.

2016-06-16 v0.0.29 Fixed [Issue 1](https://github.com/anywhichway/rule-reactor/issues/1). Added unit test. Thanks to [slmmm](https://github.com/slmmm) for identifying.

2016-04-27 v0.0.28 Not published to npm.

* Codacy and CodeClimate driven style quality improvements.

2016-04-27 v0.0.27

* Optimized activation insertion into agenda. Applications with a large number of rules on the agenda with different saliences or that thrash the agenda should run slightly faster.

2016-04-21 v0.0.24 Not published to npm.

* Codacy and CodeClimate driven style quality improvements. 

2016-04-25 v0.0.23

* Added support for indexing primitive objects, e.g. Number, String, Boolean. As a result, this type of pattern will work: exists({to: Number},{to: 1})
* Added support for universal quantification patterns, e.g. forAll({to: Number},{to: 1}). Formerly, only existential were supported.
* Addressed an issue where existential quantification pattern matching sometimes did not return the same result as function based existential quantification. 
The function based quantification was always correct.
* Added unit tests.

2016-04-24 v0.0.22 Not published to npm.

* Added unit tests.
* Renamed function forall for constructor instance checking to forAll. This does not impact the forAll that is used in rules.
* Modified bind to return true/false if it is used to test rules by passing the optional test argument.
* Started building through travis-ci online.

2016-04-21 v0.0.21 

* Added Codacy and NPM badges.

2016-04-21 v0.0.20 Not published to npm.

* Codacy and CodeClimate driven style quality improvements. 

2016-04-21 v0.0.19  Not published to npm.

* Codacy and CodeClimate driven style quality improvements.

2016-04-21 v0.0.18 Not published to npm.

* Codacy and CodeClimate driven style quality improvements. 

2016-04-21 v0.0.17 Not published to npm.

* Corrected some documentation errors
* Codacy and CodeClimate driven style quality improvements. 

2016-04-20 v0.0.16 

* Performance optimizations
* Removal of unused code

2016-04-11	 v0.0.15

* Fixed issue where binding test was looking for instance id rather than instance. Could have resulted in duplicate instances in bindings.
* Documented existential pattern matching.
* Added Miss Manners example.
* exists-and-every.html example renamed to exists-and-forAll.html.
* Improved performance by approximately 25% by adding a rule condition compilation functionality. This can be turned on using an optional boolean argument when instantiating a RuleReactor.
* when run is called with Infinity, stop() must now be explicitly called to stop running.

2016-04-06	 v0.0.14 

* Changed .insert and .remove to .assert and .retract to be consistent with many other rule engines.
* RuleReactor is no longer a singleton, an instance must be created with new RuleReactor(). This effectively provides support for multiple rule sets. 
* Not only have unit tests been added, the RuleReactor itself has had testing capability
added. See documentation section on Debugging and Testing. 
* Modified the internal storage of data from an Array to a Map.
* Added dependency on uuid package for generating internal object ids.
* Added support for JavaScript primitive objects as part of rule domains, e.g. {num: Number}. 
* Added rule validity checking, e.g. ensuring domains variables referenced by conditions are declared for the rule.
* Added existential and universal quantification.
* Corrected issue where rule activations were not being tracked properly when not created as a result of a specific instance.
* Corrected issue where properties only referenced in rule actions were not being made reactive. This prevented proper existential and universal quantification behavior.
* Enhanced documentation

2016-03-31 v0.0.13 No functional changes.

2016-03-31 v0.0.12 No functional changes.

2016-03-31 v0.0.11 Added documentation. Corrected nools performance statements (it is faster than was stated).

2016-03-31 v0.0.10 Salience ordering is now working. Re-worked the cross-product and matching for a 10x performance increase in Firefox and Chrome. Send More Money can now be solved in 2 minutes similar to nools. License changed to GPL 3.0.

2016-03-22 v0.0.9 Improved rule matching further by packing all arrays with -1 in place of undefined. Ensures JavaScript engine does not convert a sparse array into a map internally. Corrected documentation regarding permutations explored for Send More Money.

2016-03-21 v0.0.8 Added Send More Money example for stress testing joins. Further optimized cross-product to reduce heap use. Optimized call of cross-product
in rule processing to reduce possible size of cross-product based on the rule being tested. The net performance improvements have been 5x to 10x, depending on the
nature of the rules and the amount of data being processed.

2016-03-20 v0.0.7 Unpublished code style changes. No functional changes.

2016-03-20 v0.0.6 Rule condition processing optimizations for both speed and memory. Added ability to provide a list of functions as a rule condition to reduce cross-product join load. Enhanced rule condition and action parsing so that only the variable for the relevant object domain needs to be provided. This provides a "hint" to RuleReactor to reduce the number
of objects included in a cross-product. Provided a run option to loosen up the run loop and added the ability to have a callback when complete. In v0.0.0.7 or 8 a Promise implementation will be provided. Loosening up the run loop slows performance, so it is optional. Added a .setOptions function to Rules to choose the cross-product approach for optimizing stack or heap size.
Typically optimizing the stack increases performance (although it may vary across browsers), so it is the default. Heap optimization is required for rules that have very large join possibility. Fixed an issue where sometimes the last rule on the agenda would not fire.

2016-03-17 v0.0.5 Further optimization of cross-product.

2016-03-16 v0.0.4 Further optimization.

2016-03-16 v0.0.3 Unpublished. Reworked cross-product so that it is non-recursive so that more joins can be supported.

2016-03-13 v0.0.2 Performance improvements

2016-03-10 v0.0.1 Original public commit

# License

This software is provided as-is under the [AGPL 3.0 license](https://opensource.org/licenses/AGPL-3.0).