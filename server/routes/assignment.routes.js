const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const c = require('../controllers/assignmentController');

router.get('/', auth, c.list);
router.post('/', auth, authorize('ADMIN', 'TEACHER'), c.create);
router.put('/:id', auth, authorize('ADMIN', 'TEACHER'), c.update);
router.delete('/:id', auth, authorize('ADMIN', 'TEACHER'), c.remove);

module.exports = router;
