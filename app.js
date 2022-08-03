const express = require('express')
const app = express()
const routes = require('./routes')
const { create } = require('express-handlebars')
const exphbs = create({ defaultLayout: 'main' })
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const usePassport = require('./config/passport')

const port = 3000

require('./config/mongoose')

app.engine('handlebars', exphbs.engine)
app.set('view engine', 'handlebars')

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: 'ThisIsMySecret',
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
