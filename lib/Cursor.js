(function() {
	"use strict";
	class Cursor {
		constructor(classes,cxproduct,projection,classVarMap) {
			this.classes = classes;
			this.cxproduct = cxproduct;
			this.projection = projection;
			this.classVarMap = classVarMap;
			this.position = 0;
		}
		get count() {
			return this.cxproduct.length;
		}
		next() {
			let me = this;
			if(me.position<me.cxproduct.length) {
				return me.get(me.position++);
			}
		}
		move(postition) {
			let me = this;
			if(position>=0 && position<me.cxproduct.length) {
				me.position = position;
			}
		}
		get(row) {
			let me = this;
			if(row>=0 && row<me.cxproduct.length) {
				return new Promise((resolve,reject) => {
					let promises = [];
					row = me.cxproduct.get(row);
					row.forEach((key,col) => {
						promises.push(me.classes[col].index.get(key));
					});
					Promise.all(promises).then((results) => {
						if(me.projection) {
							let result = {};
							Object.keys(me.projection).forEach((property) => {
								let colspec = me.projection[property],
								classVar = Object.keys(colspec)[0],
								key = colspec[classVar],
								col = me.classVarMap[classVar];
								result[property] = results[col][key];
							});
							resolve(result);
						} else {
							resolve(results);
						}
					});
				});
			}
		}
	}

	if(typeof(module)!=="undefined") {
		module.exports = Cursor;
	}
	if(typeof(window)!=="undefined") {
		window.Cursor = Cursor;
	}
})();