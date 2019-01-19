## match 

When passed a [JOQULAR pattern](/#/reasondb/tutorials/joqular), will return a [cursor](/#/reasondb/tutorials/cursors) for all matching objects in the database.

### Syntax

`Cursor result = await db.match(Object pattern||string path)`

### Parameters

`Object pattern` - A pattern in JOQULAR syntax.

`string path` - A string containing the name of the key you want to retrieve the value of.

### Return Value

A Cursor to iterate over all the values if any.

### Exceptions


### Example