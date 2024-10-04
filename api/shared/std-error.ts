export class StdError extends Error {
    public code: string;
    public httpStatus: number;

    constructor(message = 'Internal server error', code = 'internal-server-error', httpStatus = 500) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;

        // Set the prototype explicitly to maintain correct instance of HttpRequestError
        Object.setPrototypeOf(this, StdError.prototype);
    }
}
