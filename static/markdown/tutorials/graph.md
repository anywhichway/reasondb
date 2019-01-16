The graph database syntax supported by `ReasonDB` is similar to that supported by [Gun](https://gun.eco). The basic commands for data insertion and retrieval are: `get(path)`, `value(val)`, `delete()`, `remove()`. There are also more advanced functions `put(value)`, `add(value)`, `merge(value)`, `patch(object)`. See the API documentation for full details. 

The graph data model also <a href="#triggers">supports triggers</a>, `once(function)`, `on(triggers)`, `off(triggers)`. 

Graph data models are very powerul, in fact the indexes of `ReasonDB` are just graphs as <a href="#indexing">explained at the end of this article</a>.

## Adding and Retrieving Data

The simplest way to think of a graph database is like a file system, each value is stored at a unique path. With `ReasonDB`, the paths even look like file paths. You can set a value by accessing a path and providing the value to the `.value` function. You can get a value by simply not providing a value to the `.value` function.

```javascript
await db.get("person/joe/age").value(27);
const age = db.get("/person/joe/age").value(); // age will be 27
```

You can also put values at multiple levels in the graph, not just leaves, e.g.

```javascript
await db.get("a").value("Value at a");
await db.get("a/b").value("Value at b");
```

And, you can provide the path in multiple parts:

```javascript
await db.get("a").get("b").value("Value at b");
```

### Path Expressions

The paths support an expression language that can include typical comparison operators like `>,>=,<,<=, ... etc.`; a wild card, `*`; [JOQULAR](/#/reasondb/tutorials/joqular) predicates, and even functions like (value) => value.length>2. You can also navigate up the graph by using `..`.

```javacript
db.get("person/(id) => id.length <=3/age")
	.forEach(age => console.log(await age.value()));
```

The path expression above is testing the path component and returning all edges with id lengths les than 3 to a cursor, if you want to test the value, then use a colon. The code for each of the below will return `undefined` unless the value stored on `a/b` is "Value at b".

```javascript
const bvalue = await db.get("a/b:(value) => value === "Value at b").value();
```

```javascript
const bvalue = await db.get("a/b:$eq("Value at b)").value();
```

## Deleting Data

To delete data, just access the edge and call `.delete()`.

```javascript
await db.get("person/joe").value("Joe is cool");
await db.get("person/joe/age").value(27);
await db.get("person/joe/age").delete();
const age = db.get("person/joe/age").value(); // age will be undefined
```

## Removing Paths

To remove an edge and all child paths, access the edge and call `.remove()`.

```javascript
await db.get("person/joe").value("Joe is cool");
await db.get("person/joe/age").value(27);
await db.get("person/joe/eyeColor").value("blue");
await db.get("person/joe").delete(); // delete the value on the edge
const comment = await db.get("person/joe").value(); // comment will be undefined
let age = db.get("person/joe/age").value(); // age will be 27
await db.get("person/joe").remove(); // actually remove the edge
age = db.get("person/joe/age").value(); // age will be undefined
```

<a name="triggers">&nbsp;</a>

## Triggers

Triggers are added to graph nodes with the `on(triggers)` function. The `triggers` argument is an object that can have any of the following keys: `get`, `new`, `change`, `delete`, `extend`. These keys contain functions as values with the signatures defined below. The `this` context of the function will be the edge being impacted, so make sure you don't use arrow functions if you need access to the edge.

In all cases the functions can be asynchronous and Promises will be awaited. If you want to run something without waiting, then wrap the function with `<db>.async(function callback)`. This will automatically allow default behavior to continue while also producing a side-effect like logging. 

`get(any currentValue)` - Fires whenever `.value()` is called on a node. It takes one argument, the value about to be returned. It can replace `currentValue` with any value it desires to be returned to the calling application. The security model of `ReasonDB` will use this capability to return `undefined` when access to a value is not permitted. 

```javascript
await db.get("secret")
	.value("you will never be able to use value() to see this text")
	.on({get:(value)=>undefined})
```

`new(any newValue)` - Fires whenever `.value(value)` is called and the existing value on the edge is `undefined`. It can replace `newValue` with any value it desires to be used instead.

```javascript
await db.get("nothing")
	.on({new: (value) => undefined});
await db.get("nothing")
	.value("something");
const value = db.get("nothing").value(); // value = undefined

```

`change(any newValue,any oldValue)` - Fires whenever `.value(value)` is called and the existing value does not match the new value. It is also called after `.delete()` and `newValue` will equal `undefined`. It can replace `newValue` with any value it desires to be used instead. The security model of `ReasonDB` uses this to prevent changes to the database.

```javascript
await db.get("readonly")
	.value("I can't be changed")
	.on({change: (newValue,oldValue) => oldValue}); // always return oldValue
await db.get("readonly")
	.value("I have been changed");
const value = await db.get("readonly")
	.value(); // value = "I can't be changed"
```

`delete()` - Fires whenever `.delete()` is called. If it returns `undefined` the deletion will be aborted.

```javascript

```

`extend(Edge childEdge)` - Fires whenever a child edge is added to an existing edge. Regardless of return value, processing continues.

```javascript

db.get("/").on({extend:function(childEdge) { ... do something ...; }}).

```

`remove(Edge childEdge)` - Fires whenever a child edge is removed from an edge. If it returns anything other than the new `childEdge`, removing the edge is aborted.

```javascript
db.get("/").on({extend:function(childEdge) { ... do something ...; return childEdge; }}).
```

You can chain calls, e.g.

```javascript

db.get("/").on({extend:function(childEdge) { ... do something ...; return newEdge; }})
  .get("a").on({new:function(newValue) { ... do something ...; return newValue; }});
```


### Persisting Triggers

Triggers are automatically persisted and so long as they do not contain closure references will operate when restored. If you need to use triggers that use closures then you must do two things:

1) Ensure you start your database with a cache that can keep the triggers in memory.

2) Ensure you start your database with the option `saveTriggers` set to false.

