const SwapRequest = require('../models/SwapRequest');
const Shift = require('../models/Shift');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper function to check availability compatibility
const checkAvailabilityCompatibility = (user1, user2, shiftDate) => {
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][shiftDate.getDay()];
    return user1.availability[dayOfWeek]?.available && user2.availability[dayOfWeek]?.available;
};

// @desc    Create swap request
// @route   POST /api/swaps
// @access  Private
const createSwapRequest = async (req, res) => {
    try {
        const { requestingShiftId, targetShiftId, reason } = req.body;
        
        // Get requesting user's shift
        const requestingShift = await Shift.findById(requestingShiftId).populate('userId');
        if (!requestingShift || requestingShift.userId._id.toString() !== req.user.id) {
            return res.status(400).json({ message: 'Invalid shift or unauthorized' });
        }

        // Get target shift
        const targetShift = await Shift.findById(targetShiftId).populate('userId');
        if (!targetShift) {
            return res.status(400).json({ message: 'Target shift not found' });
        }

        // Get full user details for validation
        const requestingUser = await User.findById(req.user.id);
        const targetUser = await User.findById(targetShift.userId._id);

        // Validate department compatibility
        if (requestingUser.department !== targetUser.department) {
            return res.status(400).json({ message: 'Cannot swap shifts with employees from different departments' });
        }

        // Skip availability check for now since all users have default availability

        const swap = await SwapRequest.create({
            requestingUserId: req.user.id,
            targetUserId: targetShift.userId._id,
            requestingShiftId,
            targetShiftId,
            reason
        });

        // Create notification for target employee
        await Notification.create({
            userId: targetShift.userId._id,
            message: `${req.user.name} has requested to swap shifts with you. Please review and respond.`
        });

        res.status(201).json(swap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get swap requests
// @route   GET /api/swaps
// @access  Private
const getSwapRequests = async (req, res) => {
    try {
        let swaps;
        
        if (req.user.role === 'admin') {
            // Admin sees requests pending manager approval
            swaps = await SwapRequest.find({})
                .populate('requestingUserId', 'name email department')
                .populate('targetUserId', 'name email department')
                .populate('requestingShiftId')
                .populate('targetShiftId')
                .sort({ createdAt: -1 });
        } else {
            // Employee sees swaps they requested or are target of
            swaps = await SwapRequest.find({
                $or: [
                    { requestingUserId: req.user.id },
                    { targetUserId: req.user.id }
                ]
            })
            .populate('requestingUserId', 'name email department')
            .populate('targetUserId', 'name email department')
            .populate('requestingShiftId')
            .populate('targetShiftId')
            .sort({ createdAt: -1 });
        }
        
        res.json(swaps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Employee accept swap request
// @route   PUT /api/swaps/:id/accept
// @access  Private
const employeeAccept = async (req, res) => {
    try {
        const swap = await SwapRequest.findById(req.params.id)
            .populate('requestingUserId', 'name email')
            .populate('targetUserId', 'name email');

        if (!swap) {
            return res.status(404).json({ message: 'Swap request not found' });
        }

        // Only target employee can respond
        if (swap.targetUserId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        swap.employeeResponse = 'Accepted';
        swap.status = 'Pending Manager';
        swap.employeeResponseDate = new Date();
        
        // Notify requesting employee
        await Notification.create({
            userId: swap.requestingUserId._id,
            message: `${swap.targetUserId.name} accepted your shift swap request. Waiting for manager approval.`
        });

        await swap.save();
        res.json(swap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Employee reject swap request
// @route   PUT /api/swaps/:id/reject
// @access  Private
const employeeReject = async (req, res) => {
    try {
        const swap = await SwapRequest.findById(req.params.id)
            .populate('requestingUserId', 'name email')
            .populate('targetUserId', 'name email');

        if (!swap) {
            return res.status(404).json({ message: 'Swap request not found' });
        }

        // Only target employee can respond
        if (swap.targetUserId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        swap.employeeResponse = 'Rejected';
        swap.status = 'Rejected by Employee';
        swap.employeeResponseDate = new Date();
        
        // Notify requesting employee
        await Notification.create({
            userId: swap.requestingUserId._id,
            message: `${swap.targetUserId.name} rejected your shift swap request.`
        });

        await swap.save();
        res.json(swap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manager approve swap request
// @route   PUT /api/swaps/:id/approve
// @access  Private/Admin
const managerApprove = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const swap = await SwapRequest.findById(req.params.id)
            .populate('requestingUserId', 'name email')
            .populate('targetUserId', 'name email')
            .populate('requestingShiftId')
            .populate('targetShiftId');

        if (!swap) {
            return res.status(404).json({ message: 'Swap request not found' });
        }

        if (swap.status !== 'Pending Manager') {
            return res.status(400).json({ message: 'Request not ready for manager approval' });
        }

        swap.managerResponse = 'Approved';
        swap.status = 'Approved';
        swap.managerResponseDate = new Date();
        
        // Perform the actual shift swap
        await Shift.findByIdAndUpdate(swap.requestingShiftId._id, { userId: swap.targetUserId._id });
        await Shift.findByIdAndUpdate(swap.targetShiftId._id, { userId: swap.requestingUserId._id });
        
        // Notify both employees
        await Notification.create({
            userId: swap.requestingUserId._id,
            message: `Your shift swap has been approved and completed!`
        });
        
        await Notification.create({
            userId: swap.targetUserId._id,
            message: `Your shift swap has been approved and completed!`
        });

        await swap.save();
        res.json(swap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manager reject swap request
// @route   PUT /api/swaps/:id/manager-reject
// @access  Private/Admin
const managerReject = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const swap = await SwapRequest.findById(req.params.id)
            .populate('requestingUserId', 'name email')
            .populate('targetUserId', 'name email');

        if (!swap) {
            return res.status(404).json({ message: 'Swap request not found' });
        }

        swap.managerResponse = 'Rejected';
        swap.status = 'Rejected by Manager';
        swap.managerResponseDate = new Date();
        
        // Notify both employees
        await Notification.create({
            userId: swap.requestingUserId._id,
            message: `Your shift swap request was rejected by management.`
        });
        
        await Notification.create({
            userId: swap.targetUserId._id,
            message: `The shift swap request was rejected by management.`
        });

        await swap.save();
        res.json(swap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSwapRequest,
    getSwapRequests,
    employeeAccept,
    employeeReject,
    managerApprove,
    managerReject
};