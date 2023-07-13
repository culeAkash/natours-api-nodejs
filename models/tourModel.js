const mongoose = require('mongoose')

//Schema for tours 
const toursSchema = new mongoose.Schema({
  name: {
    // Type constraints for different types used in schema definition
    type: String,
    trim: true,
    required: [true, 'A tour must have a name'],
    unique: [true, 'A tour with this name is already present'],
    maxlength: [40, "A tour can't have more than 40 characters"],
    minlength: [10, "A tour can't have less than 10 characters"]
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
    required: [true, 'A tour must have difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty must be easy, medium or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 0,
    min: [1, "Rating must be greater than 0"],
    max: [5, "Rating must be less than 5"]
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
    type: Number,
    // custom validator
    validate: {
      validator: function (val) {
        // doesn't work on update document, as this will not point to current doc in that case
        // the discount will be invalid if it is more than the price of the tour
        return val < this.price // 100 < 200
        //{this} will contain the current document
      },
      message: "The discount must be less than actual price"
    }
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
  startDates: [Date],
  // secretTour: {
  //   type: Boolean,
  //   default: false
  // }
  // * modelling geospatial data for locations to embed into the tours schema
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    //coordinates must be a number array
    coordinates: [Number],
    address: String,
    description: String
  },
  //* to embed data we have to specify array of that data model into the praent schema, then only they will be treated as seperate documents and not simple objects
  locations: [{
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    //coordinates must be a number
    coordinates: [Number],
    address: String,
    description: String,
    // *the day of the tour on which the users will visit this location
    day: Number
  }],
  //referencing users in tour document
  guides: [
    // guides must be an array
    {
      // of type mongoose objectId
      type: mongoose.Schema.ObjectId,
      // * The "ref" property is set to 'User', indicating that the ObjectIDs in the "guides" array should reference documents in the "User" model
      ref: 'User'
    }
  ]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// this is injected to thd doc when it is converted to object or json , but not persisted in database
toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
})


// virtual populating the reviews for a specific tour
toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});


// QUERY MIDDLEWARE
// toursSchema.pre('find', function (next) {
// this keyword points to the mongo query to which more methods can be chained
//   this.find({ secretTour: { $ne: true } });
//   next();
// })


// document middleware that will run on running save() or create() before the actual processing in DB
// toursSchema.pre("save", function (next) {
//   console.log(this);
//   next();
// })


// Just before find+() is executed this middleware will get executed
// the process of automatically replacing the specified paths in the document with document(s) from other collection(s) is called population.
toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
})


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