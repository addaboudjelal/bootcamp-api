const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updateMe, updatePassword, logout } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/me').get(protect, getMe);
router.route('/update').put(protect, updateMe);
router.route('/forgot-password').post(forgotPassword);
router.route('/update-password').put(protect, updatePassword);
router.route('/reset-password/:resettoken').put(resetPassword);
module.exports = router;