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

// * Map the given param placeholder name(s) to the given callback(s).

// ? Parameter mapping is used to provide pre-conditions to routes which use normalized placeholders. For example a :user_id parameter could automatically load a user's information from the database without any additional code,
// * router.param('id', checkID);
// * pram middle ware is executed before any other middlewares
// *It will be executed only for requests having a param

// Routes

//Route for some special URL
//aliasTopTours middleware will run first and then gatAllTours
router.route('/top-5-cheap').get(aliasTopTours, getAllTours)

//router for aggragation
router.route('/tour-stats').get(getTourStats)

router.route('/monthly-plan/:year').get(getMonthlyPlan)


router
  .route('/')
  .get(getAllTours)
  //we can chain multiple middleware functions to get executed one by one
  .post(createNewTour);

router.route('/:id').patch(updateTour).delete(deleteTour).get(getTourById);

module.exports = router;
