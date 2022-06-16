const express = require('express')
const app = express()
const routes = require('./routes')
const { create } = require('express-handlebars')
const exphbs = create({ defaultLayout: 'main' })

const port = 3000

require('./config/mongoose')

app.engine('handlebars', exphbs.engine)
app.set('view engine', 'handlebars')

app.use(routes)

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`)
})
