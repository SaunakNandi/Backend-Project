class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message); // Overwriting message property of the Error class
    this.statusCode = statusCode; // HTTP status code for the error
    this.data = null; // Additional data associated with the error (initialized to null)
    this.message = message; // Error message
    this.success = false; // Indicates that the API request was not successful
    this.errors = errors; // Array of error details

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
