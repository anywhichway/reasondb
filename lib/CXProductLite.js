(function() {
	"use strict";
	function CXProduct(collections){
		this.deleted = {};
		this.collections = (collections ? collections : []);
		Object.defineProperty(this,"length",{set:function() {},get:function() { if(this.collections.length===0){ return 0; } if(this.start!==undefined && this.end!==undefined) { return this.end - this.start; }; var size = 1; this.collections.forEach(function(collection) { size *= collection.length; }); return size; }});
		Object.defineProperty(this,"size",{set:function() {},get:function() { return this.length; }});
	}

	function get(n,collections,dm,c) {
		for (var i=collections.length;i--;)c[i]=collections[i][(n/dm[i][0]<<0)%dm[i][1]];
	}
	CXProduct.prototype.get = function(index){
		var me = this, c = [];
		for (var dm=[],f=1,l,i=me.collections.length;i--;f*=l){ dm[i]=[f,l=me.collections[i].length];  }
		get(index,me.collections,dm,c);
		return c.slice(0);
	}

	if(typeof(module)!=="undefined") {
		module.exports = CXProduct;
	}
	if(typeof(window)!=="undefined") {
		window.CXProduct = CXProduct;
	}
})();
