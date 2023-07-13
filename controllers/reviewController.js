const Review = require('../models/ReviewModel')
const catchAsync = require('../utils/CatchAsync')
const factory = require('../controllers/handlerFactory')


// middleware to enable use of factory function and decoupling
exports.setTourUserIds = (req, res, next) => {
    // allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}


exports.createnewReview = factory.createOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.getReviewById = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);