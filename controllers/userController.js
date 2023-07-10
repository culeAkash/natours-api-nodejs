const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const CatchAsync = require('../utils/CatchAsync');


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
exports.getAllUsers = CatchAsync(async (req, res) => {

  const users = await User.find();

  res.status(200).json({
    status: "success",
    data: {
      users
    }
  })
})

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

exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
}

exports.getUserById = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
}

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
}

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined"
  })
}