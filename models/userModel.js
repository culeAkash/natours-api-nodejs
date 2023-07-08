const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'A user must have a name'],
    maxlength: [40, "A user can't have more than 40 characters"],
    minlength: [5, "A user can't have less than 5 characters"]
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: [true, "Email already exists! Please use another one."],
    validate: [validator.isEmail, 'Please give a valid email'],
    trim: true,
    lowercase: true
  },
  photo: {
    type: String,
    default: 'default_photo',
  },
  password: {
    type: String,
    required: [true, 'Provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works when we create or save user to database and not on update
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords do not match'
    }
  }
});

// Password encryption
userSchema.pre('save', async function (next) {
  console.log("bcrypt password");
  const user = this;

  // Only run if password was actually modified
  if (!user.isModified("password")) return next();

  //Hashing the password with cost of 12
  user.password = await bcrypt.hash(user.password, 12);

  //delete the confirm password, as it is already validated
  user.passwordConfirm = undefined;
  next();

})

// * This is an instance method, thus it will be available for all user documents
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
}


const User = mongoose.model('User', userSchema);


module.exports = User;