if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const routes = require('./routes')
const handlebarsHelper = require('./helpers/handlebars-helper')
const { create } = require('express-handlebars')
const exphbs = create({ defaultLayout: 'main', helpers: handlebarsHelper })
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const usePassport = require('./config/passport')

const port = process.env.PORT || 3000
const SESSION_SECRET = process.env.SESSION_SECRET || 'ThisIsMySecret'

require('./config/mongoose')
require('./config/dividend-schedule')

app.engine('handlebars', exphbs.engine)
app.set('view engine', 'handlebars')
app.use(express.static('public'))

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))
usePassport(app)
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  next()
})
app.use(routes)

app.listen(port, () => {
  console.info(`Express is running on http://localhost:${port}`)
})
