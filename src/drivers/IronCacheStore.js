(function() {
	module.exports = function(ReasonDB) {
		class IronCacheStore extends ReasonDB.Store {
			constructor(name,keyProperty,db,clear) {
				super(name,keyProperty,db);
				this.ready(clear);
			}
			async clear() {
				const me = this;
				return new Promise((resolve,reject) => {
					me.db.ironCacheClient.clearCache(me.name, function(err, res) {
						if (err) {
							resolve(false);
						} else {
							resolve(true);
						}
					});
				});
			}
			async delete(key) {
				const me = this;
				return super.delete(key, () => new Promise((resolve,reject) => {
					me.db.ironCacheClient.del(me.name, key, function(err, res) {
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
					me.db.ironCacheClient.get(me.name, key, function(err, res) {
						if (err) {
							resolve();
						} else {
							resolve(JSON.parse(res.value));
						}
					});
				}));
			}
			async set(key,value,normalize) {
				const me = this;
				return super.set(key,value,normalize,(normalized) => new Promise((resolve,reject) => {
					me.db.ironCacheClient.put(me.name, key, { value: JSON.stringify(normalized) }, function(err, res) {
						if (err) {
							reject(err);
						} else {
							resolve(true);
						}
					});
				}));
			}
		}
		return IronCacheStore;
	}
}).call(this)