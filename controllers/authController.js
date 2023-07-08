const User = require('./../models/userModel');
const catchAsync = require('../utils/CatchAsync')


// ! We don't have to write the try-catch block as on signup call the catchAsync function will be called which will in turn execute the async code inside it and catch any errors if originate and throw the error all together to be handled by the global error handler
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  })
});