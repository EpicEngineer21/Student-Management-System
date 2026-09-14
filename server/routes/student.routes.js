const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const c = require('../controllers/studentController');

router.get('/', auth, authorize('ADMIN', 'TEACHER'), c.list);
router.get('/:id', auth, c.getOne);
router.post('/', auth, authorize('ADMIN'), c.create);
router.put('/:id', auth, authorize('ADMIN'), c.update);
router.delete('/:id', auth, authorize('ADMIN'), c.remove);
router.get('/:id/attendance', auth, c.getAttendance);
router.get('/:id/marks', auth, c.getMarks);

module.exports = router;
