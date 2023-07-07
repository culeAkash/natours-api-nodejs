// Global error handling middleware

const AppError = require("../utils/AppError")

// Handle error that are produced when user gives some data in wrong format
// Converts castError to AppError, to set isOperational = true, to handle as trusted error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400);
}


// handle error for duplicating unique field, it is managed by mongoDB driver and not mongoose
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value : ${err.keyValue.name} : Please use another value!`
  return new AppError(message, 400);
}


//handle validation error in prod given by mongoose
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(elem => elem.message);

  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
  console.log(err.name, '13');
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

const sendErrorProd = (err, res) => {
  // ! Operational, trusted errors, send message to client

  // ? We have defined the isOperational parameter in the AppError class and whenever there is a error defined by us then isOperational = true is set, so we can trust that error, to be sent to client as well

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message
    })
  }

  // ! Programming or other unknown error, don't leak error details to client in prod

  else {
    // TODO : Log the error to the console
    // console.log('Error : ', err);

    // ? Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    })
  }
}


module.exports = (err, req, res, next) => {

  // console.log(err.stack);

  err.statusCode = err?.statusCode || 500;
  err.status = err?.status || 'error';


  // * we want to send errors based on environment
  const currEnv = process.env.NODE_ENV;

  if (currEnv === 'development') {
    console.log(err.name, '61');
    sendErrorDev(err, res);
  }
  else if (currEnv === 'production') {

    let error = { ...err };

    if (err.name === 'CastError') error = handleCastErrorDB(error)

    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
    // res.json({})
  }
}


/*
 * NOW WE WANT TO SEND DIFFERENT ERROR MESSAGES FOR PRODUCTION AND DEVELOPMENT ENVIRONMENTS

 ! WE WANT TO DO THAT AS WE DON'T WANT THE CLIENT IN DEVELOPMENT TO SEE MUCH DATA ABOUT THE ERROR, BUT IN DEV ENV WE WAN'T TO SEE MORE DETAILS ABOUT THE ERROR
 
 ! WE WILL BE DOING THAT USING THE PROCESS.ENV.NODE_ENV VARIABLE THAT WE HAVE SET IN THE CONFIG.ENV FILE
 */