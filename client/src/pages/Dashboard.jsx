import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/ShiftContext';
import Navbar from '../components/Navbar';
import { FiUsers, FiCalendar, FiClock, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiBarChart2, FiActivity, FiBell } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeShifts: 0,
        pendingLeaves: 0,
        completedShifts: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);

    // Sample data for charts
    const weeklyShifts = [
        { day: 'Mon', shifts: 12, completed: 10 },
        { day: 'Tue', shifts: 15, completed: 14 },
        { day: 'Wed', shifts: 18, completed: 16 },
        { day: 'Thu', shifts: 14, completed: 13 },
        { day: 'Fri', shifts: 20, completed: 18 },
        { day: 'Sat', shifts: 8, completed: 7 },
        { day: 'Sun', shifts: 6, completed: 6 }
    ];

    const departmentData = [
        { name: 'Sales', value: 35, color: '#3b82f6' },
        { name: 'Support', value: 25, color: '#10b981' },
        { name: 'Marketing', value: 20, color: '#f59e0b' },
        { name: 'HR', value: 20, color: '#8b5cf6' }
    ];

    const monthlyTrend = [
        { month: 'Jan', employees: 45, shifts: 320 },
        { month: 'Feb', employees: 48, shifts: 340 },
        { month: 'Mar', employees: 52, shifts: 380 },
        { month: 'Apr', employees: 55, shifts: 420 },
        { month: 'May', employees: 58, shifts: 450 },
        { month: 'Jun', employees: 62, shifts: 480 }
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (user?.token) {
                    const config = {
                        headers: { Authorization: `Bearer ${user.token}` }
                    };
                    
                    // Fetch employees
                    const employeesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
                    
                    // Fetch shifts to get real counts
                    const shiftsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/shifts`, config);
                    const allShifts = shiftsRes.data;
                    
                    // Fetch leaves to get real counts
                    const leavesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/leaves`, config);
                    const pendingLeaves = leavesRes.data.filter(leave => leave.status === 'Pending').length;
                    const approvedLeaves = leavesRes.data.filter(leave => leave.status === 'Approved').length;
                    
                    const now = new Date();
                    const activeShifts = allShifts.filter(shift => new Date(shift.endTime) > now).length;
                    const completedShifts = allShifts.filter(shift => new Date(shift.endTime) < now).length;
                    
                    setStats({
                        totalEmployees: employeesRes.data.length,
                        activeShifts: activeShifts,
                        pendingLeaves: approvedLeaves, // Show approved leaves instead
                        completedShifts: completedShifts
                    });
                    
                    // Fetch notifications
                    const notifRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, config);
                    const notifications = notifRes.data;
                    
                    // Convert notifications to activities format
                    const activities = notifications.slice(0, 4).map((notif, index) => ({
                        id: notif._id || index,
                        action: notif.message,
                        user: 'System',
                        time: new Date(notif.createdAt).toLocaleString(),
                        type: 'info',
                        icon: FiActivity
                    }));
                    
                    setRecentActivities(activities);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const quickActions = [
        { title: 'Manage Employees', icon: FiUsers, link: '/employees', color: 'bg-blue-500', count: stats.totalEmployees },
        { title: 'View Schedule', icon: FiCalendar, link: '/schedule', color: 'bg-green-500', count: stats.activeShifts },
        { title: 'Leave Requests', icon: FiClock, link: '/leaves', color: 'bg-yellow-500', count: stats.pendingLeaves }
    ];



    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-gray-600">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="container mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-600">
                        Here's your team overview for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" key="dashboard-cards-v2">
                    <div className="rounded-xl shadow-md p-6 hover:shadow-lg transition-all" style={{background: '#6366f1', color: 'white'}}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{color: 'white'}}>Total Employees</p>
                                <p className="text-3xl font-bold" style={{color: 'white'}}>{stats.totalEmployees}</p>
                                <p className="text-xs mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>Active workforce</p>
                            </div>
                            <div className="p-3 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                                <FiUsers className="h-8 w-8" style={{color: 'white'}} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl shadow-md p-6 hover:shadow-lg transition-all" style={{background: '#10b981', color: 'white'}}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{color: 'white'}}>Active Shifts</p>
                                <p className="text-3xl font-bold" style={{color: 'white'}}>{stats.activeShifts}</p>
                                <p className="text-xs mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>Current shifts</p>
                            </div>
                            <div className="p-3 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                                <FiClock className="h-8 w-8" style={{color: 'white'}} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl shadow-md p-6 hover:shadow-lg transition-all" style={{background: '#f59e0b', color: 'white'}}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{color: 'white'}}>Approved Leaves</p>
                                <p className="text-3xl font-bold" style={{color: 'white'}}>{stats.pendingLeaves}</p>
                                <p className="text-xs mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>✓ Approved</p>
                            </div>
                            <div className="p-3 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                                <FiCheckCircle className="h-8 w-8" style={{color: 'white'}} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl shadow-md p-6 hover:shadow-lg transition-all" style={{background: '#f43f5e', color: 'white'}}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{color: 'white'}}>Completed Shifts</p>
                                <p className="text-3xl font-bold" style={{color: 'white'}}>{stats.completedShifts}</p>
                                <p className="text-xs mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>Total completed</p>
                            </div>
                            <div className="p-3 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                                <FiCheckCircle className="h-8 w-8" style={{color: 'white'}} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => (
                                    <Link
                                        key={index}
                                        to={action.link}
                                        className="flex items-center p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all hover:border-blue-300 bg-gray-50 hover:bg-white"
                                    >
                                        <div className={`p-3 rounded-xl ${action.color} text-white mr-4 shadow-md`}>
                                            <action.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{action.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {typeof action.count === 'number' ? `${action.count} items` : action.count}
                                            </p>
                                        </div>
                                        <div className="text-gray-400 text-xl">→</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notifications Card */}
                    <div>
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-4" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                                <div className="flex items-center space-x-3">
                                    <FiBell className="text-white" size={24} />
                                    <h3 className="font-bold text-white text-lg">Notifications</h3>
                                </div>
                            </div>
                            <div className="p-6" style={{backgroundColor: 'white'}}>
                                <div className="space-y-4">
                                    {recentActivities.slice(0, 3).map(activity => (
                                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{activity.action}</p>
                                        </div>
                                    ))}
                                    {recentActivities.length === 0 && (
                                        <div className="text-center py-8">
                                            <FiCheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                                            <p className="text-gray-500 font-medium">All caught up!</p>
                                            <p className="text-gray-400 text-sm">No new notifications</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;