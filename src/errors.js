export class ConstraintViolationError extends Error {
	constructor(...args) {
		super(...args);
		if(Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
		this.date = new Date();
	}
}

export class JOQULARTypeError extends TypeError {
	constructor(...args) {
		super(...args);
		if(Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
		this.date = new Date();
	}
}

