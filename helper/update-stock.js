const Stock = require('../models/stock')
const Record = require('../models/record')
const Realized = require('../models/realized-profit')

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
          Record.deleteMany({ symbol }),
          Realized.create({ symbol, name: stock.name, cost, profit, roi })
        ])
          .catch(err => console.warn)
      }
      stock.value = value
      stock.shares = shares
      stock.save()
    })
    .catch(err => console.warn(err))
}

module.exports = updateStock
