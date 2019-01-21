`JOQULAR` provides a simple declaritive way to match and validate JSON objects during query processes. It original inspiration was the MongoDB pattern matching approach but it adds support for inline tests, more built-in types, wild card and RegExp key matching, <a href="#functional">functional keys</a>, <a href="#validation">object validation</a>, <a href="#aliasing">aliasing, the provision of default or computed values</a>, <a href="#return">value substitution and partial return</a>, <a href="#freeze">value freezing</a>.

As will be seen in the examples below, a `JOQULAR` pattern is just a JavaScript object. In fact, all JavaScript objects are valid `JOQULAR` patterns with limited functionality, i.e. they will only match other JavaScript objects with identical data values in their leaf properties. In the context of `ReasonDB`, this means that a class instance not created as a result of a database query (and hence lacking an `#` id metadata property) can be used to retrieve similar objects from the database.

`JOQULAR` provides 58 built-in predicates, almost infinite possibilities with inline tests and regular expressions. The `ReasonDB` implementation can be extended with new `$` predicates in as little as one line of code.

The predicates can be broken down into a number of categories including <a href="#comparison-operators">comparisons</a> like `$lt`, <a href="#set-and-array-operators">set and array operations</a> like `$includes`, <a href="#type-tests">type tests</a> like `$isSSN`, <a href="#text-search-tests">text search tests</a>, and <a href="#logical-operators">logical operators</a> like `$and`. You can also use <a href="#wild-cards">wild cards and `RegExp` property matching</a>, <a href="#inline-tests">inline tests</a> and <a href="#custom-predicates">custom predicates</a>. Every predicate can be used for both matching and <a href="#validating">validating</a> objects.

The basic use of `JOQULAR` is best shown with short examples. 

The pattern `{age:{$gte: 21}}` will match `{name: "joe", age: 22}` and `{name: "mary", age: 21}` but not `{name: "mark", age:19}`.

Nesting and logical operators are supported. 

The pattern `{age: {$gte: 21}, address:{city: {$eq: "Seattle", $or: {$eq: "Tacoma"}}}` will match `{name: "mary", age: 21, address:{city: "Seattle", zipcode:"98101"}}}` and `{name: "lauren", age: 25, address:{city: "Tacoma"}}}`

In some cases, predicates can take multiple arguments. When this happens, an array should be used to express the arguments. See `$between` and `$matches` for examples.

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

`$typeof` - Performs a test to see if the value is a `boolean`, `number`, `object`, or `string`, e.g. `{id: {$typeof: "string"}}`.

`$instanceof` - Takes either a constructor or a string name of a constructor registered with `ReasonDB` and ensures the candiate object satisfies `instanceof`, e.g. `{address: {$instanceof: "Object"}}` will match `{name: "joe", address: {city: "Seattle", state: "WA"}}`

### Unary Type Tests

In some cases a test does not take an argument, i.e. it is not comparing the value to something else, it is just verifying it meets certain criteria. By convention these unary tests take `null` as their object value, e.g.

```javascript
{favoriteNumbers: [1,7]}
```

will satisfy

```javascript
{favoriteNumbers: {$isArray: null}}
```

#### Foundational Unary Type Tests

The foundational tests are useful across many applications.

`$isArray` - Examines internals of `ReasonDB` indexes to determine if the property value is an array.

`$isEven` - Returns true if the value is a number and even.

`$isNaN` - Returns true if the value is not a number or is the value `NaN`.

`$isOdd` - Returns true if the value is a number and odd.

#### Extended Unary Type Tests

The extened tests are more business oriented and application specific.

`$isCreditCard` - Uses the Luhn algorithm to verify a number is a credit card number.

`$isEmail` - Uses a regular expression to verify a value is a valid e-mail address. E-mail addresses are remarkably hard to validate. This covers most use cases.

`$isIPAddress` - Returns true if the string is a dot delimited IP address.

`$isSSN` - Returns true if the string is a dash delimited US social security number.

