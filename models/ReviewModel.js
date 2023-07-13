const mongooose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongooose.Schema({
    review: {
        type: String,
        required: [true, 'Review must be present']
    },
    rating: {
        type: Number,
        max: [5, "Rating can't be greater than 5"],
        min: [1, "Rating can't be less than 1"],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongooose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must belong to a user']
    },
    tour: {
        type: mongooose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a Tour']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

// populate before finding
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    // * Tour must have the reviews, but reviews are not much important to have total info about the parent tour, so we are using virtual populate so that even using parent referencing on getting on tour we get all the reviews given to it
    // this.populate({
    //     path: 'tour',
    //     select: '-guides name'
    // });
    next();
})


// Static method : Can be called directly on the model
// method to get average rating and num of ratings of a particular tour 
reviewSchema.statics.calculateAverageRatings = async function (tourId) {
    // this => poimts to the mode
    // console.log(tourId);
    const stats = await this.aggregate([
        { $match: { tour: tourId } },
        {
            $group: {
                _id: '$tour',
                numberOfRatings: { $sum: 1 },
                averageRatings: { $avg: '$rating' }
            }
        }
    ])

    console.log(stats);

    // save rating stats to tour with given id
    if (stats.length > 0)
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].numberOfRatings,
            ratingsAverage: stats[0].averageRatings
        })
}


// we want to calculate the average rating every time after new review is created
reviewSchema.post('save', function () {
    // this => current review
    // * this.constructor => points to the model, we need to use it as Review is not defined upto this line
    this.constructor.calculateAverageRatings(this.tour);
})



//findByIdAndUpdate
//findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
    // passing the review detail to the post middleware from the pre middleware by binding the review to the query
    this.review = await this.findOne();
    next();
})

reviewSchema.post(/^findOneAnd/, async function () {
    // access the review model and call the static method
    // await this.findOne(); doesn't work here, already executed
    await this.review.constructor.calculateAverageRatings(this.review.tour);
})



const Review = mongooose.model('Review', reviewSchema);

module.exports = Review;