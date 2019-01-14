export function Delete(db) {
	return {
		from(ctorOrClassOrAliases) {
			return {
				where(pattern) {
					return {
						async exec() {
							let count = 0;
							await db.match(pattern,{ctor:ctorOrClassOrAliases}).forEach(item => {
								db.removeItem(item);
								count++;
							});
							return count;
						}
					}
				}
			}
			return this;
		}
	}
}