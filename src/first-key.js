const firstKey = (object) => {
    if(object && typeof(object)==="object") {
        for(const key in object) {
            return key;
        }
    }
}

export {firstKey as default, firstKey}