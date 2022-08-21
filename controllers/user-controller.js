const bcrypt = require('bcryptjs')
const User = require('../models/user')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: async (req, res) => {
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
    try {
      const user = await User.findOne({ email })
      if (user) {
        req.flash('error_msg', '這個 Email 已被註冊')
        return res.redirect('/users/signup')
      }
      const hash = await bcrypt.hash(password, 10)
      await User.create({
        email,
        name,
        password: hash
      })
      req.flash('success_msg', '註冊成功')
      res.redirect('/users/login')
    } catch (err) {
      console.warn(err)
    }
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
