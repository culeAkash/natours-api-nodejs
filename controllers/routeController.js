//Business logic is here, i.e. all handlers

const fs = require('fs');

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours.json'));


exports.checkID = (req, res, next, id) => {

  console.log("inside param middleware");

  const tour = tours.filter(elem => {
    // console.log(elem._id);
    // console.log(reqId, "reqId");
    return elem._id === id;
  })

  console.log(tour);

  if (tour.length === 0) {
    return res.status(404).json({
      status: "NOT FOUND",
      message: `Tour not found for tourId ${id}`
    })
  }
  next();
}


exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price"
    })
  }
  next();
}



//method for getting all routes
exports.getAllTours = (req, res, next) => {
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
exports.getTourById = (req, res, next) => {
  //variables are present in req.params wrapped in an object

  console.log(req.params);

  const reqId = req.params.id;
  const tour = tours.filter(elem => {
    // console.log(elem._id);
    // console.log(reqId, "reqId");
    return elem._id === reqId;
  })

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
}

// Create new tour handler
exports.createNewTour = (req, res, next) => {
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

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: '<Updated tour here...>'
  });
}


//Delete tour handler
exports.deleteTour = (req, res, next) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
}
