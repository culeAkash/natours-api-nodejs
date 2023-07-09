const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')

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
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'User role is invalid'
    },
    default: 'user'
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
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
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

// instance method to check for password change time w.r.t token generation time
userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {

  if (this.passwordChangedAt) {

    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);


    console.log(changedTimeStamp, jwtTimeStamp);
    // Password was changed after jwt issue then it sends true, and restricts user 
    return jwtTimeStamp < changedTimeStamp; // 100 < 200

  }

  // false => not changed
  return false;
}

//On user using the forgot password functionality, this instance method will create a new resetToken and encrypt it to store in DB for security measures
userSchema.methods.createPasswordResetToken = function () {

  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // We should never store a plain token in the DB as well, we should encrypt it like password

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;

}


userSchema.pre('save', function (next) {
  let user = this;

  // Only run if password was actually modified, or the document is new
  if (!user.isModified("password") || this.isNew) return next();
  // Sometimes it is possible that saving to DB is slower than JWT generation hence, it will be rendered as that JWT was built before the password change
  //And then the server won't allow the user to access the resource
  // We are subtracting 1s from passwordChangedAt so that it always sets before token issue
  this.passwordChangedAt = Date.now() - 1000;
  next();

})


const User = mongoose.model('User', userSchema);


module.exports = User;