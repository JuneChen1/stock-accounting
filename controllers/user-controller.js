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
  },
  editProfile: async (req, res) => {
    try {
      const _id = req.user._id
      const { name, password, confirmPassword } = req.body
      if (!name) {
        req.flash('error_msg', '名稱為必填')
        return res.redirect('back')
      }
      if (password !== confirmPassword) {
        req.flash('error_msg', '密碼與確認密碼不相符！')
        return res.redirect('back')
      }
      const user = await User.findById(_id)
      if (!user) {
        req.flash('error_msg', '這個使用者不存在')
        return res.redirect('back')
      }
      if (user.name === name && !password) {
        req.flash('success_msg', '儲存成功')
        return res.redirect('back')
      }
      user.name = name
      if (password) {
        const hash = await bcrypt.hash(password, 10)
        user.password = hash
      }
      await user.save()
      req.flash('success_msg', '儲存成功')
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = userController
