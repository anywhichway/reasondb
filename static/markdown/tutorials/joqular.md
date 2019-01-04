JOQULAR provides a simple declaritive way to match JSON objects during query processes. It is based heavily on the MongoDB pattern matching approach but adds support for inline tests and simple extension.

In the context of ReasonDB, JOQULAR provides built-in 56 predicates, almost infinite possibilities with inline tests, and and can be extended with new `$` predicates in as little as one line of code.

The predicates can be broken down into a number of categories including <a href="#comparison-operators">comparisons</a> like `$lt`, <a href="#set-and-array-operators">set and array operations</a> like `$includes`, <a href="#type-tests">type tests</a> like `$isSSN`, <a href="#text-search-tests">text search tests</a>, and <a href="#logical-operators">logical operators</a> like `$and`. You can also use <a href="#inline-tests">inline tests</a> and <a href="#custom-predicates">custom predicates</a>.

The basic use of JOQULAR is best shown with an example. The pattern `{age:{$gte: 21}}` will match `{name: "joe", age: 22}` and `{name: "mary", age: 21}` but not `{name: "mark", age:19}`.

In some cases, predicates can take multiple arguments. When this happens, an array shoul dbe used to express the arguments. See `$between` and `$matches` for an example.

<a name="comparison-operators">&nbsp;</a>

## Comparison Operators

`$lt` - Mathematical or string less than, e.g. `{age: {$lt: 21}}`.

`$lte` - Mathematical or string less than or equal, e.g. `{age: {$lte: 21}}`.

`$eq` - Primitive value soft equality, e.g. `{age: {$eq: 21}}` will match both `{age: 21}` and `{age: "21"}`.

`$eeq` - Primitive value strict equality, e.g. `{age: {$eq: 21}}` will match `{age: 21}` and not `{age: "21"}`.

`$neq` - Primitive value soft inequality.

`$neeq` - Primitive value strict inequality.

`$gte` - Mathematical or string greater than or equal, e.g. `{age: {$gte: 21}}`.

`$gt` -  Mathematical or string greater than, e.g. `{age: {$gt: 21}}`.

`$matches` - Applies a regular expression match. If an array argument is used, then the first argument is the regular expression and the second is the desired flags. If a string is passed instead of a regular expression, it will be converted into a regular expression, e.g. `{name: {$match: [/jo*/,"i"]}}` will match `{name: "jo"}` and `{name: "Joe"}`.

<a name="set-and-array-operators">&nbsp;</a>

## Set and Array Operators

`$between` - Tests if a value is between the provided numeric or string values. To make the test inclusive, pass `true` as the final value in the array of arguments, e.g. `{age: {$between: [5,10]}}` and `{age: {$between: [5,10,true]}}` will both match `{age: 6}` but only the second will match `{age: 5}`.

`$outside` - Tests if a value is outside the provided numeric or string values, e.g. `{age: {$outside: [5,10]}}` will match `{age: 11}`.

`$in` - Tests if the value is in the provided array, e.g. `{age: {$in: [5,6]}}` will match `{age: 5}` and `{age: 6}`.

`$nin` - Tests if the value is not in the provided array, e.g. `{age: {$nin: [5,6]}}` will match `{age: 4}` but not `{age: 6}`.

`$includes` - Assumes the target value is an array and checks to see if it includes the provided value, e.g. `{favoriteNumbers: {$includes: 7}}` matches `{favoriteNumbers: [7,13]}`.

`$excludes` - Assumes the target value is an array and checks to see if it excludes the provided value, e.g. `{favoriteNumbers: {$excludes: 8}}` matches `{favoriteNumbers: [7,13]}`.

`$intersects` - Assumes the target value is an array and checks to see if it intersects the provided value, e.g. `{favoriteNumbers: {$intersects: [7,14]}}` matches `{favoriteNumbers: [7,13]}`.

`$disjoint` - Assumes the target value is an array and checks to see if it is disjoint with the provided value, e.g. `{favoriteNumbers: {$disjoint: [3,14]}}` matches `{favoriteNumbers: [7,13]}`.

<a name="type=tests">&nbsp;</a>

## Type Tests

`$typeof` -

`$instanceof` - Takes either a constructor or a string name of a constructor registered with `ReasonDB` and ensures the candiate object satisfies `instanceof`, e.g. `{address: {$instanceof: "Object"}}` will match `{name: "joe", address: {city: "Seattle", state: "WA"}}`

`$isArray` - Examines internals of `ReasonDB` indexes to determine if the property value is an array.

`$isCreditCard` - Uses the Luhn algorithm to verify a number is a credit caard number.

`$isEmail` - Uses a regular expression to verify a value is a valid e-mail address.

`$isEven` - Returns true if the value is a number and even.

`$isIPAddress` - Returns true if the string is a dot delimited IP address.

`$isNaN` - Returns true if the value is not a number or is the value `NaN`.

`$isOdd` - Returns true if the value is a number and odd.

`$isSSN` - Returns true is the string is a dash delimited US social security number.

<a name="text-search-tests">&nbsp;</a>

## Text Search Tests

`$echoes` - Uses a soundex algorithm, e.g. `{name: {$echoes "jo"}}` will match `{name: "joe"}`.

`$search` - Looks to see if the search argument is contained in the property value using both stems and trigrams, e.g. `{description: {$search: "cars"}}` will match `{description: "This car is a 1960 Corvair convertible."}` because "car" is a stem of "cars". Leverages full text indexes if available.

<a name="logical-operators">&nbsp;</a>

## Logical Operators

`$and` - Puts multiple constraints on a property value, e.g `{age: {$and: {$gte: 5, $lte: 10}}}`.

`$not` - Negates constraints on a property value, e.g `{age: {$not: {$and: {$gte: 5, $lte: 10}}}}`.

`$or` - Puts an or constraint on a property value.

`$xor` - Puts an xor constraint on a property value.

<a name="inline-tests">&nbsp;</a>

## Inline Tests

Inline tests are invoked with the `$` operator. They take a single argument, the value of the property being tested for the current object being considered as a match.

```javascript
{name: {$:value => value.length>=2}}
```
<a name="custom-predicates">&nbsp;</a>

## Custom Predicates

Almost all built-in predicates are defined the same way you define a predicate. Just create a function with the name you want prefixed by a `$`. The first argument will always be the value of the property on the object being tested and the second will be the argument to the predicate. If the predicate takes multiple arguments, they will also be present.

Predicates may be of type `async` and/or return `Promises`. If they do, `ReasonDB` will await their resolution.

Below is the definition of `$eq`.

```javascript
	function $eq(a,b) { 
		return a == b; 
	}
```

To add predicates to ReasonDB, just pass them in as an keyed object value for the property `predicates` on the `options` object when creating a database instance, e.g. `new ReasonDB({predicates:{$eq}})`.

Predicates that are not defined this way rely on internals of `ReasonDB` that may change over time and how to create them is not the subject of further documentation.







