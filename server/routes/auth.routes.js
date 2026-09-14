const router = require('express').Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.post('/change-password', auth, authController.changePassword);

module.exports = router;
