const Stock = require('../models/stock')
const Record = require('../models/record')

function updateStock (symbol) {
  return Promise.all([
    Stock.findOne({ symbol }),
    Record.find({ symbol })
  ])
    .then(([stock, records]) => {
      if (!stock) return
      let value = 0
      let shares = 0
      records.forEach(record => {
        if (record.method === '賣出') {
          value -= record.value
          shares -= record.shares
          return
        }
        if (record.method === '現金股利' ) {
          value -= record.value
          return
        }
        value += record.value
        shares += record.shares
      })
      stock.value = value
      stock.shares = shares
      stock.save()
    })
    .catch(err => console.warn(err))
}

module.exports = updateStock
