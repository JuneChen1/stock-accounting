const axios = require('axios').default

const apiController = {
  searchSymbol: (req, res) => {
    const symbol = req.params.symbol
    const BASE_URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?json=1&delay=0&ex_ch='
    axios.get(BASE_URL + `tse_${symbol}.tw|`)
      .then(response => {
        const data = response.data.msgArray
        if (data.length === 0) {
          return res.json({ status: 'error', message: "symbol didn't exist" })
        }
        res.json({ status: 'success', name: data[0].n })
      }).catch(error => console.warn(error))
  }
}

module.exports = apiController
