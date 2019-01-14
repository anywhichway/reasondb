export function Update(db,ctorOrClassName) {
	return {
			set(values) {
				return {
					where(pattern) {
						return {
							async exec() {
								let count = 0;
								await db.match(pattern,{ctor:ctorOrClassName}).forEach(async item => {
									Object.assign(item,values);
									await db.putItem(item);
									count++;
								});
								return count;
							}
						}
					},
					async exec() {
						let count = 0;
						const cname = typeof(ctorOrClassName)==="function" ? ctorOrClassName.name : ctorOrClassName;
						for await(const edge of db.get(`/${cname}/#`)) { 
							for(const id in edge.edges) {
								const item = await db.getObject(id);
								Object.assign(item,values);
								await db.putItem(item);
								count++;
							}
						}
						return count;
					}
				}
			}
		}
	}