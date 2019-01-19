`ReasonDB` supports key value storage using an asynchronus API similar to the [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage). The available methods include:

1) `setItem(key,value)` - adds any type of value and associates it with a key.

2) `putItem(object[,force,options])` - insert the object into the database using the provided options. Uses the `#` property as the key. Objects inserted into the database are indexed so that they can be retrieved quickly using JOQULAR based matching against the indexes.

3) `getItem(key)` - retrieves the value associated with the key

4) `match(pattern)` - returns an [cursor](/#/reasondb/tutorials/cursors) for all values in the database that match the provided [JOQULAR pattern](/#/reasondb/tutorials/joqular).

5) `removeItem(key||object)` - removes item associated with the key, or the object based on its unique identifier `#`.

6) `clear()` - Removes all keys and values from the database.

`key(number)` is not supported because the asynchronous nature of `ReasonDB` can't gurantee the sequential order in which keys get returned.

For more detail see the full [key-value API documentation]/#/reasondb/api/keyvalue).

# Example

```javascript

```










