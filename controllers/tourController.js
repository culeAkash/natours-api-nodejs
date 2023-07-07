/* eslint-disable prettier/prettier */
//Business logic is here, i.e. all handlers

const fs = require('fs');
const Tour = require('../models/tourModel')
const ApiFeatures = require('../utils/ApiFeatures')
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');


//For testing only
// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours.json'));

// exports.checkID = (req, res, next, id) => {

//   console.log('inside param middleware');

// const tour = tours.filter(elem => {
// console.log(elem._id);
// console.log(reqId, "reqId");
//   return elem._id === id;
// })

// console.log(tour);

// if (tour.length === 0) {
//   return res.status(404).json({
//     status: "NOT FOUND",
//     message: `Tour not found for tourId ${id}`
//   })
// }
//   next();
// }



exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,description';

  next();
}


// method for getting all routes
exports.getAllTours = catchAsync(async (req, res, next) => {

  // try {

  // EXECUTE QUERY
  const features = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // const query = Tour.find()
  // .where('duration').equals(5)
  // .where('difficulty').equals('easy');


  const tours = await features.mongoQuery;
  // query.sort().select().skip().limit()
  // All these methods return query which can ba again chained with other query methods and then awaited to get our final results

  //SEND RESPONSE
  //Now documents are fetched from DB
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  })


})

// Get tour by id handler
exports.getTourById = catchAsync(async (req, res, next) => {
  //variables are present in req.params wrapped in an object

  console.log(req.params);

  const reqId = req.params.id;

  const tour =
    // await Tour.findById(reqId);
    await Tour.findOne({ _id: req.params.id })

  if (!tour) {
    return next(new AppError(`No tour found with id: ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  })

})




// Create new tour handler
exports.createNewTour = catchAsync(async (req, res, next) => {

  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  })

})

//Update Tour handler

exports.updateTour = catchAsync(async (req, res, next) => {

  // try {
  const reqId = req.params.id;

  //find doc by id and update the doc
  const updatedTour = await Tour.findByIdAndUpdate(reqId, req.body, {
    //To return the new updated doc as response
    new: true,
    // validation takes place again before updation in database
    runValidators: true
  });


  if (!updatedTour) {
    return next(new AppError(`No Tour is found with id : ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedTour
    }
  });

})


//Delete tour handler
exports.deleteTour = catchAsync(async (req, res, next) => {

  // try {
  const reqId = req.params.id;
  const tour = await Tour.findByIdAndDelete(reqId);

  if (!tour) {
    return next(new AppError(`No Tour found with id: ${reqId}`, 404));
  }


  res.status(204).json({
    status: 'success',
  })

})


exports.getTourStats = catchAsync(async (req, res, next) => {

  // try {
  const stats = await Tour.aggregate([
    //stages : doc will pass through all these stages
    {
      $match: {
        ratingsAverage: { $gt: 4.5 }
      }
    },
    {
      $group: {
        // _id: null,
        // _id: '$ratingsAverage',
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }, {
      $sort: { avgPrice: 1 }
    },
    {
      $match: { _id: { $ne: "EASY" } }
    }
  ])


  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });

})


exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;//2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`) //end of
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    }, {
      $addFields: { month: '$_id' }
    }, {
      $project: {
        _id: 0
      }
    }, {
      $sort: { numTours: -1 }// sort by number of tour in descending order
    }, {
      $limit: 12// return only top n records if specified
    }
  ])


  res.status(200).json({
    status: 'success',
    size: plan.length,
    data: {
      plan
    }
  });
})

/**
 * * LOGIC BEHIND OUR GLOBAL EXCEPTION HANDLING DONE BY CATCHASYNC MODULE THAT WE HAVE CREATED IN THE PROJECT
 *
 * ? STEP 1 => WHENEVER A HANDLER IS CALLED FROM THE ROUTES MODULE, THE HANDLER WILL CALL THE CATCHASYNC FUNCTION THAT WE HAVE CREATED IN THE CATCHASYNC MODULE.
 *
 * ? STEP 2 => NOW THE CATCHASYNC METHOD WILL RETURN A FUNCTION WHICH WILL CALL THE ASYNC FUNCTION PASSED FROM THE CONTROLLER TO THE CATCHASYNC METHOD.
 *
 * ? STEP 3 => NOW SINCE THE FUNCTION PASSED FROM HANDLER IS AN ASYNC FUNCTION, IT'S PROMISE IT CATCHED IN CASE OF AN ERROR AND GLOBAL ERROR HANDLING IS CALLED BY THE NEXT(ERROR).
 */









// Mongoose will take care of this functionality by validations
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     })
//   }
//   next();
// }




