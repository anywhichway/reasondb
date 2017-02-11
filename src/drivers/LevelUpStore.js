(function() {
	module.exports = function(ReasonDB) {
		class LevelUpStore extends ReasonDB.Store {
			constructor(name,keyProperty,db,clear) {
				super(name,keyProperty,db);
				this.storage = db.levelUPClient(db.name + "/" + name); //db.levelUPClient(db.name);
				this.ready(clear);
			}
			async clear() {
				const me = this,
					promises = [];
				let	resolver,
					rejector;
				const promise = new Promise((resolve,reject) => { resolver = resolve; rejector = reject; });
				me.storage.createKeyStream().on("data", (key) => {
					promises.push(me.delete(key,true));
				}).on("end",() => {
					Promise.all(promises).then(() => {
						resolver(true);
					});
				}).on("error", () => {
					rejector(err);
				});
				return promise;
			}
			async delete(key) {
				const me = this;
				return super.delete(key,() => new Promise((resolve,reject) => {
					me.storage.del(key+".json",{},(err) => {
						if(err) {
							if(err.notFound) {
								resolve(true);
							} else {
								reject(err);
							}
						} else {
							resolve(true);
						}
					});
				}));
			}
			async get(key) {
				const me = this;
				return super.get(key, () => new Promise((resolve,reject) => {
					me.storage.get(key+".json",{},(err,value) => {
						if(err) {
							if(err.notFound) {
								resolve();
							} else {
								reject(err);
							}
						} else if(!value) {
							resolve();
						} else {
							resolve(JSON.parse(value));
						}
					});
				}));
			}
			async set(key,value,normalize) {
				const me = this;
				return super.set(key,value,normalize,(normalized) => new Promise((resolve,reject) => {
					me.storage.put(key+".json",JSON.stringify(normalized),{},(err) => {
						if(err) {
							reject(err);
						} else {
							resolve(true);
						}
					});
				}));
			}
		}
		return LevelUpStore;
	}
}).call(this);