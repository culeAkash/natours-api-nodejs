const Review = require('../models/ReviewModel')
const catchAsync = require('../utils/CatchAsync')




exports.createnewReview = catchAsync(async (req, res, next) => {
    const reviewData = req.body;

    const newReview = await Review.create({ user: req.user._id, ...reviewData });

    res.status(201).json({
        status: 'success',
        data: {
            newReview
        }
    })
})


exports.getAllReviews = catchAsync(async (req, res, next) => {

    const reviews = await Review.find();
    // console.log(reviews);


    res.status(200).json({
        status: 'success',
        data: {
            reviews: reviews
        }
    })

})