<a name="text-search-tests">&nbsp;</a>

## Text Search Tests

`$echoes` - Uses a soundex algorithm, e.g. `{name: {$echoes "jo"}}` will match `{name: "joe"}`.

`$search` - Looks to see if the search argument is contained in the property value using both stems and trigrams, e.g. `{description: {$search: "cars"}}` will match `{description: "This car is a 1960 Corvair convertible."}` because "car" is a stem of "cars". Leverages full text indexes if available.

<a name="logical-operators">&nbsp;</a>

## Logical Operators

`$and` - Puts multiple constraints on a property value, e.g `{age: {$and: {$gte: 5, $lte: 10}}}`. If you need to use the same predicate twice within a `$and`, you have two choices. Nest the calls: `{age: {$gte: 5, $and:{$gte: 6}}}}}`. You can nest to any depth. Or, use an array: `{age: {$and: [{$gte: 5},{$gte: 6}]}}`.

`$not` - Negates constraints on a property value, e.g `{age: {$not: {$and: {$gte: 5, $lte: 10}}}}`.

`$or` - Puts an or constraint on a property value, e.g. `{age: {$or: {$gte: 5, $lte: 0}}}`.  If you need to use the same predicate twice within an `$or`, you have two choices. Nest the calls: `{age: {$gte: 5, $or:{$lte: 0}}}`. You can nest to any depth. Or, use an array: `{age: {$or: [{$gte: 5},{$lte: 0}]}}`.

`$xor` - Puts an xor constraint on a property value. It operates the same as `$or`, except only allows one value to be true.

<a name="wild-cards">&nbsp;</a>

## Wild Card & RegExp Property Names

To wild card a key use the the special key name `$_`. The below will match any object with any property that contains a value that looks like a social security number.

```javascript
{$_: {$isSSN: null}}
```

To use a regular expression, just provide a key name that looks like a regular expression. Either of the below will match any objects with a property that ends in "name" and has a string value.

```javascript
{"/.*name/":{$typeof: "string"}}
```

```javascript
{[/.*name/]:{$typeof: "string"}} // use shorthand key initialization to ensure a valid `RegExp`.
```

<a name="functional>&nbsp;</a>

## Functional Keys

With `JOQULAR`, even a key can be a function. The below will match any object with a key that has a length greater than 1 where the value of the key is a string.

```javascript
{(key) => key.length > 1]:{$typeof: "string"}}
```

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

To add predicates to `ReasonDB`, just pass them in as an keyed object value for the property `predicates` on the `options` object when creating a database instance, e.g. `new ReasonDB({predicates:{$eq}})`.

Predicates that are not defined this way rely on internals of `ReasonDB` that may change over time and how to create them is not the subject of further documentation.

<a name="validation">&nbsp;</a>

## Validation

`$valid` is itself a predicate and has available to it all other predicates. The below trivial case will always return matching objects:

```javascript
{name:{$typeof:"string",$valid:{$typeof: "string"}}}
```

However, in this case an error will be thrown:

```javascript
{name:{$typeof:"string",$valid:{$typeof: "number"}}}
```

Of course, one would never need to write the code above since the match ensured the type was a string. It is more likely code will be written to do something like the below that will throw a `ConstraintViolationError` with the message `name failed validation $typeof for <value>`.

```javascript
{name:{$typeof:"string",$valid:{$: (value) => value.length>0}}}
```

To trap the errors, provide an error handler that takes the error, the value being checked, the property the value was pulled from, and the object on which the property resides as arguments.


```javascript
{name:{
	$typeof:"string",
	$valid:{$: (value) => value.length>0, 
		onError:(error,value,propertyName,containingObject) => {... do something ...;}}
	}}
```

You can also provide a function as the value for `$valid`. The function takes the property value, the property name, and the containing object as arguments. In the case below the `propertyName` will be `address` and the `containingObject` will at a minimum have a `name` property with a string value and most likely an `address` property, although it could be `undefined` ... part of the reason for the validation!

