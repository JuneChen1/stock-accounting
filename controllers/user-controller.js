const bcrypt = require('bcryptjs')
const User = require('../models/user')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res) => {
    const { email, name, password, confirmPassword } = req.body
    const errors = []
    if (!email || !name || !password || !confirmPassword) {
      errors.push({ message: '所有欄位都是必填' })
    }
    if (password !== confirmPassword) {
      errors.push({ message: '密碼與確認密碼不相符' })
    }
    if (errors.length) {
      return res.render('signup', {
        errors,
        email,
        name,
        password,
        confirmPassword
      })
    }
    User.findOne({ email })
      .then(user => {
        if (user) {
          req.flash('error_msg', '這個 Email 已被註冊')
          return null
        }
        return bcrypt.hash(password, 10)
      })
      .then(hash => {
        if (!hash) return null
        return User.create({
          email,
          name,
          password: hash
        })
      })
      .then(user => {
        if (!user) return res.redirect('/users/signup')
        req.flash('success_msg', '註冊成功')
        res.redirect('/users/login')
      })
      .catch(err => console.warn(err))
  },
  loginPage: (req, res) => {
    res.render('login')
  },
  logout: (req, res) => {
    req.logout()
    req.flash('success_msg', '成功登出')
    res.redirect('/users/login')
  }
}

module.exports = userController
