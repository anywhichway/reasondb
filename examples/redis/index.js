import {ReasonDB} from "../../index.js";

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
	
const storage = new RedisStorage();

storage.on("ready",() => { 
	const onready = async function() {
				const cursor = this.match({userId:{$gt:0}});
				for await(const item of cursor) {
					console.log(item);
				}
		},
		db = ReasonDB.db({storage,onready,listen:8081,static:"/Users/Simon/git/reasondb/"}); // if relative should use dirname deeper down and normailize
		
	//console.log(storage);
	
});