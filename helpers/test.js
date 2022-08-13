const getTodayDividend = require('./today-dividend-helper')

async function test () {
  const todayDividend = await getTodayDividend
  console.log(todayDividend)
}

test()
