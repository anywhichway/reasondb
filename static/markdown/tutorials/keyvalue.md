ReasonDB supports key value storage using an asynchronus API similar to the [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage). The available methods include:

1) [async setItem(key,value)](#setitem) - adds any type of value and associates it with a key.

2) [async putItem(object[,force,options])](#putitem) - insert the object into the database using the provided options.

3) [async getItem(key)](#getitem) - retrieves the value associated with the key

4) [async* match(pattern)](#match) = returns an [cursor](/#/reasondb/tutorials/cursors) for all values in the database that match the provided [JOQULAR pattern](/#/reasondb/tutorials/joqular).

5) [async removeItem(key||object||)](#removeitem) - removes item associated with the key, or the object based on its unique identifier.

6) [async clear()](#clear) = Removes all key and values from the database.

`key(number)` is not supported because the asynchronous nature of ReasonDB can't gurantee the sequential order in which keys get returned.

Objects inserted into the database are optionally indexed so that they can be retrieved using

# Example

```javascript

```

<a name="setitem">&nbsp;</a>

## setItem 

Adds any type of value and associates it with a key. If the value is an object and the database option `indexAllObjects` is truthy, then the object will be added to indexes.

### Syntax

`var result = await db.setItem(key,value)`

### Parameters

`key` - A string containing the name of the key you want to create/update.

`value` - The value you want to give the key you are creating/updating. It can be of any type.

### Return Value

The return value is that of the underlying storage engine, typically `undefined`.

### Exceptions

<a name="putitem">&nbsp;</a>

## putItem 

When passed an object, will insert the object into the database using the options provided, which default to those used for database start-up. A unique id and version number will be added to the metadata stored in the `._` property if one does not exist. The id will be accessable through either `._["#"]` or `["#"]`. If the object is already under versioning, its version will be incremented unless call options indicate otherwise.

### Syntax

`var result = await db.putItem(object[,force=false,options=this.options])`

### Parameters

`object` - An object to insert. 

`force` - If truthy, will force a save and index of the object without incrementing the version number and timestamps.

`options` - See [database startup](#/reasondb/tutorials/startup).

### Return Value

The return value is that of the underlying storage engine, typically `undefined`.

### Exceptions



<a name="getitem">&nbsp;</a>

## getItem 

When passed a key name, will return that key's value.

### Syntax

`var result = await db.getItem(key)`

### Parameters

`key` - A string containing the name of the key you want to retrieve the value of.

### Return Value

The value of the item associated with `key`. If there is no item, returns `undefined`.

### Exceptions


<a name="match">&nbsp;</a>

## match 

When passed a [JOQULAR pattern](/#/reasondb/tutorials/joqular), will return a [cursor](/#/reasondb/tutorials/cursors) for all matching objects in the database.

### Syntax

`var result = await db.match(pattern)`

### Parameters

`key` - A string containing the name of the key you want to retrieve the value of.

### Return Value

The value of the item associated with `key`. If there is no item, returns `undefined`.

### Exceptions


<a name="removeitem">&nbsp;</a>

## removeItem 

When passed a key name, will remove that key from the database if it exists. If there is no item associated with the given key, this method will do nothing.

### Syntax

`var result = await db.removeItem(key||object)`

### Parameters

`key` - A string containing the name of the key for which you want to remove the value.

`object` - An object with a unique id in the property `#`.

### Return Value

The return value is that of the underlying storage engine, typically `undefined`.

### Exceptions








