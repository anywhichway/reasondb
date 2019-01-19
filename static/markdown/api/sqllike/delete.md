## delete 

Deletes an object from a database.

### Syntax

```javascript
Promise delete()
	.from(function sourceSpec)
	.where(object JOQULARPattern)
	.then(function(count) ...)
```

### Parameters

`function sourceSpec` - The class of the object to delete.

`object JOQULARPattern` - A [JOQULAR](/#/reasondb/tutorials/joqular) pattern object used to look-up the instances to delete.

### Return Value

A Promise with a then function taking one argument, the `count` of objects deleted.

### Exceptions

Any `JOQULARTypeError` thrown during the validation of the `JOQULARPattern`.

### Example
