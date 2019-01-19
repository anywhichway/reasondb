`ReasonDB` supports a set of commands that use a SQL like naming convention and processing approach. These include `delete`; `insert`;`select` with aliasing, projections, computed columns, where clauses, joins, groupBy, and orderBy, and `update`.

Each statement initiator is available on the `ReasonDB` instance of your application. Once a terminating clause os a statement is called a Promise is returned. Or, in the case of `select` a [cursor](/#/reasondb/tutorials/cursors) and once the cursor completes processing a Promise.

The current version of ReasonDB is schemaless and you just use regular classes constructors in place of tables. If you don't want to use custom classes, just use `Object`.

The `where` clauses associated with `delete`, `select`, and `update` use [JOQULAR](/#/reasondb/tutorials/joqular) for pattern matching.

A series of examples are provided below and further details on the specifics of each command are provides below. Also see the  [API documentation](/#/reasondb/api/sqllike) .

## delete

```javascript
// delete all Persons
db.delete().from(Person)
	.then((count) => ... do something ... });
```

```javascript
// delete all Persons with age 58
db.delete().from(Person)
	.where({age:{$eq:58}})
	.then((count) => ... do something ... });
```

## insert

```javascript
db.insert({name:"juliana",age:58},{name:joe,age:56})
	.into(Person)
	.then((count) => ... do something ...});
```

## select

Before using `select` ensure you understand [cursors](/#/reasondb/tutorials/cursors).

```javascript
db.select()
	.from(Person)
	.forEach({person} => ... do something ...)
	.then((count) => ... do something ...});
```

```javascript
db.select()
	.from(Person)
	.where({Person:{name:"juliana",age:{$eq:58}}})
	.forEach({person} => ... do something ...)
	.then((count) => ... do something ...});
```

```javascript
db.select()
	.from({p:Person})
	.where({p:{name:"juliana",age:{$eq:58}}}) 
	.forEach({person} => ... do something ...)
	.then((count) => ... do something ...});
```

```javascript
db.select({p:
	{
		name:"Name", // aliased using string
		age:{as:"Age"}, // aliased using configuration objects
		gender:{as:"Gender",default:"TBD"}, // aliased with default value
		halfAge:{default:({Age}) => Age/2}, // computed value using aliased column
		twiceAge:{default:({p}) => p.age*2}}, // computed value using aliased object
		avgAvg: {$: {avg:"age"}}, // avg of all ages for all results, min, avg, max are supported
		runningAvgAge:{$: {avg:"age",running:true}} // running avg at the point found in cursor processing
	})
	.from({p:Person})
	.forEach({person} => ... do something ...)
	.then((count) => ... do something ...});
```

```javascript
db.select()
	.from({p1:Person,p2:Person})
	.where({p1:{name:{$eq:"juliana"}},p2:{name:{$eq:{p1:{name:"$"}}}}})
	.every(({p1,p2}) => p1.name===p2.name && p1.name==="juliana")
	.then(() => .. do something ...);
```

```javascript
db.select()
	.from({p1:Person})
	.join({p2:Person})
	.on(({p1,p2}) => p1.name==="juliana" && p1.name===p2.name ? {p1,p2} : false)
	.every(({p1,p2}) => p1.name===p2.name && p1.name==="juliana")
	.then(() => .. do something ...);
```

```javascript
db.select()
	.from({p1:db.select().from(Person)})
	.join({p2:db.select().from(Person)})
	.on(({p1,p2}) => p1.name==="juliana" && p1.name===p2.name ? {p1,p2} : false)
	.every(({p1,p2}) => p1.name===p2.name && p1.name==="juliana")
	.then(() => .. do something ...);
```

```javascript
 db.select()
 	.from({p1:Person})
 	.natural({p2:db.select().from(Person)})
	.some(({p1,p2}) => ... test something ...)
	.then(() => .. do something ...);
```

```javascript
db.select()
	.from({p1:Person})
	.cross(db.select().from({p2:Person}))
	.forEach({p1,p2} => ... do something ...)
	.then((count) => ... do something ...);
```

```javascript
db.select().from(Person)
	.join(db.select().from(Person))
	.on((left,right) => left.name==="juliana" ? {left,right} : false);
	.every(item => ... test something ...)
	.then(() => .. do something ...);
```

```javascript
db.select()
	.from(Person)
	.join(db.select()	.from(Person))
	.on((left,right) => right.name==="juliana" ? {left,right} : false)
	.every(item => ... test something ...)
	.then(() => .. do something ...);
```

```javascript
db.select()
	.from(Person)
	.join(db.select()	.from(Person))
	.on((left,right) => {left,right})
	.some(item => ... test something ...)
	.forEach(item => ... do something ...);
```

```javascript
db.update(Person)
	.set({age:60))
	.where({name:59)
	.then((count) => ... do something ... });
					
					

