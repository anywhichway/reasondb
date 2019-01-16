ReasonDB cursors are very powerful. They are enhanced JavaScript generator iterables so that they behave much like arrays except their methods are asynchronous, i.e. they support every, find, findIndex, forEach, includes, indexOf, keys, lastIndexOf, map, reduce, reverse, sort, slice, some, and values and can take asynchronous functions as arguments. You can even use array offsets, e.g. `myCursor[0]`, if you first call `withMemory()`.

ReasonDB cursors also support the statistical methods `random` and `sample`.

Assume the following data is in the database:

```javascript
{userId: 1, name: "joe", age:26}
{userId: 2, name: "mary", age:27}
{userId: 3, name: "jack", age: 28}
```

Then you can do the following:


```javascript
	let cursor = db.match({userId:{$gt: 0}});
	
	// you can use a regular for loop
	for await(const item of cursor) {
		console.log(item);
	}
	
	// and reset the cursor to use it again
	cursor.reset();
	
	for await(const item of cursor) {
		console.log(item);
	}
	
	cursor.reset();
	
	// you can give the cursor memory so it is index accessable
	// and tell it to collect statistics
	// Note: this does increase RAM usage
	cursor = cursor.withMemory({seek:true});
	
	//the first time an index is accessed, it must be awaited
	console.log(await cursor[1]); 
	
	// when using arraylike functions, no reset is required if withMemory has been called
	
	// all arraylike functions return Promises
	// they also provide the same argument signature as their Array counterparts
	cursor.forEach((object,index,generator) => console.log(object,index))
	 .then(count => console.log("count",count));
	
	// arraylike functions can also be awaited
	if(await cursor.some(object => object.name==="mary")) {
		console.log("some object has the name mary")
	}
	
	// arraylike functions can even call other async functions
	if(await cursor.every(async (object) => object.name!=null )) {
		console.log("every object has a name")
	}
	
	//since forEach above accesses every array element, await is not needed below
	console.log(cursor[2]);
	
	//although awaiting will not hurt
	console.log(await cursor[2]);
	
	// randomly choose 2 of the results
	await sample = cursor.random(2); 
	console.log(sample); // will be an array with 2 elements
	
	// select a random sample based on age
	// use a margin of error of 50% at a confidence interval of .999
	await sample = cursor.sample({me:.5,ci:999,key:"age"}); 
	console.log(sample); // will be an array with 2 elements
```



