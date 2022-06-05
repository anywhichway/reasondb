import EVALUATORS from "./evaluators.js"

class SchemaValidationError extends TypeError {
    constructor({test,message,...rest}={}) {
        super(message ? message : (EVALUATORS.getFailureMessage(test)||"") + " JSON:" + JSON.stringify(Object.assign({},{test,message,...rest})));
        Object.assign(this,{test,message,...rest});
    }
}

export {SchemaValidationError as default, SchemaValidationError}