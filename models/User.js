const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email : {
        type : String , unique : true
    },
    password : String,

    refreshToken : String,
    resetPasswordToken : String,
    resetPasswordExpires : Date,
    isVerified : {type: Boolean , default:false},
    emailVerificationToken : String,
    emailVerificationExpires : String
})

module.exports = mongoose.model('User', userSchema);