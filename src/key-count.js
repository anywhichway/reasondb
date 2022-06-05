const keyCount = (object,min,max) => {
    let count = 0;
    if(object && typeof(object)==="object") {
        for(const key in object) {
            count++;
            if(count>max) {
                return false;
            }
        }
    }
    if(isNaN(min)) {
        return true;
    }
    return count >= min;
}

export {keyCount as default, keyCount}