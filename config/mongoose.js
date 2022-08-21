const mongoose = require('mongoose')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI)

const db = mongoose.connection

db.on('error', () => {
  console.warn('mongodb error')
})

db.once('open', () => {
  console.info('mongodb connected')
})

module.exports = db
