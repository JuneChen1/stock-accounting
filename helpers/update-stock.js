const Stock = require('../models/stock')
const Record = require('../models/record')
const Realized = require('../models/realized-profit')

function updateStock (req, symbol) {
  const userId = req.user._id
  return Promise.all([
    Stock.findOne({ symbol, userId }),
    Record.find({ symbol, userId })
  ])
    .then(([stock, records]) => {
      if (!stock) return
      let value = 0
      let shares = 0
      records.forEach(record => {
        if (record.method === '現金股利') {
          value -= record.value
          return
        }
        value += record.value
        shares += record.shares
      })
      // realized profit
      if (shares === 0) {
        stock.remove()
        let cost = 0
        records.forEach(record => {
          if (record.value > 0) {
            cost += record.value
          }
        })
        const profit = value * -1
        const roi = (Math.round((profit / cost) * 100)).toString() + '%'
        return Promise.all([
          Record.deleteMany({ symbol, userId }),
          Realized.create({ symbol, name: stock.name, cost, profit, roi, userId })
        ])
          .then(() => {
            return 'realized'
          })
          .catch(err => console.warn(err))
      }
      stock.value = value
      stock.shares = shares
      stock.save()
    })
    .catch(err => console.warn(err))
}

module.exports = updateStock
