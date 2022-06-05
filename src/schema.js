class Schema {
    constructor(options = {
        forClassName,
        manage,
        validate,
        secure,
        index,
        aggregate,
        webhook
    } = {}) {
        Object.assign(this,options);
    }
}

export {Schema as default, Schema}