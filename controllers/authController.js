const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('./../models/userModel');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');



const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

const createAccessToken = (user, res) => {

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  const accessToken = signToken(user._id);

  // cookie creation
  res.cookie('accessToken', accessToken, cookieOptions);

  // removes password from response
  user.password = undefined;

  return accessToken;
}


// ! We don't have to write the try-catch block as on signup call the catchAsync function will be called which will in turn execute the async code inside it and catch any errors if originate and throw the error all together to be handled by the global error handler
exports.signup = catchAsync(async (req, res, next) => {

  // ! In the previous version of signup it was possible for any user to signup as admin, so we will pass only the details which are necessary for normal user login and avoid anything else

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
    // passwordChangedAt: req.body.passwordChangedAt,
    // role: req.body.role
  });

  // * Even if a user tries to input a role manually then also he/she won't be able to do it


  // * JSON Web token auth
  // const accessToken = signToken(newUser._id)
  const accessToken = createAccessToken(newUser, res);

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

  // console.log(user);

  // * Step 3 : If everthing OK,create and send accessToken to the client 
  // const accessToken = signToken(user._id);
  const accessToken = createAccessToken(user, res);


  res.status(200).json({
    status: 'success',
    accessToken
  })
});


// Authenticate user and send error if not valid
exports.authenticate = catchAsync(async (req, res, next) => {

  // TODO :  Step 1) Get the token and check if it exists in the request
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // console.log(token);

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access", 401));
  }

  /* // TODO Step 2) Verification of token
  * - Verify that the provided JSON Web Token is a valid one by checking its signature against our secret key
  * - Also check if the token hasn't expired yet 
  */

  // ?jwt.verify is a synchronous function and takes a callback as its thrid param which gets called upon successful verification
  // We promisified the function with promisify utility of node and now we can use async await here
  const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(decodedToken.userId);


  // TODO Step 3) Check if user exists with the token
  const freshUser = await User.findById(decodedToken.userId);

  if (!freshUser) {
    return next(new AppError("The user belonging to this token does no longer exist!", 401));
  }


  // TODO Step 4) Check if user changed password after JWT was issued
  if (freshUser.changedPasswordAfter(decodedToken.iat)) {
    return next(new AppError('User recently changed password!, Please login again.', 401));
  }

  // * GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
})


// we can't pass additional params to a middleware function that's why we are using wrapper function here which will take roles as input and return a middleware
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles = ['admin','lead-guide'],if role='user'=> unauth
    // console.log(roles);
    // console.log(roles.includes(req.user.role));
    if (!roles.includes(req.user?.role)) {
      console.log(req.user.role);
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  }

}


// * Reset password functionality
// ? Step 1 : User gives his/her email in a post request and the server will then send a token to that email.
// ? Step 2 : Now the user will then send another post request to reset the password with the token from email and new password

// ? With this password will get changed


// TODO : Step 1
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // TODO Step 1 : Get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  //TODO Step 2 : Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  // * We don't have the confirmPassword field in our document at this moment so, mongoose will give validation error as confirmpassword is a required field in our model, so we have to deactivate the validation mechanism, also we can't use update as 
  await user.save({ validateBeforeSave: false });

  //TODO Step 3 : Send it to the user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your passwor? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't, please ignore this`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message
    })
  } catch (error) {
    console.log(error);
    // If there is error in sending the email rest the token and the password expires field
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email, Try again later!!!', 500));
  }


  res.status(200).json({
    status: 'success',
    message: 'Token sent to email'
  })
});


// TODO : Step 2
exports.resetPassword = catchAsync(async (req, res, next) => {

  // TODO Step 1) Get user based on the token
  // * the token coming in the url is the non-encrypted one, but the token in DB is encrypted token

  //TODO Hash the token coming in the url and match with the DB token

  const token = req.params.token;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // get the user with the passed token and also check whether the user's token has expired
  // ? If the passwordResetExpires > current Time then only it is not expired
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });


  //TODO Step 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();


  //TODO Step 3) Update the changePasswordAt property for the user



  //TODO Step 4) Log the user in, Send JWT
  // const accessToken = signToken(user._id);
  const accessToken = createAccessToken(user, res);


  res.status(200).json({
    status: 'success',
    accessToken
  })

})



// TODO : We have created a forgot and reset password functionality but we want our user to be able to change password after login also

exports.updatePassword = catchAsync(async (req, res, next) => {
  // TODO check if password present in the body

  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const passwordConfirm = req.body.passwordConfirm;

  if (!currentPassword || !newPassword || !passwordConfirm) {
    return next(new AppError('Please provide both old and new password correctly', 400));
  }


  // TODO Step 1) Get user from the collection
  const user = await User.findOne({ _id: req.user._id }).select('+password');


  // TODO Step 2)Check if given password is correct


  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Password is not correct, Please give correct password', 401));
  }

  //TODO Step 3) If so, update password
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  //TODO Step 4) Log user in,send JWT token

  const accessToken = createAccessToken(user, res);

  res.status(200).json({
    status: 'success',
    message: 'Password is changed successfully',
    accessToken
  })
})
