module.exports = class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;

    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    this.isOperational = true;

    // When new object is created and constructor is called, the constructor call won't appear in the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}