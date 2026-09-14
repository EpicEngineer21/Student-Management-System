const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const c = require('../controllers/courseController');

router.get('/', auth, c.list);
router.post('/', auth, authorize('ADMIN'), c.create);
router.put('/:id', auth, authorize('ADMIN'), c.update);

module.exports = router;
