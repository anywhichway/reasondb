class Metadata {
    // copy the array spec below from put when changing structure of metadata
    constructor(version,options =[],extended) {
        let [kind,id,expiration,dtime,storageLocale,btime,ctime,atime,mtime,ownedBy,createdBy,updatedBy] = options;
        if(options.length>0) {
            if(id.startsWith("/")) {
                id = id.substring(1)
            }
            Object.assign(this, {id,version,kind,storageLocale,btime,ctime,atime,mtime,ownedBy,createdBy,updatedBy});
            if(extended) {
                Object.assign(this, {expiration,dtime});
            }
        }
    }
    static create(target,options) {
        let metadata = target["^"];
        metadata ||= new Metadata();
        Object.assign(metadata,options,{id:target["#"]});
        if(!target["^"]) {
            Object.defineProperty(target,"^",{enumerable:false,configurable:true,writable:false,value:metadata})
        }
    }
}

export {Metadata as default, Metadata}