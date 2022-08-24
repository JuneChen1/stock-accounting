const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
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
  },
  forgotPasswordPage: (req, res) => {
    res.render('forgot-password')
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body
      const user = await User.findOne({ email })
      if (!user) {
        req.flash('error_msg', '這個 Email 未被註冊')
        return res.redirect('/users/password/new')
      }
      // send email
      const token = Math.random().toString(16).slice(3)
      const transporter = nodemailer.createTransport({
        service: 'Hotmail',
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_PASSWORD
        }
      })
      transporter.sendMail({
        from: process.env.MY_EMAIL,
        to: user.email,
        subject: '重設密碼',
        html: `<p>${user.name} 您好</p><p>請點以下連結重新設定密碼：</p><a href="http://${process.env.HOST}/users/password/reset/${token}">重設密碼連結</a><br/><br/><p>連結會在 1 小時後或重設密碼後失效</p>`
      })

      user.resetToken = token
      user.resetExpiration = Date.now() + 3600000
      await user.save()

      req.flash('success_msg', '申請成功！請確認電子郵件')
      res.redirect('/users/login')
    } catch (err) {
      console.warn(err)
    }
  },
  resetPasswordPage: async (req, res) => {
    try {
      const resetToken = req.params.token
      const user = await User.findOne({
        resetToken,
        resetExpiration: { $gte: Date.now() }
      })
      if (!user) {
        req.flash('error_msg', '連結錯誤或已失效')
        return res.redirect('/users/login')
      }
      res.render('reset-password', { id: user._id })
    } catch (err) {
      console.warn(err)
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { id, password, confirmPassword } = req.body
      if (!id) {
        return res.redirect('/users/login')
      }
      if (password !== confirmPassword) {
        req.flash('error_msg', '密碼與確認密碼不相符')
        return res.redirect('back')
      }
      const user = await User.findById(id)
      if (!user) {
        req.flash('error_msg', '使用者不存在')
        return res.redirect('/users/login')
      }
      const hash = await bcrypt.hash(password, 10)
      user.password = hash
      user.resetToken = ''
      user.resetExpiration = ''
      await user.save()
      req.flash('success_msg', '密碼變更成功！')
      res.redirect('/users/login')
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = userController
