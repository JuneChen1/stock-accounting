const bcrypt = require('bcryptjs')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true },
    (req, email, password, done) => {
      User.findOne({ email })
        .then(user => {
          if (!user) {
            return done(null, false, req.flash('error_msg', 'Email 或密碼輸入錯誤'))
          }
          return bcrypt.compare(password, user.password)
            .then(isMatch => {
              if (!isMatch) {
                return done(null, false, req.flash('error_msg', 'Email 或密碼輸入錯誤'))
              }
              return done(null, user)
            })
        })
        .catch(err => done(err, false))
    }))
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })
}
