const express = require('express');
const router = express.Router();




const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const reviewController = require('../controllers/reviewController')

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch('/updatepassword', authController.authenticate, authController.updatePassword);
router.patch('/updateMe', authController.authenticate, userController.updateMe);
router.delete('/deleteMe', authController.authenticate, userController.deleteMe)

router.
  route('/')
  .get(userController.getAllUsers)

router
  .route("/:id")
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router;