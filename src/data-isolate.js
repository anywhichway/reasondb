function DataIsolate(target) {
    return new Proxy(target,{
        get(target,property) {
            if(property==="prototype") {
                return;
            }
            const value = target[property],
                type = typeof(value);
            if(type==="function") {
                return DataIsolate(value);
            }
            if(value && type==="object") {
                return DataIsolate(value);
            }
            return value;
        },
        set(target,property) {
            return false;
        },
        deleteProperty(target,property) {
            return false;
        },
        getOwnPropertyDescriptor(target,property) {
            return;
        },
        getPrototypeOf(target) {
            return;
        },
        setPrototypeOf(target,prototype) {
            return false;
        }
    })
}

export {DataIsolate as default, DataIsolate}