In preparation for replicated storage, `ReasonDB` supports conflict resolution, i.e. when an attempt is made to replace one object in the database with another `ReasonDB` will arbitrate which is the best to use. To manage this process, `ReasonDB` maintains a "soul" for each object (this term is borrowed from GunDB). The soul is metadata that tracks the id, creation datetime, last update datetime, a version number, and whether the object is atomic, i.e. nested objects are an intrisic part of the primary object or joined objects. Below is a fragment of code that illustrates the algorithm used:

```
// if the time on the updated objects is the same as the time on the current version
// and the version of the update is the same as the current version
// and the update was originally created the same time as the current version
// and the updated object is identical to the current version of the object
// then just return, no update is necessary
if(utime===ctime && usoul.version===csoul.version 
   && usoul.createdAt===csoul.createdAt && deepEqual(updated,current)) {
	return;
}
// if the time of the update is in the future
// then schedule it for the future to avoid real time skew or time spoofing
if(utime - now > 0) {
	setTimeout(() => this.putItem(updated),utime - now);
	return; 
}
// if the time on the updated object is before the time on the current version
// then just return, no update necessary because current version is more recent
if(utime<ctime) {
	return;
}
// if the time on the updated object is after the time on the current version
// then update the version of the updated soul to the maximum version and use it
if(utime>ctime) {
	usoul.version = Math.max(usoul.version,csoul.version);
	return updated;
}
// if version and update time are the same (very rare)
if(usoul.version===csoul.version && utime===ctime) {
	// if update is more recently created
	// return the object to be used as the update
	if(ucreated>ccreated) { 
		return updated;
	}
	// if current is more recently created
	// then just return, no update necessary 
	if(ccreated>ucreated) { 
		return; // throw away
	}
	// if key is lexically greater (arbitrary but consistent approach)
	// then update the version of the updated soul to the maximum version and use it
	if(usoul["#"]>=csoul["#"]) { 
		usoul.version = Math.max(usoul.version,csoul.version); 
		return updated; // use the update (abitrary but consistent approach)
	}
}
// otherwise something very odd has happened
// e.g. different version numbers but same update or create times
// ignore the update

```