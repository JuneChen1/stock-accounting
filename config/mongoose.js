const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI)

const db = mongoose.connection

db.on('error', () => {
  console.info('mongodb error')
})

db.once('open', () => {
  console.info('mongodb connected')
})

module.exports = db
