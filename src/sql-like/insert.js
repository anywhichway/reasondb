export function Insert(db,objects) {
	return {
		into(ctorOrClass) {
			objects.forEach((item,index,array) => {
				let instance = item;
				if(!(item instanceof ctorOrClass)) {
					instance = Object.create(ctorOrClass.prototype);
					Object.assign(instance,item);
				}
				array[index] = instance;
			});
			return {
				async exec() {
					let count = 0;
					for(const item of objects) {
						await db.putItem(item);
						count++;
					}
					return count;
				}
			}
		}
	}
}