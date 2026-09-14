const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const c = require('../controllers/timetableController');

router.get('/', auth, c.list);
router.post('/', auth, authorize('ADMIN'), c.create);
router.delete('/:id', auth, authorize('ADMIN'), c.remove);

module.exports = router;
