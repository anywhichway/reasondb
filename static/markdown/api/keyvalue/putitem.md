## putItem 

When passed an object, will insert the object into the database using the options provided, which default to those used for database start-up. A unique id and version number will be added to the metadata stored in the `._` property if one does not exist. The id will be accessable through either `._["#"]` or `["#"]`. If the object is already under versioning, its version will be incremented unless call options indicate otherwise.

### Syntax

`any result = await db.putItem(object[,force=false,options=this.options])`

### Parameters

`Object object` - An object to insert. 

`boolean force` - If truthy, will force a save and index of the object without incrementing the version number and timestamps.

`Object options` - See [database startup](#/reasondb/tutorials/startup).

### Return Value

The return value is that of the underlying storage engine, typically `undefined`.

### Exceptions

<a name="match">&nbsp;</a>

### Example