<a name="indexing>&nbsp;</a>

## Automatically Graphing Objects For Indexing

Unless a graph data model parrallels the business domain being modeled, many people find the mapping of objects to graphs tedious and subject to error because there are many ways to choose path names. To help overcome this obstacle, ReasonDB provides the `.putItem` command. Just give it a JSON object and the graph will be created automatically. The graph created can acutally serve as an index for searching on objects.

```javascript
await db.putItem({name:"joe",age:27});
await db.putItem({name:"mary",age:27});
```

Will first add unique ids to the objects, e.g. `{name:"joe",age:27,"#":"Object@a67fhtkquiryxst"}` and `{name:"mary",age:27,"#":"Object@a68fhtsquirxsy"}`. Then the following paths will be createded:

```
Object/name/"joe"/Object@a67fhtkquiryxst
Object/name/"mary"/Object@a68fhtsquirxsy
Object/age/27/Object@a67fhtkquiryxst
Object/age/27/Object@a68fhtsquirxsy
```

Note above that the path actually has "joe" and "mary" as embedded strings. This is an internal optimization for `ReasonDB` indexes.

You can now query the graph for all 27 year olds as follows:


```javascript
const people = db.get("Object/age/==27/*");
people.forEach(person => console.log(await person.value()));
```

Which will print:

```javacript
{"name":"joe","age:27","#":"Object@a67fhtkquiryxst"}
{"name":"mary","age:27","#":"Object@a68fhtsquirxsy"}
```

The `.value` function is "smart" and knows that if a value represents a unique id, it should return the object, not the id.

You can even use custom classes:

```javascript
class Person {
	constructor(config) {
		Object.assign(this,config);
	}
}

const p1 = new Person({"name":"joe","age:27"}),
	p2 = new Person({"name":"mary","age:27"});
db.putItem(p1);
db.putItem(p2);
```

will result in the following paths being created:


```
Person/name/"joe"/Person@a67fhtkquiryxst
Person/name/"mary"/Person@a68fhtsquirxsy
Person/age/27/Person@a67fhtkquiryxst
Person/age/27/Person@a68fhtsquirxsy
```
