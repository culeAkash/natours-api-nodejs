const mongoose = require('mongoose')

//Schema for tours 
const toursSchema = new mongoose.Schema({
  name: {
    // Type constraints for different types used in schema definition
    type: String,
    trim: true,
    required: [true, 'A tour must have a name'],
    unique: [true, 'A tour with this name is already present']
  },
  duration: {
    type: Number,
    required: [true, `A tour must have a duration`]
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have well defined group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have difficulty']
  },
  ratingsAverage: {
    type: Number,
    default: 0
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  discount: {
    type: Number
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image"]
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(), //current date and time when the user is created
    //Hide this property from response by default
    select: false
  },
  startDates: [Date]
});

//Creation of models for tours
const Tour = mongoose.model('Tour', toursSchema);


//Now we can use this Tour model for document creation
module.exports = Tour;




















//Now Document created out of the tour model
//The testTour is the instance of the Tour model
// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 2000
// })

//Saving the document into database
// testTour.save().then(doc => {
//   console.log(doc);
// }).catch(err => {
//   console.log(err);
// })