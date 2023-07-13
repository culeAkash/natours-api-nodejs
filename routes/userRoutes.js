const express = require('express');
const router = express.Router();




const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/forgotpassword', authController.forgotPassword);

router.patch('/resetpassword/:token', authController.resetPassword);

// routes under this will get protected by using this middleware
router.use(authController.authenticate);

router.patch('/updatepassword', authController.updatePassword);

router.get('/getMe', userController.getMe, userController.getUserById);

router.patch('/updateMe', userController.updateMe);

router.delete('/deleteMe', userController.deleteMe);

//Routes under this will be accessable to admins only
router.use(authController.restrictTo('admin'))

router.
  route('/')
  .get(userController.getAllUsers)

router
  .route("/:id")
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router;