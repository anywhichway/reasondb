JOQULAR provides a simple declaritive way to match JSON objects during query processes. It is based heavily on the MongoDB pattern matching approach but add support for inline test.

In the context of ReasonDB, JOQULAR provides built-in 56 predicates, almost infinite possibilities with inline tests, and and can be extended with new `$` predicates in as little as one line of code.

The predicates can be broken down into a number of categories including comparisons like `$lt`, set and array operations like `$includes`, type tests like `$isSSN`, text search tests, and logical operators like `$and`. 

The basic use of JOQULAR is best shown with an example. The pattern `{age:{$gte: 21}}` will match `{name: "joe", age: 22}` and `{name: "mary", age: 21}` but not `{name: "mark", age:19}`.

Comparison Operators

`$lt` -

`$lte` -

`$eq` -

`$eeq` -

`$neq` -

`$neeq` -

`$gte` -

`$gt` -

Set and Array Operations


Type Tests

Text Searching

`$echoes` -

`$search` - 

Logical Operators

`$and` -

`$not` -

`$or` -

`$xor` - 

Inline Tests

Inline tests are invoked with the `$` operator.

`{name: {$:value => value.length>=2}}`


Custom Predicates








