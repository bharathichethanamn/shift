const express = require('express');
const router = express.Router();
const { getShifts, getAllShifts, createShift } = require('../controllers/shiftController');
const Shift = require('../models/Shift');
const LeaveRequest = require('../models/LeaveRequest'); // Import Leave Model
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/shifts
// @desc    Assign a shift (with Conflict Detection)
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { userId, startTime, endTime, type } = req.body;
        
        const newStart = new Date(startTime);
        const newEnd = new Date(endTime);

        // ---------------------------------------------------
        // CHECK 1: Does Employee already have a shift?
        // ---------------------------------------------------
        const shiftConflict = await Shift.findOne({
            userId,
            $or: [
                { 
                    // Case: New shift starts inside an existing shift
                    startTime: { $lt: newEnd, $gte: newStart } 
                },
                { 
                    // Case: New shift ends inside an existing shift
                    endTime: { $gt: newStart, $lte: newEnd } 
                },
                { 
                    // Case: New shift engulfs an existing shift (starts before, ends after)
                    startTime: { $lte: newStart }, 
                    endTime: { $gte: newEnd } 
                }
            ]
        });

        if (shiftConflict) {
            return res.status(400).json({ 
                message: "⚠️ Conflict: Employee already has a shift at this time." 
            });
        }

        // ---------------------------------------------------
        // CHECK 2: Is Employee on Approved Leave?
        // ---------------------------------------------------
        const leaveConflict = await LeaveRequest.findOne({
            userId,
            status: 'Approved',
            // Check if Leave overlaps with the specific Shift time
            startDate: { $lte: newEnd },
            endDate: { $gte: newStart }
        });

        if (leaveConflict) {
            return res.status(400).json({ 
                message: "⚠️ Conflict: Employee is on Approved Leave." 
            });
        }

        // ---------------------------------------------------
        // NO CONFLICT -> SAVE SHIFT
        // ---------------------------------------------------
        const shift = await Shift.create({ 
            userId, 
            startTime, 
            endTime, 
            type, 
            createdBy: req.user.id 
        });

        // Create notification for employee
        const Notification = require('../models/Notification');
        await Notification.create({
            userId,
            message: `You have been assigned a new ${type} shift on ${new Date(startTime).toLocaleDateString()}`
        });

        res.status(201).json(shift);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/shifts
// @desc    Get shifts based on user role
router.get('/', protect, getShifts);

// @route   GET /api/shifts/all
// @desc    Get all shifts for swap functionality
router.get('/all', protect, getAllShifts);

module.exports = router;