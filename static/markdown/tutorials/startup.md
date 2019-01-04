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