/* eslint-disable prettier/prettier */
//Business logic is here, i.e. all handlers

const fs = require('fs');
const Tour = require('../models/tourModel')


//For testing only
// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours.json'));

exports.checkID = (req, res, next, id) => {

  console.log('inside param middleware');

  // const tour = tours.filter(elem => {
  //   // console.log(elem._id);
  //   // console.log(reqId, "reqId");
  //   return elem._id === id;
  // })

  // console.log(tour);

  // if (tour.length === 0) {
  //   return res.status(404).json({
  //     status: "NOT FOUND",
  //     message: `Tour not found for tourId ${id}`
  //   })
  // }
  next();
}



exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,description';

  next();
}


// method for getting all routes
exports.getAllTours = async (req, res, next) => {

  try {
    //Contains all the query params for filtering
    console.log(req.query);


    // BUILD QUERY
    //1A) Filtering
    const queryObject = { ...req.query };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach(fi => delete queryObject[fi]);


    console.log(req.query, queryObject);


    // 1B) Advanaced filtering
    let queryStr = JSON.stringify(queryObject);

    // match for the conditional parameters and replace by appending $ sign to be used as mongoose query params
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
      return `$${match}`;
    })

    console.log(queryStr);



    // {difficulty : 'easy',duration : {$gte : 5}}
    //gte , gt ,lte ,lt



    //find() method returns a query which is then executed when await is used, so if we want to implement pagination or sorting we have to store the query only and implement it later
    // const tours = await Tour.find(queryObject);
    let query = Tour.find(JSON.parse(queryStr));
    // console.log(query);
    // This will only contain the query not the documents, in order to fetch docs we have to await the query execution


    // 2) Sorting
    if (req.query.sort) {
      //In the query param that we are sending from postman, sorting params are seperated by (,), replace them with (' '), as it the standard taken by sort() mongoose function
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
      //if price is same sort by ratingsAverage
      // sort('price ratingsAverage')
    }
    else {
      //default sorting by creation time so that latest added tours appear first
      query = query.sort('-createdAt');
    }


    // 3) Field limiting
    // Limit the response data to required fields given by the user only
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      //If no field parameter provided then select all default fields except __v
      query = query.select('-__v');// excluded the __v from the document
    }




    // 4) Pagination

    // skip(num) skip <num> no. of documents before querying data
    // limit() no. of documents can be limited by this
    // page=2 & limit=5 ==> Skip 5 docs and then return next 5
    // ==> query.skip((page-1)*limit).limit(limit)
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;

    const skip = (page - 1) * limit;

    // Example query : query.skip(2).limit(5)
    query = query.skip(skip).limit(limit);

    //if the page doesn't exist => we don't have enough data
    if (req.query.page) {
      const numberOfTours = await Tour.countDocuments();
      if (skip >= numberOfTours) throw new Error("This page doesn't exist");
    }


    // EXECUTE QUERY

    // const query = Tour.find()
    // .where('duration').equals(5)
    // .where('difficulty').equals('easy');


    const tours = await query;
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
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error
    })
  }

}

// Get tour by id handler
exports.getTourById = async (req, res, next) => {
  //variables are present in req.params wrapped in an object

  console.log(req.params);

  const reqId = req.params.id;

  try {
    const tour =
      // await Tour.findById(reqId);
      await Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: "ERROR"
    })
  }
}

// Create new tour handler
exports.createNewTour = async (req, res, next) => {
  // We have to add a middleware for this to work
  console.log(req.body);

  //If we pass extra parameters in the body they will be ignored as schema is already designed


  // Creating tour using mongoose and real database
  //Directly create document without creating model object
  try {
    //If any validation fails or any other error while adding to database
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    })
    //error will be catched here
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    })
  }

}

//Update Tour handler

exports.updateTour = async (req, res, next) => {

  try {
    const reqId = req.params.id;

    //find doc by id and update the doc
    const updatedTour = await Tour.findByIdAndUpdate(reqId, req.body, {
      //To return the new updated doc as response
      new: true,
      // validation takes place again before updation in database
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        updatedTour
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    })
  }




}


//Delete tour handler
exports.deleteTour = async (req, res, next) => {

  try {
    const reqId = req.params.id;
    await Tour.findByIdAndDelete(reqId);
    res.status(204).json({
      status: 'success',
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    })
  }
}
















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
