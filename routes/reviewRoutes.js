const express = require('express')

const router = express.Router({
    mergeParams: true
});
// params are accessible in the router only in which it is specified, so in order to access a nested route's params we have to us mergeParams : true


const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')


router.use(authController.authenticate);


router.route('/')
    .get(reviewController.getAllReviews)
    // first check if the user is logged in, then check if the logged in user is of role user, then only he/she can access the route
    .post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createnewReview);


router.route('/:id')
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .get(reviewController.getReviewById)












module.exports = router;