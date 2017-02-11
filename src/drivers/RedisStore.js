(function() {	
	module.exports = function(ReasonDB) {
		class RedisStore extends ReasonDB.Store {
			constructor(name,keyProperty,db,clear) {
				super(name,keyProperty,db);
				this.storage = this.db.redisClient;
				this.storage.delete = this.storage.del;
				this.ready(clear);
			}
			async clear() {
				const me = this;
				return new Promise((resolve,reject) => {
					const key = me.name + "." + me.keyProperty;
					me.storage.hkeys(me.name, (err, values) => {
						if (err) {
							resolve();
						} else {
							if(values.length===0) {
								resolve();
							} else {
								let multi = me.storage.multi();
								values.forEach((id) => {
									multi = multi.hdel(me.name, id, function(err, res) {
										if (err) {
											reject(err);
										} else {
											resolve(true);
										}
									})
								});
								multi.exec((err,replies) => {
									if(err) {
										console.log(err);
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
					me.storage.hdel(me.name, key, (err, res) => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					});
				}));
			}
			async get(key) {
				const me = this;
				return super.get(key,() => new Promise((resolve,reject) => {
					me.storage.hget(me.name, key, (err, value) => {
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
					me.storage.hset(me.name,key, JSON.stringify(normalized), (err, res) => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					});
				}));
			}
		}
		return RedisStore;
	}
}).call(this);