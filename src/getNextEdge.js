export async function getNextEdge(edge,key,create=true) {
	const storage = edge.db.options.storage,
		nextkey = `${edge.path==="/" ? edge.path : edge.path+"/"}${key}`;
	let next = edge.db.cache ? edge.db.cache.getItem(nextkey) : undefined;
	if(!next) {
		const data = await storage.getItem(nextkey);
		if(!data) {
			if(!create) return null;
			next = edge.db.Edge({path:nextkey});
		} else {
			next = edge.db.Edge(typeof(data)==="string" ? JSON.parse(data) : data);
		}
	}
	return next;
}