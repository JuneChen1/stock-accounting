const axios = require('axios').default

const apiController = {
  searchSymbol: async (req, res) => {
    try {
      const symbol = req.params.symbol
      const BASE_URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?json=1&delay=0&ex_ch='
      // tse
      let response = await axios.get(BASE_URL + `tse_${symbol}.tw|`)
      let data = response.data.msgArray
      if (data.length !== 0) {
        return res.json({ status: 'success', name: data[0].n, list: 'tse' })
      }

      // otc
      response = await axios.get(BASE_URL + `otc_${symbol}.tw|`)
      data = response.data.msgArray
      if (data.length !== 0) {
        return res.json({ status: 'success', name: data[0].n, list: 'otc' })
      }

      res.status(404).json({ status: 'error', message: "symbol didn't exist" })
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = apiController
