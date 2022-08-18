module.exports = {
  authenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/users/login')
  },
  apiAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.status(401).json({ status: 'Unauthorized', message: '請先登入才能使用' })
  }
}
