import {mergeObjects} from "./mergeObjects.js";

export function clone(object) {
		const target = {};
		mergeObjects(target,object);
		return target;
	}