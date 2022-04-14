export class Exception extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class ArgumentException extends Error {
    public constructor(message?: string) {
        super(message)
        this.name = `ArgumentException`
        this.stack = this.stack || (new Error()).stack
    }
}

/**
 * Exception thrown when the passed in argument is out of range.
 */
export class ArgumentOutOfRangeException extends RangeError {
    public constructor(public readonly paramName?: string, public readonly msg?: string) {
        super(`${paramName} was out of range.` + msg);
        this.name = `ArgumentOutOfRangeException`;
        this.stack = this.stack || (new Error()).stack;
    }
}

export class IndexOutOfRangeException extends RangeError {
    public constructor(public readonly paramName?: string) {
        super(`${paramName} was out of range.` +
            ` Must be non-negative and less than the size of the collection.`)
        this.name = `IndexOutOfRangeException`
        this.stack = this.stack || (new Error()).stack
    }
}

export class NotSupportedException extends Error {

}

/**
 * Invalid Operation Exception
 */
export class InvalidOperationException extends Error {
    public constructor(message?: string) {
        super(message)
        this.name = `InvalidOperationException`
        this.stack = this.stack || (new Error()).stack
    }
}

export class NotImplementedException extends Error {
    public constructor(message?: string) {
        super(message)
        this.name = `NotImplementedException`
        this.stack = this.stack || (new Error()).stack
    }
}
