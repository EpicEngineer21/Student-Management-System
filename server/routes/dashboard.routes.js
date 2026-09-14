const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const c = require('../controllers/dashboardController');

router.get('/admin', auth, authorize('ADMIN'), c.admin);
router.get('/teacher', auth, authorize('TEACHER'), c.teacher);
router.get('/student', auth, authorize('STUDENT'), c.student);
router.get('/dsa', auth, c.dsaDemo);

module.exports = router;
