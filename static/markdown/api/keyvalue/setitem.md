## setItem 

Adds any type of value and associates it with a key. If the value is an object and the database option `indexAllObjects` is truthy, then the object will be added to indexes.

### Syntax

`any result = await db.setItem(string key,any value)`

### Parameters

`string key` - A string containing the name of the key you want to create/update.

`any value` - The value you want to give the key you are creating/updating. It can be of any type.

### Return Value

The return value is that of the underlying storage engine, typically `undefined`.

### Exceptions

### Example