/* eslint-disable prettier/prettier */
//Business logic is here, i.e. all handlers

const fs = require('fs');
const Tour = require('../models/tourModel')
const ApiFeatures = require('../utils/ApiFeatures')
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory')


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
exports.getAllTours = factory.getAll(Tour);

// Get tour by id handler
exports.getTourById = factory.getOne(Tour, {
  path: 'reviews'
})

// Create new tour handler
exports.createNewTour = factory.createOne(Tour);

//Update Tour handler
exports.updateTour = factory.updateOne(Tour);


//Delete tour handler by factory method
exports.deleteTour = factory.deleteOne(Tour);


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




