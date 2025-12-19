const express = require('express');
const router = express.Router();
const { getEmployees, updateEmployee, deleteEmployee } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Allow all authenticated users to see employees (filtered by role in controller)
router.get('/', protect, getEmployees);
router.put('/:id', protect, adminOnly, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;