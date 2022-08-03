const mongoose = require('mongoose')
const Schema = mongoose.Schema
const stockSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  shares: {
    type: Number,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  }
})

module.exports = mongoose.model('Stock', stockSchema)
