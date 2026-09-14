const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const c = require('../controllers/marksController');

router.get('/', auth, c.list);
router.post('/', auth, authorize('ADMIN', 'TEACHER'), c.save);
router.post('/publish/:examId', auth, authorize('ADMIN'), c.publishResults);

module.exports = router;
