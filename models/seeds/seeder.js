const bcrypt = require('bcryptjs')
const db = require('../../config/mongoose')

const User = require('../user')
const Record = require('../record')
const Stock = require('../stock')
const Realized = require('../realized-profit')

const user = require('./seeduser.json').data[0]
const stocks = require('./seedsotcks.json').data
const realizedProfit = require('./seedrealizedprofit.json').data

db.once('open', async () => {
  try {
    const hash = await bcrypt.hash(user.password, 10)
    const currentUser = await User.create({
      email: user.email,
      name: user.name,
      password: hash
    })
    const userId = currentUser._id
    for (const stock of stocks) {
      const symbol = stock.symbol
      const name = stock.name
      const value = stock.value
      const shares = stock.shares
      await Record.create({
        symbol,
        name,
        method: '買入',
        value,
        shares,
        date: Date.now(),
        userId
      })
      await Stock.create({
        symbol,
        name,
        shares,
        value,
        userId
      })
    }
    for (const data of realizedProfit) {
      await Realized.create({
        symbol: data.symbol,
        name: data.name,
        cost: data.cost,
        profit: data.profit,
        roi: data.roi,
        userId
      })
    }
    console.info('created successfully')
    process.exit()
  } catch (err) {
    console.warn(err)
  }
})
