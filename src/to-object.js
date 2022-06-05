const toObject = (value) => {
    const types = {
        "boolean": Boolean,
        "number": Number,
        "string": String
    };
    const type = typeof(value);
    if(type==="object") {
        return value;
    }
    const ctor = types[type];
    return ctor ? new ctor(value) : value;
}

export {toObject as default, toObject}