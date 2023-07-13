const express = require('express')

const router = express.Router();

const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')


router.route('/')
    .get(reviewController.getAllReviews)
    // first check if the user is logged in, then check if the logged in user is of role user, then only he/she can access the route
    .post(authController.authenticate, authController.restrictTo('user'), reviewController.createnewReview);













module.exports = router;