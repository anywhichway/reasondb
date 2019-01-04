export class Insert  {
	constructor(db,objects) {
		this.db = db;
		this.objects = objects;
	}
	into(ctorOrClass) {
		this.objects.forEach((item,index,array) => {
			const instance = Object.create(ctorOrClass.prototype);
			array[index] = Object.assign(instance,item);
		});
		const query = async () => {
			let count = 0;
			for(const item of this.objects) {
				await this.db.putItem(item);
				count++;
			}
			return count;
		}
		return query();
	}
	
}