const mongoose = require('mongoose')
const Schema = mongoose.Schema
const recordSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  method: {
    type: String,
    required: true
  },
  value: {
    type: Number
  },
  shares: {
    type: Number
  },
  date: {
    type: Date,
    required: true
  }
})

module.exports = mongoose.model('Record', recordSchema)
