export function isSoul(value) {
	if(typeof(value)==="string") {
		const parts = value.split("@");
		return parts.length===2 && parts[0]!=="" && ((parts[0]==="Date" && !isNaN(parseInt(parts[1]))) || parts[1].length===21);
	}
	return false;
}