const axios = require('axios').default
const moment = require('moment')

const today = Date.now()
const year = Number(moment(today).format('YYYY')) - 1911
const dayAndMonth = moment(today).format('MMDD')
const date = year.toString() + dayAndMonth

const BASE_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/TWT48U_ALL'

module.exports = axios.get(BASE_URL)
  .then(function (response) {
    const data = response.data
    const todayDividend = data.filter(item => {
      return item.Date.toString() === date
    })
    return todayDividend
  }).catch(function (error) {
    console.warn(error)
  })
