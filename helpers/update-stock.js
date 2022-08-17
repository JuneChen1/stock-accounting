const Stock = require('../models/stock')
const Record = require('../models/record')
const Realized = require('../models/realized-profit')

function updateStock (userId, symbol, del) {
  return Promise.all([
    Stock.findOne({ symbol, userId }),
    Record.find({ symbol, userId })
  ])
    .then(([stock, records]) => {
      if (!stock) return 'no stock'
      let value = 0
      let shares = 0
      records.forEach(record => {
        if (record.method === '股利') {
          value -= record.value
          shares += record.shares
          return
        }
        value += record.value
        shares += record.shares
      })
      // realized profit
      if (shares === 0 && !del) {
        stock.remove()
        let cost = 0
        records.forEach(record => {
          if (record.value > 0 && record.method !== '股利') {
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
      if (shares === 0 && del) {
        return 'no record'
      }
    })
    .catch(err => console.warn(err))
}

module.exports = updateStock