```javascript
{name:{$typeof:"string"},
 address:{$valid:(theAddress,propertyName,containingObject) => { ... do something ... }}}
```
Note, custom validators must handle their own errors.

<a name="aliasing">&nbsp;</a>

## Aliasing, Defaults, and Computation

For the most part, `ReasonDB` uses `JOQULAR` for pattern matching and selection against indexes and entire objects are returned. However, the lanuage has been designed to support querying and extraction from single JSON objects. To add power when used in this context additional capabilities like column aliasing, default values, and computation are supported.

### Aliasing

The below results in an object of the form `{Age: <number>}` rather than `{age:<number>}`.

```javascript
{age: {$:value => value >= 21, $as: "Age"}}
```

### Computation

Properties that don't exist on match result objects can be computed using `$compute` with a function that takes the current object and current key as arguments.

```javascript
{$instanceof: Person, {access: {$compute: (thisArg,key) => thisArg.age >= 21 ?  "allowed" ? "denied"; }}}
```

will have `thisArg` bound to a Person and `key` bound to `"access"`. It will result in

```javascript
{name: "joe",age: 27,access:"allowed"}
```

when matched against

```javascript
new Person({name:"joe",age:27})
```

### Defaults

Defaults are computed after `$compute` in case the function associated with `$compute` returns `null` or `undefined`.

Defaults can be raw values:

```javascript
{access: {$default: "denied"}}
```

Or, they can be functions that return values, similar to `$compute`, except that they don't take any arguments.

```javascript
{random: {$default: () => Math.random()}}
```

<a name="return">&nbsp;</a>

## Value Substitution and Partial Return

After matching an object it may be desirable to return only a portion of the object or even to replace some values in it. `$return` can be used to achieve these actions.

To return a different value just pass a function that takes the current value as an argument:

```javascript
{name:{$typeof:"string",$return:value=>value.toUpperCase()}}
```

The same approach can be used to return just a portion of a nested object using destructuring:

```javascript
{address:{$typeof:"object",$return:({city,state})=>{city,state}}
```

You can also configure the properties returned:

```javascript
{name:{$typeof:"string",$return:{writable:false}}
```

By default the properties `enumerable`, `configurable`, `writable` will be left as their original values on the property descriptor for the object being modified. This is usualy `true`.

When using configuration the value will default to the existing value, if you want to provide a substitute use `$return.value` or `$return.$value`.

```javascript
{name:{$typeof:"string",$return:{value:"it's a secret"}}
```

```javascript
{name:{$typeof:"string",$return:{$value:(value) => encrypt(value)}}
```

`$return.$value` executes the function immediately using the current value. If you want to provide a function for runtime, just use `$return.value`.

```javascript
{name:{$typeof:"string",$return:{value:() => "it's a secret"}}
```

You can also provide `get` and `set` functions:

```javascript
{name:{$typeof:"string",$return:{get:() => "it's a secret"}}
```

<a name="freeze">&nbsp;</a>

## Freezing Objects and Values

By using `$freeze` you can make values unchangeable. The semantics are slightly different from `Object.freeze` in that `$freeze` can be used to set freeze the value of a single property.

```javascript
 // make name property unconfigurable and un-writable
{name:{$typeof:"string",$freeze:true}}
```

```javascript
// make address property unconfigurable and un-writable
{address:{$typeof:"object",$freeze:true} 
```

```javascript
// address property still changable, address deep frozen
{address:{$typeof:"object",$freeze:{deep:true,property:false}} 
```

```javascript
// address property still changable, address shallow frozen
{address:{$typeof:"object",$freeze:{property:false}} 
```

```javascript
// address property unconfigurable and un-writable, address deep frozen
{address:{$typeof:"object",$freeze:{deep:true}} 
```

```javascript
 // address property unconfigurable and un-writable, address shallow frozen
{address:{$typeof:"object",$freeze:{}}
```
