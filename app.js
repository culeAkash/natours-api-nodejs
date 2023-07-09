// We will have all the express configuration in app.js
const express = require('express');
const fs = require('fs');
// const bodyParser = require('body-parser');
const morgan = require('morgan');
const AppError = require('./utils/AppError')
const globalErrorHandler = require('./controllers/errorController')


const userRouter = require('./routes/userRoutes')
const tourRouter = require('./routes/tourRoutes')

const app = express();



// For parsing data coming in post request
app.use(express.json());

console.log(process.env.NODE.ENV);
if (process.env.NODE_ENV === 'development') {
  //logging in express is done by morgan external package
  app.use(morgan('dev'));
}


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