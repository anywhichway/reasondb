Triggers respond to changes in data. They can fire when data is added, updated, or deleted. They can be set to fire just once or whenever changes occur. They are attached to properties on class instance storage by specifying the access path to the property and any desired value match or by using a full graph path if using a graph data model. They can be used to impact the changes being made or just produce side-effects.

## Examples

This code effectively prevents any changes to the names of Persons to strings of less than three characters by returning the `oldValue` in place of the `newValue`.

```javascript
db.on("/Person/name/*",{change:(newValue,oldValue) => 
    typeof(newValue)!=="string" || newValue.length < 3 ? oldValue : newValue});
```

You can also prevent changes by returning `undefined`.

```javascript
db.on("/Person/name/*",{change:(newValue,oldValue) => 
    typeof(newValue)!=="string" || newValue.length < 3 ? oldValue : undefined});
```

You can set multiple triggers at once:

```javascript
db.on("/Person/name/*",{
	change: async (newValue,oldValue) => { console.log("Name change:",newValue,oldValue); },
	new: async (newValue) => { console.log("Name added:",newValue); }});
```

Also see the example `triggers.html` in the GitHub examples directory.

## Impacting Changes vs Producing Side Effects

Synchronous triggers impact change, i.e. they can return values that allow, prevent, or modify the changes being attempted. Asynchronus triggers just produce side effects.

The trigger types include `get`, `new`, `change`, `delete`:

## get

A `get` trigger takes one argument, the current value, and fires every time a property is accessed via `.value()`. If it returns a truthy value other than a Promise, then the current property value is returned to the caller. If it returns a falsy value, then `undefined` is returned to the caller.


## new

A `new` trigger takes one argument, the new value, and fires every time a property value is changed from `undefined` to some value. If it returns a truthy value other than a Promise, then the value update is permited. If it returns a falsy value, then the update is ignored.


## change

A `change` trigger takes two arguments, the new value and the old value, and fires every time a property value is changed. If it returns `undefined` the change is prevented. If it returns any other value other than a Promise, that value is used in place of the the original new value.


## delete

A `delete` trigger takes one argument, the current value, and fires every time a property value is deleted using `.delete()`. If it returns a truthy value other than a Promise, then the deletion is permited. If it returns a falsy value, then the deletion is prevented.
