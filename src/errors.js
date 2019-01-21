export class ConstraintViolationError extends Error {
	constructor(...args) {
		super(...args);
		if(Error.captureStackTrace) {
      Error.captureStackTrace(this, ConstraintViolationError);
    }
		this.date = new Date();
	}
}

export class JOQULARTypeError extends TypeError {
	constructor(...args) {
		super(...args);
		if(Error.captureStackTrace) {
      Error.captureStackTrace(this, JOQULARTypeError);
    }
		this.date = new Date();
	}
}

