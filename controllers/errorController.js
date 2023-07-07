// Global error handling middleware


// TODO : NOW, WHENEVER THERE IS AN ERROR GIVEN BY MONGOOSE, LIKE VALIDATION OR INVALID ID THEY ARE NOT THROWN BY US. SO, THE ISOPERATIONAL IS NULL THERE BUT WE ALSO WANT TO SHOW DETAILS ABOUT THOSE ERRORS IN PRODUCTION. WE WILL TAKE CARE OF THAT IN NEXT STEPS

const sendErrorDev = (err, res) => {
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
    console.log('Error : ', err);

    // ? Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    })
  }
}


module.exports = (err, req, res, next) => {

  console.log(err.stack);

  const statusCode = err?.statusCode || 500;
  const status = err?.status || 'error';


  // * we want to send errors based on environment
  const currEnv = process.env.NODE_ENV;

  if (currEnv === 'development') {
    sendErrorDev(err, res);
  }
  else if (currEnv === 'production') {
    sendErrorProd(err, res);
  }
}


/*
 * NOW WE WANT TO SEND DIFFERENT ERROR MESSAGES FOR PRODUCTION AND DEVELOPMENT ENVIRONMENTS

 ! WE WANT TO DO THAT AS WE DON'T WANT THE CLIENT IN DEVELOPMENT TO SEE MUCH DATA ABOUT THE ERROR, BUT IN DEV ENV WE WAN'T TO SEE MORE DETAILS ABOUT THE ERROR
 
 ! WE WILL BE DOING THAT USING THE PROCESS.ENV.NODE_ENV VARIABLE THAT WE HAVE SET IN THE CONFIG.ENV FILE
 */