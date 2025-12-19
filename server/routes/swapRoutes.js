const express = require('express');
const router = express.Router();
const { createSwapRequest, getSwapRequests, employeeResponse, managerResponse } = require('../controllers/swapController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createSwapRequest);
router.get('/', protect, getSwapRequests);

// Employee responses
router.put('/:id/accept', protect, (req, res) => {
    req.body.response = 'accept';
    employeeResponse(req, res);
});
router.put('/:id/reject', protect, (req, res) => {
    req.body.response = 'reject';
    employeeResponse(req, res);
});

// Manager responses
router.put('/:id/approve', protect, adminOnly, (req, res) => {
    req.body.response = 'approve';
    managerResponse(req, res);
});
router.put('/:id/manager-reject', protect, adminOnly, (req, res) => {
    req.body.response = 'reject';
    managerResponse(req, res);
});

module.exports = router;