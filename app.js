// We will have all the express configuration in app.js
const express = require('express');
const fs = require('fs');
// const bodyParser = require('body-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp');



const AppError = require('./utils/AppError')
const globalErrorHandler = require('./controllers/errorController')


const userRouter = require('./routes/userRoutes')
const tourRouter = require('./routes/tourRoutes')
const reviewRouter = require('./routes/reviewRoutes')

const app = express();



// For parsing data coming in post request in the body
app.use(express.json({
  // body larger than 10kb won't be accepted
  limit: '10kb'
}));

//Data santization against no-sql query injection
// Sanitizes all the mongo query symbols from the body
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

// Prevent param pollution : removing duplicate params in request
// whitelist : for these params duplicates won't be vanished
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

console.log(process.env.NODE.ENV);
// Global middlewares

// Security HTTp headers
app.use(helmet());


if (process.env.NODE_ENV === 'development') {
  //logging in express is done by morgan external package
  app.use(morgan('dev'));
}

// Rate limiting for better security improving security from brute force attacks 
// Allows 100 requests from same IP in one hour
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour'
})
app.use("/api", limiter);





// Declaring our own middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
})



// Tour routes
app.use('/api/v1/tours', tourRouter);


//User routes
app.use('/api/v1/users', userRouter);

//Review routes
app.use('/api/v1/reviews', reviewRouter);


//Router handler for unhandled routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find route for ${req.originalUrl}`
  // })

  //Handling by global error handling middleware
  // const err = new Error(`Can't find route for ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // Express will assume whatever we pass to next() is an error, and then it will skip all the middlewares in between in the stack and go to the global error handling middleware


  // Handling error with AppError class
  const err = new AppError(`Can't find route for ${req.originalUrl}`, 404);

  next(err);
})


// Global error handling middleware
app.use(globalErrorHandler)




module.exports = app;




// fs.readFile(`${__dirname}/dev-data/data/tours.json`, 'utf-8', (err, data) => {
  //   console.log(JSON.parse(data));
  // })