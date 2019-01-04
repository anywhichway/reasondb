import {ReasonDB} from "../index.js";

const db = ReasonDB.db({storage:localStorage,clear:true,onready:run});

async function run() {
	class Person {
		constructor(config) {
			Object.assign(this,config);
		}
	}
	
	await db.get("Person/name/",{
			new:async(value) => console.log("New named person:",value),
			get:async(value) => console.log("Name accesed:",value),
			change:async(newValue,oldValue) => console.log("Name changed:",newValue,oldValue)
	})
	
	const joe = await db.putItem(new Person({name:"joe",age:27}),{reactive:true});
	joe.age = 28;
	
}