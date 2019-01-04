export class LFRUStorage {
	constructor(maxCount=100000,step=0.1) {
		this.maxCount = maxCount;
		this.step = step;
		this.data = {};
		this.usage = {};
		this.count = 0;
	}
	setItem(key,value) {
		let node = this.data[key];
		if(node) {
			delete this.usage[node.count].data[key];
			this.usage[node.count].count--;
			if(this.usage[node.count].count<=0) delete this.usage[node.count];
		} else {
			node = this.data[key] = {count:0};
			this.count++;
		}
		node.count++;
		node.value = value;
		this.usage[node.count] || (this.usage[node.count] = {count:0,data:{}});
		this.usage[node.count].count++;
		this.usage[node.count].data[key] = node;
		const limit = this.step < 1 && this.step > 0 ? this.maxCount * this.step : this.maxCount - Math.min(this.maxCount,Math.max(1,this.step));
		if(this.count>this.maxCount) {
			const counts = Object.keys(this.usage).sort((a,b) => parseInt(a) - parseInt(b));
			for(const count of counts) {
				for(const key in this.usage[count]) {
					delete this.usage[count].data[key];
					this.usage[count].count--;
					if(this.usage[count].count<=0) delete this.usage[count];
					delete this.data[key];
					this.count--;
					if(this.count<=0 || this.count<limit) break;
				}
				if(this.count<=0 || this.count<limit) break;
			}
		}
		return value;
	}
	getItem(key) {
		const node = this.data[key];
		if(node) {
			delete this.usage[node.count].data[key];
			this.usage[node.count].count--;
			if(this.usage[node.count].count<=0) delete this.usage[node.count];
			node.count++;
			this.usage[node.count] || (this.usage[node.count] = {count:0,data:{}});
			this.usage[node.count].count++;
			this.usage[node.count].data[key] = node;
			return node.value;
		}
	}
	removeItem(key) {
		const node = this.data[key];
		if(node) {
			delete this.usage[node.count].data[key];
			this.usage[node.count].count--;
			if(this.usage[node.count].count<=0) delete this.usage[node.count];
			delete this.data[key];
			this.count--;
			return true;
		}
		return false;
	}
}