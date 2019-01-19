## select 

Selects objects from a database.

### Syntax

```javascript
Promise select([object propertySpecs[,...]])
	.from(function sourceSpec||object sourceSpec[,...]||Cursor sourceSpec)
	[.cross(object sourceSpec||Cursor sourceSpec)||natural(object sourceSpec||Cursor sourceSpec)||.where(object JOQULARPattern)]
	[.<join>]
	.<cursorCommand>
	.then(function(count) ...)
```

### Parameters

`object propertySpecs...` - This is an optional argument. The `propertySpecs...` will automatically be combined into one `propertySpec`. If not provided, it behaves the same way as a SQL `select *`. If provided, then an aliasing object must be used as for `sourceSpec`. The surface of a `propertySpec` has this surface:

```
{<alias>: 
	{key: string asName || object {[as: string asName
										 [,default: any value||function f
										  [,compute: function f
										   [,$: <aggregateFunctionName>: string propertyName]]]]}}}
```

`function sourceSpec` - The class of the object to look for.

`object sourceSpec...` - Aliased classes to join in the search for objects. The `sourceSpec...` will automatically be merges into one object. The surface of the `sourceSpec` has this surface:

```
{<alias>:function class[,<alias>: function class[,...]]}
```

`cursor sourceSpec` - The cursor returned by another `select`.

`object JOQULARPattern` - A [JOQULAR](/#/reasondb/tutorials/joqular) pattern object used to look-up the instances.

`.<join>` - An optional component of a `select` that has this form:

```
.join(object sourceSpec||Cursor sourceSpec)
	[.on(function (object aliasedRecord) { return ... boolean test ...})]
```

### Return Value

A Promise with a then function taking one argument, the `count` of objects inserted.

### Exceptions

Any `JOQULARTypeError` thrown during the validation of the `JOQULARPattern`.

### Example
