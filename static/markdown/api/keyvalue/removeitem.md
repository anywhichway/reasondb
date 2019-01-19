## removeItem 

When passed a key name, will remove that key from the database if it exists. If there is no item associated with the given key, this method will do nothing.

### Syntax

`any result = await db.removeItem(string key||Object object)`

### Parameters

`string key` - A string containing the name of the key for which you want to remove the value.

`Object object` - An object with a unique id in the property `#`. This is then used to remove the item by making a subcall to `removeItem`.

### Return Value

The return value is that of the underlying storage engine, typically `undefined`.

### Exceptions

### Example