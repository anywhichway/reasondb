function ValueKey({
  kind,
  key,
  expiration = Infinity,
  dtime = Infinity,
  storageLocale = "us",
  btime = Date.now(),
  ctime = btime,
  atime = ctime,
  mtime = btime,
  ownedBy = "", // undefined or null creates bad keys
  createdBy = ownedBy,
  updatedBy = createdBy
}) {
    // ordering with owenr, created, etc closer to front probably better
    return [kind, key, expiration, dtime, storageLocale, btime, ctime, atime, mtime, ownedBy, createdBy, updatedBy];
}

export {ValueKey as default, ValueKey}