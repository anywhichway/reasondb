export class GeoPoint {
	constructor(latitude=0,longitude=0,altitude=0) {
		Object.defineProperty(this,"latitude",{enumerable:true,value:latitude});
		Object.defineProperty(this,"longitude",{enumerable:true,value:longitude});
		Object.defineProperty(this,"altitude",{enumerable:true,value:altitude});
		GeoPoint.singletons[`${latitude};${longitude};${altitude}`] = this;
	}
}
GeoPoint.singletons = {};
GeoPoint.dereference = (string,prefixDelimiter="@") => {
	const [_,id] = string.split(prefixDelimiter);
	return GeoPoint.singletons[id] || new GeoPoint(id.split(";").slice(1));
}
GeoPoint.generateId = function(value,prefix) { 
	return `${prefix}${value.latitude};${value.longitude};${value.altitude}`; 
}
GeoPoint.valueKeyed = true;