const express = require('express');
const router = express.Router();
const { createSwapRequest, getSwapRequests, employeeAccept, employeeReject, managerApprove, managerReject } = require('../controllers/swapController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createSwapRequest);
router.get('/', protect, getSwapRequests);

// Employee responses
router.put('/:id/accept', protect, employeeAccept);
router.put('/:id/reject', protect, employeeReject);

// Manager responses
router.put('/:id/approve', protect, adminOnly, managerApprove);
router.put('/:id/manager-reject', protect, adminOnly, managerReject);

module.exports = router;