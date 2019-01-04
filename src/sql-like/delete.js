export class Delete {
	constructor(db) {
		this.db = db;
	}
	from(ctorOrClassOrAliases) {
		this.source = ctorOrClassOrAliases;
		return this;
	}
	where(pattern) {
		if(typeof(this.source)==="function") {
			const query = async () => {
				let count = 0;
				pattern = Object.assign({},pattern);
				pattern.$self = Object.assign({},pattern.$self,{$instanceof:this.source});
				// and
				await this.db.match(pattern).forEach(item => {
					this.db.removeItem(item);
					count++;
				});
				return count;
			}
			return query();
		} else {
			Object.keys(pattern).forEach(key => {
				
			})
		}
	}
}