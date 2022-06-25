const express = require('express')
const app = express()
const routes = require('./routes')
const { create } = require('express-handlebars')
const exphbs = create({ defaultLayout: 'main' })
const methodOverride = require('method-override')

const port = 3000

require('./config/mongoose')

app.engine('handlebars', exphbs.engine)
app.set('view engine', 'handlebars')

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(routes)

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`)
})
