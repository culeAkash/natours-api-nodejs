const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('../utils/CatchAsync')
const AppError = require('../utils/AppError')



const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}


// ! We don't have to write the try-catch block as on signup call the catchAsync function will be called which will in turn execute the async code inside it and catch any errors if originate and throw the error all together to be handled by the global error handler
exports.signup = catchAsync(async (req, res, next) => {

  // ! In the previous version of signup it was possible for any user to signup as admin, so we will pass only the details which are necessary for normal user login and avoid anything else

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  // * Even if a user tries to input a role manually then also he/she won't be able to do it


  // * JSON Web token auth
  const accessToken = signToken(newUser._id)

  // * Send the accessToken to the user
  res.status(201).json({
    status: 'success',
    accessToken,
    data: {
      user: newUser
    }
  })
});


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // * Step 1 : Check if email and password exists in the request
  if (!email || !password) {
    // ! Send error as response
    return next(new AppError('Please provide email and password', 400));
  }

  // * Step 2 : Check if user exists && if password is correct
  // ! We have set the select : password to false, it will no be fetched by find(), we have to select it explicitly

  const user = await User.findOne({ email: email }).select('+password');

  // ! If user doesn't exist then the password check is not possible so we have to check for user availability and then for password

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  console.log(user);

  // * Step 3 : If everthing OK,create and send accessToken to the client 
  const accessToken = signToken(user._id);


  res.status(200).json({
    status: 'success',
    accessToken
  })
});


// Authenticate user and send error if not valid
exports.authenticate = catchAsync(async (req, res, next) => {

  // TODO :  Step 1) Get the token and check if it exists in the request


  // TODO Step 2) Verification of token


  // TODO Step 3) Check if user exists


  // TODO Step 3) Check if user changed password after JWT was issued


  next();
})