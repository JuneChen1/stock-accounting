const mongoose = require('mongoose')
const Schema = mongoose.Schema
const realizedSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    required: true
  }
})

module.exports = mongoose.model('Realized', realizedSchema)
