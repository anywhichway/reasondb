const hasKeys = (object) => {
    if(object && typeof(object)==="object") {
        for(const key in object) {
            return true;
        }
    }
    return false;
}

export {hasKeys as default, hasKeys}