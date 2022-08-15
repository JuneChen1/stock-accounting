const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../../controllers/user-controller')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/login', userController.loginPage)
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))
router.get('/logout', userController.logout)

module.exports = router
