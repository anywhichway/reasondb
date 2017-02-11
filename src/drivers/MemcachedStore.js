(function() {
	module.exports = function(ReasonDB) {
		class MemcachedStore extends ReasonDB.Store {
				constructor(name,keyProperty,db,clear) {
					super(name,keyProperty,db);
					this.storage = this.db.memcachedClient;
					this.ready(clear);
				}
				async clear() {
					const me = this;
					return new Promise((resolve,reject) => {
						const key = me.name + "." + me.keyProperty;
						me.storage.get(key, (err,value) => {
							if (err) {
								resolve();
							} else {
								if(!value) {
									resolve();
								} else {
									me.storage.delete(key, (err, res) => {
										if (err) {
											reject(err);
										} else {
											resolve(true);
										}
									});
								}
							}
						});
					});
				}
				async delete(key) {
					const me = this;
					return super.delete(key,() => new Promise((resolve,reject) => {
						me.storage.delete(key, (err, res) => {
							if (err) {
								reject(err);
							} else {
								resolve(true);
							}
						});
					}));
				}
				async get(key) {
					const me = this;
					return super.get(key,() => new Promise((resolve,reject) => {
						me.storage.get(key, (err,value,key) => {
							if (err) {
								resolve();
							} else {
								if(!value) {
									resolve();
								} else {
									resolve(JSON.parse(value));
								}
							}
						});
					}));
				}
				async set(key,value,normalize) {
					const me = this;
					return super.set(key,value,normalize,(normalized) => new Promise((resolve,reject) => {
						me.storage.set(key,JSON.stringify(normalized), (err, res) => {
							if (err) {
								reject(err);
							} else {
								resolve(true);
							}
						});
					}));
				}
			}
		return MemcachedStore;
	}
}).call(this);