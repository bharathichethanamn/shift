# ShiftMaster – Employee Shift Scheduling System

A full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that automates employee scheduling, simplifies shift management, and streamlines communication between managers and employees.

## 🚀 Features

### 🔐 User Authentication & Roles
- Secure JWT-based authentication
- Two user roles: **Admin/Manager** & **Employee**
- Role-based access control for all operations

### 👥 Employee Management
- Add, edit, and delete employee profiles
- Store employee details (name, department, designation, contact info)
- Employee availability settings for smarter shift assignments

### 📅 Shift Management
- Create different shift types (Morning, Afternoon, Night, Custom)
- Intelligent conflict detection prevents:
  - Overlapping shifts
  - Double-shifts
  - Assignments during unavailable hours
  - Assignments during approved leave
- Interactive calendar with drag-and-drop functionality
- Color-coded shift visualization

### 🗓️ Weekly & Monthly Planner
- Interactive calendar UI with Day/Week/Month views
- Visual shift planning with color-coded blocks
- Clear overview of staffing levels

### 🏖️ Leave Management
- Employee leave request submission
- Manager approval/rejection workflow
- Automatic conflict detection with shift assignments
- Leave calendar integration

### 🔄 Shift Swap System
- Employee-initiated shift swap requests
- Two-step approval process (Employee → Manager)
- Automatic availability and role compatibility validation
- Real-time shift updates upon approval

### 🔔 Notifications System
- In-app notifications for:
  - New shift assignments
  - Shift updates or cancellations
  - Leave approval/rejection
  - Swap request status updates
- Real-time notification updates

### 📊 Analytics & Reporting
- Manager dashboard with comprehensive analytics
- Employee performance tracking
- Shift distribution charts
- Weekly/monthly trend analysis

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Context API** - State management
- **Axios** - HTTP client
- **React Big Calendar** - Calendar component
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **Moment.js** - Date handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## 📁 Project Structure

```
shift/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Context providers
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── server.js           # Server entry point
│   └── package.json
└── start.bat              # Startup script
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shift
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   **Server (.env)**
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shiftmaster
   JWT_SECRET=your_jwt_secret_key
   ```
   
   **Client (.env)**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas connection string

6. **Run the application**
   
   **Option 1: Use the startup script (Windows)**
   ```bash
   start.bat
   ```
   
   **Option 2: Manual startup**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📱 Usage Guide

### For Managers/Admins

1. **Register** as an Admin
2. **Create employees** in the Employee List page
3. **Assign shifts** using the Schedule page
4. **Manage leave requests** in the Leaves section
5. **Approve shift swaps** in the Swaps section
6. **Monitor analytics** on the Dashboard

### For Employees

1. **Register** as an Employee
2. **View your schedule** on the My Schedule page
3. **Request leave** in the My Leaves section
4. **Request shift swaps** with colleagues
5. **Check notifications** for updates
6. **View your dashboard** for personal analytics

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/create-employee` - Create employee (Admin)

### Users
- `GET /api/users` - Get employees
- `PUT /api/users/:id` - Update employee
- `DELETE /api/users/:id` - Delete employee

### Shifts
- `GET /api/shifts` - Get shifts
- `GET /api/shifts/all` - Get all shifts (for swaps)
- `POST /api/shifts` - Create shift

### Leaves
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id` - Update leave status

### Swaps
- `GET /api/swaps` - Get swap requests
- `POST /api/swaps` - Create swap request
- `PUT /api/swaps/:id/accept` - Accept swap (Employee)
- `PUT /api/swaps/:id/reject` - Reject swap (Employee)
- `PUT /api/swaps/:id/approve` - Approve swap (Manager)
- `PUT /api/swaps/:id/manager-reject` - Reject swap (Manager)

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `POST /api/notifications` - Create notification

## 🎨 Key Features Explained

### Intelligent Conflict Detection
The system automatically prevents scheduling conflicts by checking:
- Existing shift overlaps
- Employee availability windows
- Approved leave periods
- Department compatibility for swaps

### Two-Step Swap Approval
1. **Employee Response**: Target employee accepts/rejects
2. **Manager Approval**: Admin approves/rejects accepted swaps
3. **Automatic Execution**: Shifts are swapped in the database

### Real-Time Notifications
- Automatic notifications for all major actions
- Role-based notification filtering
- In-app notification center

### Responsive Design
- Mobile-friendly interface
- Adaptive layouts for all screen sizes
- Touch-friendly calendar interactions

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection
- Environment variable protection

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Set environment variables
2. Update MONGO_URI for production database
3. Deploy server code

### Frontend Deployment (Vercel/Netlify)
1. Update VITE_API_URL to production backend URL
2. Build and deploy client code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Future Enhancements

- [ ] Email/SMS notifications
- [ ] Data export (Excel/PDF)
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Integration with HR systems
- [ ] Automated shift generation
- [ ] Time tracking integration

---

**ShiftMaster** - Simplifying workforce management, one shift at a time! 🚀