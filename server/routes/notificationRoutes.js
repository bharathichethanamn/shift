const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, createNotification } = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/notifications
// @desc    Get notifications
router.get('/', protect, getNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
router.put('/:id/read', protect, markAsRead);

// @route   POST /api/notifications
// @desc    Create notification (Admin only)
router.post('/', protect, adminOnly, createNotification);

module.exports = router;