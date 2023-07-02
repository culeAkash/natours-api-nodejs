// We will have all the express configuration in app.js
const express = require('express');
const fs = require('fs');

const app = express();
const port = 8000;


// For parsing data coming in post request
app.use(express.json());


// app.get('/', (req, res, next) => {
//   res.status(201);
//   const response = {
//     namr: 'Akash Jaiswal',
//     field: 'Engg'
//   }
//   res.send(response)
// })

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours.json`));


// get requests
app.get('/api/v1/tours', (req, res, next) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tour: tours[0]
    }
  });
})

//handling post request
app.post('/api/v1/tours', (req, res, next) => {
  // We have to add a middleware for this to work
  console.log(req.body);

  const tourId = tours[tours.length - 1].id + 1;

  // Create the new Tour object by assigning the id
  const newTour = {
    id: tourId,
    ...req.body
  };

  // Push the new tour detail to the tours array
  tours.push(newTour);

  //We need to stringify the tours object to store in the file
  const toursString = JSON.stringify(tours);

  //Persist the new object in the file
  fs.writeFile(`${__dirname}/dev-data/data/tours.json`, toursString, (err) => {
    res.status(201).json({
      status: 'success',
      data: {
        //send the newly created tour as a response
        tour: newTour
      }
    })
  })



})
























app.listen(port, () => {
  console.log('Listening to port 8000');
})





// fs.readFile(`${__dirname}/dev-data/data/tours.json`, 'utf-8', (err, data) => {
  //   console.log(JSON.parse(data));
  // })