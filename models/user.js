const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: {
    type: String
  },
  resetExpiration: {
    type: Date
  }
})

module.exports = mongoose.model('User', userSchema)
