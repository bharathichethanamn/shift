# 🚀 ShiftMaster Quick Setup Guide

## Prerequisites
- Node.js installed
- MongoDB running locally (or MongoDB Atlas account)

## 1-Minute Setup

### Step 1: Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### Step 2: Start the Application
```bash
# Windows users - just double-click:
start.bat

# Or manually:
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

### Step 3: Access the App
- Open http://localhost:5173
- Register as Admin to create employees
- Register as Employee to view schedules

## Default Test Accounts
After setup, create these accounts for testing:

**Manager Account:**
- Name: Admin User
- Email: admin@shiftmaster.com
- Password: admin123
- Role: Manager (Admin)

**Employee Account:**
- Name: John Doe  
- Email: john@shiftmaster.com
- Password: employee123
- Role: Employee

## Quick Test Flow
1. Register as Admin → Create employees
2. Go to Schedule → Assign shifts to employees
3. Register as Employee → View your shifts
4. Test leave requests and shift swaps

## Troubleshooting
- **MongoDB Error**: Make sure MongoDB is running
- **Port 5000 busy**: Change PORT in server/.env
- **CORS Error**: Check VITE_API_URL in client/.env

## Need Help?
Check the full README.md for detailed documentation!

---
🎉 **You're all set! Welcome to ShiftMaster!**