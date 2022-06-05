import EVALUATORS from "./evaluators.js"

class PatternValidationError extends TypeError {
    constructor({test,message,...rest}={}) {
        super(message ? message : (EVALUATORS.getFailureMessage(test)||"") + " JSON:" + JSON.stringify({test,message,...rest}));
        Object.assign(this,{test,...rest,message});
    }
}
export {PatternValidationError as default, PatternValidationError}