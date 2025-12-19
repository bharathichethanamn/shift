const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express(); // <-- This must come BEFORE app.use()

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('ShiftMaster API is running...');
});

// --- Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/shifts', require('./routes/shiftRoutes')); // The new route
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/swaps', require('./routes/swapRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ShiftMaster Server running on port ${PORT}`));