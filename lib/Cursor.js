function Cursor(classes,cxproduct,projection,classVarMap) {
	this.classes = classes;
	this.cxproduct = cxproduct;
	this.projection = projection;
	this.classVarMap = classVarMap;
	this.position = 0;
}
Cursor.prototype.next = function() {
	let me = this;
	if(me.position<me.cxproduct.length) {
		return me.get(me.position++);
	}
}
Cursor.prototype.move = function(postition) {
	let me = this;
	if(position>=0 && position<me.cxproduct.length) {
		me.position = position;
	}
}
Cursor.prototype.count = function() {
	return me.cxproduct.length;
}
Cursor.prototype.get = function(row) {
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

module.exports = Cursor;