const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const c = require('../controllers/attendanceController');

router.get('/', auth, c.list);
router.post('/bulk', auth, authorize('ADMIN', 'TEACHER'), c.bulkMark);
router.put('/:id', auth, authorize('ADMIN', 'TEACHER'), c.update);

module.exports = router;
