## insert 

Inserts an object into a database.

### Syntax

```javascript
Promise insert(object object[,...])
	.into(function sourceSpec)
	.then(function(count) ...)
```

### Parameters

`object object...` - The objects to insert. Objects will automatically be coerced into instances of `class`. Inserting an object with a `#` id that already exists in the database throws a error.`

### Return Value

A Promise with a then function taking one argument, the `count` of objects inserted.

### Exceptions

A `ConstraintViolationError` is thrown when an attempt is made to insert an object with with a `#` id that matches an id that already exists in the database. This is effectively the same as a primary key violation in SQL.

### Example