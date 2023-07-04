// We will have all the express configuration in app.js
const express = require('express');
const fs = require('fs');
// const bodyParser = require('body-parser');
const morgan = require('morgan');


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
  next();
})



// Tour routes
app.use('/api/v1/tours', tourRouter);


//User routes
app.use('/api/v1/users', userRouter);




module.exports = app;




// fs.readFile(`${__dirname}/dev-data/data/tours.json`, 'utf-8', (err, data) => {
  //   console.log(JSON.parse(data));
  // })