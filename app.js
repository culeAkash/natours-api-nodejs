// We will have all the express configuration in app.js
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');


const app = express();
const port = 8000;


// For parsing data coming in post request
// app.use(express.json());
app.use(bodyParser.json());


// Declaring our own middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours.json`));


//method for getting all routes
const getAllTours = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tour: tours
    }
  });
}

//Get tour by id handler
const getTourById = (req, res, next) => {
  //variables are present in req.params wrapped in an object

  console.log(req.params);

  const reqId = req.params.id;



  const tour = tours.filter(elem => {
    // console.log(elem._id);
    // console.log(reqId, "reqId");
    return elem._id === reqId;
  })

  console.log(tour);

  if (tour.length === 0) {
    return res.status(404).json({
      status: "NOT FOUND",
      message: `Tour not found for tourId ${reqId}`
    })
  }


  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
}

// Create new tour handler
const createNewTour = (req, res, next) => {
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
}

//Update Tour handler

const updateTour = (req, res) => {

  const reqId = req.params.id;

  const tour = tours.filter(elem => {
    // console.log(elem._id);
    // console.log(reqId, "reqId");
    return elem._id === reqId;
  })

  console.log(tour);

  if (tour.length === 0) {
    return res.status(404).json({
      status: "NOT FOUND",
      message: `Tour not found for tourId ${reqId}`
    })
  }


  res.status(200).json({
    status: 'success',
    data: '<Updated tour here...>'
  });
}


//Delete tour handler
const deleteTour = (req, res, next) => {
  const reqId = req.params.id;

  const tour = tours.filter(elem => {
    // console.log(elem._id);
    // console.log(reqId, "reqId");
    return elem._id === reqId;
  })

  console.log(tour);

  if (tour.length === 0) {
    return res.status(404).json({
      status: "NOT FOUND",
      message: `Tour not found for tourId ${reqId}`
    })
  }


  res.status(204).json({
    status: 'success',
    data: null
  });
}


// User route handlers
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
}

const createNewUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
}

const getUserById = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
}

const updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
}

const deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
}



// get requests
app.get('/api/v1/tours', getAllTours);

//Get tour by id
app.get('/api/v1/tours/:id', getTourById);


//handling post request
app.post('/api/v1/tours', createNewTour);


// Using PATCH requests
app.patch('/api/v1/tours/:id', updateTour)


//Using delete router
app.delete('/api/v1/tours/:id', deleteTour);


//User routes
app.
  route('/api/v1/users')
  .get(getAllUsers)
  .post(createNewUser);

app.
  route('/api/v1/users/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);




app.listen(port, () => {
  console.log('Listening to port 8000');
})





// fs.readFile(`${__dirname}/dev-data/data/tours.json`, 'utf-8', (err, data) => {
  //   console.log(JSON.parse(data));
  // })