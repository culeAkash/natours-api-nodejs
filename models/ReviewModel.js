const mongooose = require('mongoose')

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
        default: Date.now()
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


const Review = mongooose.model('Review', reviewSchema);

module.exports = Review;