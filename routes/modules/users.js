const express = require('express')
const router = express.Router()
const passport = require('passport')
const { authenticated } = require('../../middleware/auth')
const userController = require('../../controllers/user-controller')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/login', userController.loginPage)
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))
router.get('/logout', userController.logout)
router.get('/password/new', userController.forgotPasswordPage)
router.post('/password/new', userController.forgotPassword)
router.get('/password/reset/:token', userController.resetPasswordPage)
router.post('/password/reset', userController.resetPassword)
router.put('/:id/edit', authenticated, userController.editProfile)

module.exports = router
