const express = require('express');
const router = express.Router();
const { createLeaveRequest, getLeaveRequests, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All logged in users can apply and view their own leaves
router.post('/', protect, createLeaveRequest);
router.get('/', protect, getLeaveRequests);

// Only Admin can update status (Approve/Reject)
router.put('/:id', protect, adminOnly, updateLeaveStatus);

module.exports = router;