const mongoose = require('mongoose')
const Schema = mongoose.Schema
const recordSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  price: {
    type: Number
  },
  value: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  }
})

module.exports = mongoose.model('Record', recordSchema)
