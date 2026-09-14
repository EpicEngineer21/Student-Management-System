const Notice = require('../models/Notice');
const PriorityQueue = require('../dsa/PriorityQueue');

exports.list = async (req, res, next) => {
  try {
    const filter = { status: 'ACTIVE' };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;
    const notices = await Notice.find(filter).sort({ createdAt: -1 }).lean();

    // DSA: Use PriorityQueue to sort by priority (HIGH=1, MEDIUM=2, LOW=3)
    const pq = new PriorityQueue();
    const priorityMap = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    notices.forEach(n => pq.enqueue(n, priorityMap[n.priority] || 2));

    const sorted = [];
    while (pq.size() > 0) sorted.push(pq.dequeue());

    res.json({ success: true, data: sorted });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, category, priority, target_role, expiry_date } = req.body;
    if (!title || !description || !category) return res.status(400).json({ success: false, message: 'Title, description and category required' });
    const notice = await Notice.create({ title, description, category, priority: priority || 'MEDIUM', targetRole: target_role || 'ALL', createdBy: req.user.id, expiryDate: expiry_date || undefined });
    res.status(201).json({ success: true, message: 'Notice posted', data: notice });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updates = {};
    const map = { target_role: 'targetRole', expiry_date: 'expiryDate' };
    for (const [k, v] of Object.entries(map)) { if (req.body[k] !== undefined) updates[v] = req.body[k]; }
    for (const f of ['title', 'description', 'category', 'priority', 'status']) { if (req.body[f] !== undefined) updates[f] = req.body[f]; }
    const notice = await Notice.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated', data: notice });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Removed' });
  } catch (err) { next(err); }
};
