const schedule = require('node-schedule')
const getTodayDividend = require('../helpers/today-dividend-helper')
const Stock = require('../models/stock')
const Record = require('../models/record')
const updateStock = require('../helpers/update-stock')

const rule = new schedule.RecurrenceRule()
rule.hour = 8
rule.minute = 59
rule.tz = 'Etc/GMT-8'

const job = schedule.scheduleJob(rule, function () {
  dividendSchedule()
})

async function dividendSchedule () {
  try {
    const todayDividend = await getTodayDividend
    if (todayDividend.length === 0) return

    const stocks = await Stock.find().lean()
    if (stocks.length === 0) return

    const dividendStocks = []
    stocks.forEach(s => {
      const data = todayDividend.find(d => d.Code === s.symbol)
      if (!data) return
      s.cashDividend = Number(data.CashDividend) || 0
      s.stockDividendRatio = Number(data.StockDividendRatio) * 10 || 0
      if (s.cashDividend !== 0 || s.stockDividendRatio !== 0) {
        dividendStocks.push(s)
      }
    })

    for (let i = 0; i < dividendStocks.length; i++) {
      if (dividendStocks[i].shares <= 0) return
      const symbol = dividendStocks[i].symbol
      const userId = dividendStocks[i].userId
      await Record.create({
        symbol,
        name: dividendStocks[i].name,
        method: '股利',
        value: dividendStocks[i].shares * dividendStocks[i].cashDividend,
        shares: dividendStocks[i].shares * dividendStocks[i].stockDividendRatio,
        date: Date.now(),
        userId
      })
      await updateStock(userId, symbol)
    }
  } catch (err) {
    console.warn(err)
  }
}

module.exports = job
