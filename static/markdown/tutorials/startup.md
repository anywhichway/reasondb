This article covers <a href="#basic">basic database startup</a>, configuring a <a href="#custom">custom store</a>, and <a href="#options">start-up options</a>.

<a name="basic">&nbsp;</a>

## Basic Database Startup

Starting up a database is simple!

```javascript
import {ReasonDB} from "../index.js";

const db = ReasonDB.db();
```

The above will create an in memory database since their is no official industry standard persistent store that exists for both the browser and NodeJs. However, using a persistent store is easy:

```javascript
import {ReasonDB} from "../index.js";

const db = ReasonDB.db({storage:localStorage});
```

You can now add data using the [key/value](/#/reasondb/tutorials/indexedKeyValue), [graph](/#/reasondb/tutorials/graph), or [SQL like](/#/reasondb/tutorials/SQLlike) API.

```javascript
db.setItem("counter",1);
```

or

```javascript
db.get("counter").value(1);
```

or

```javascript
db.insert({counter: 1}).into(Object);
```



<a name="custom">&nbsp;</a>

## Configuring A Custom Store

So long as your storage engine supports `setItem`, `getItem`, `removeItem`, and `clear` you will have all the power of ReasonDB. That's right you will even have a graph database and SQL like querying. Internally, ReasonDB maps everything to a key value store for maximum portability.

Since [Redis](https://redis.io/) is a very popular key-value store, an example with Redis is provided below.

```javascript
import {ReasonDB} from "../index.js";

const	Redis = require('ioredis');

class RedisStorage extends Redis {
	constructor(...args) {
		super(...args);
	}
	async clear() {
		return this.flushdb();
	}
	async getItem(key) {
		return this.get(key);
	}
	async removeItem(key) {
		return this.del(key);
	}
	async setItem(key,value) {
		return this.set(key,value);
	}
}

const db = ReasonDB.db({storage:new RedisStorage()});

```

<a name="options">&nbsp;</a>

## Start-up Options

A database can be started with a number of options in addition to `storage`:

`predicates` - An object the keys on which are predicate names with functions implementing the predicates as their values. See the [JOQULAR](/#/reasondb/tutorials/joqular) article for the built-in predicates.

`cache` - An object supporting the methods `getItem(string key)`, `setItem(string key,any value)`, and `removeItem(string key)`. You can also pass the value `true`, in which case a built-in LFRU (Least Frequentyly Used) Cache cache will be provided.


this.options = options = Object.assign({},options);
		if(!options.authenticate) options.authenticate = () => true;
		if(!options.storage) options.storage = MEMORYSTORAGE;
		this.schema = Object.assign({},SCHEMA,options.schema);
		this.predicates = Object.assign({},predicates,options.predicates);
		this.cache = new LFRUStorage();
		this.Edge = (config={},force) => {
			return new Edge(this,config,force);
		}
		if(options.onready) this.onready = options.onready;
		this.remote = options.remote||[];
		this.initialized = new Promise(async resolve => {
			const storage = options.storage;
			if(options.clear) await this.clear();
			if(options.authenticate) await options.authenticate.call(this);
			const root = await storage.getItem("/");
			if(!root) await storage.setItem("/",JSON.stringify(this.Edge()));
			await this.secure();
			this.expire();
			if(options.listen) this.listen(options.listen,options);
			resolve();
			if(this.onready) this.onready.call(this);
		});