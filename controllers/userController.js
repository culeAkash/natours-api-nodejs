const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const CatchAsync = require('../utils/CatchAsync');
const factory = require('./handlerFactory')


const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  // console.log(allowedFields);
  // console.log(obj);
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) return newObj[el] = obj[el];
  })
  // console.log(newObj);
  return newObj;
}

// User route handlers


// faking id coming from params before calling the get user by id so we can use that function in here and also use the current logged in user id comming from authController.authenticate()
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
}


// Controller to update user details other than password
exports.updateMe = CatchAsync(async (req, res, next) => {
  // TODO 1) Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update. Please use /updatepassword', 400));
  }

  // TODO 2) Update user document
  const user = await User.findById(req.user._id);

  // user.name = 'Akash';
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
})


exports.deleteMe = CatchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  })
})

// exports.createNewUser = factory.createOne(User);

exports.getAllUsers = factory.getAll(User)

exports.getUserById = factory.getOne(User);

// Do NOT try to update password with this
exports.updateUser = factory.updateOne(User);

//using the generic factory method
exports.deleteUser = factory.deleteOne(User);