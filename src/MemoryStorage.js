export class MemoryStorage {
	constructor() {
		this.data = {};
	}
	clear() {
		this.data = {};
	}
	getItem(key) {
		const value = this.data[key];
		return value===undefined ? null : value;
	}
	removeItem(key) {
		delete this.data[key];
	}
	setItem(key,value) {
		return this.data[key] = value;
	}
}