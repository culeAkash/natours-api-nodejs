const express = require('express');

const router = express.Router();

const {
  getAllTours,
  getTourById,
  updateTour,
  deleteTour,
  createNewTour,
  aliasTopTours, getTourStats, getMonthlyPlan
} = require('../controllers/tourController');
const authController = require('../controllers/authController');


const reviewRoutes = require('../routes/reviewRoutes');

// * Map the given param placeholder name(s) to the given callback(s).

// ? Parameter mapping is used to provide pre-conditions to routes which use normalized placeholders. For example a :user_id parameter could automatically load a user's information from the database without any additional code,
// * router.param('id', checkID);
// * pram middle ware is executed before any other middlewares
// *It will be executed only for requests having a param

// Routes

// /tours/8679hiuv/reviews POST
///tours/7489y8945/review GET
// * First from the app.js it will come to tour router and then from here to the review routes, where mergeParams is used to acces the tourId there also as if not it will br present in only this route
router.use('/:tourId/reviews', reviewRoutes);



//Route for some special URL
//aliasTopTours middleware will run first and then gatAllTours
router.route('/top-5-cheap').get(aliasTopTours, getAllTours)

//router for aggragation
router.route('/tour-stats').get(getTourStats)

router.route('/monthly-plan/:year').get(getMonthlyPlan)


// ? Now we want to restrict the getAllTours route for authenticated users only. So we will use a middleware function before calling the gatAllTours controller 

router
  .route('/')
  .get(authController.authenticate, getAllTours)
  //we can chain multiple middleware functions to get executed one by one
  .post(createNewTour);

router.route('/:id')
  .patch(updateTour)
  .delete(authController.authenticate, authController.restrictTo('admin', 'lead-guide'), deleteTour)
  .get(getTourById);

// nested route : /tours/dflnrn4354/reviews
// router.route('/:tourId/reviews').post(authController.authenticate, authController.restrictTo('user'), reviewController.createnewReview);

module.exports = router;
