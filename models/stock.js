const mongoose = require('mongoose')
const Schema = mongoose.Schema
const stockSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  shares: {
    type: Number,
    required: true
  },
  value: {
    type: Number,
    required: true
  }
})

module.exports = mongoose.model('Stock', stockSchema)
