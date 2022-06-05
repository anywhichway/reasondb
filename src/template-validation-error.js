import EVALUATORS from "./evaluators.js"

class TemplateValidationError extends TypeError {
    constructor({test,message,...rest}={}) {
        super(message ? test + " " + message : (EVALUATORS.getFailureMessage(test)||"") + " JSON:" + JSON.stringify(Object.assign({},{test,message,...rest})));
        Object.assign(this,{test,message,...rest});
    }
}

export {TemplateValidationError as default, TemplateValidationError}