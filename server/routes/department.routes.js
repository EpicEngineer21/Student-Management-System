const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const c = require('../controllers/departmentController');

router.get('/', auth, c.list);
router.post('/', auth, authorize('ADMIN'), c.create);
router.put('/:id', auth, authorize('ADMIN'), c.update);
router.delete('/:id', auth, authorize('ADMIN'), c.remove);

module.exports = router;
