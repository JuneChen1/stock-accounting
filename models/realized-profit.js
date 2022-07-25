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
  cost: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  },
  roi: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Realized', realizedSchema)
