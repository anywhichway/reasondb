import {ReasonDB} from "../../index.js";
//const ReasonDB = require("../../dist/reasondb-node.js"),
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
				await this.setItem("test",{userId:1,name:"joe"});
				await this.putItem({userId:2,name:"mary"});
				const cursor = this.match({userId:{$gt:0}});
				for await(const item of cursor) {
					console.log(item);
				}
				const item = await this.getItem("test");
				console.log(item);
		},
		db = ReasonDB.db({storage,clear:true,onready}); //,listen:8081 clear:true,
		
	//console.log(storage);
	
});