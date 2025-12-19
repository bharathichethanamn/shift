import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/ShiftContext';
import Navbar from '../components/Navbar';
import { FiUsers, FiCalendar, FiClock, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiBarChart2, FiActivity } from 'react-icons/fi';
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
                    
                    setStats({
                        totalEmployees: employeesRes.data.length,
                        activeShifts: Math.floor(employeesRes.data.length * 0.7),
                        pendingLeaves: Math.floor(employeesRes.data.length * 0.15),
                        completedShifts: Math.floor(employeesRes.data.length * 8.5)
                    });
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
        { title: 'Leave Requests', icon: FiClock, link: '/leaves', color: 'bg-yellow-500', count: stats.pendingLeaves },
        { title: 'Shift Analytics', icon: FiBarChart2, link: '/analytics', color: 'bg-purple-500', count: '24h' }
    ];

    const recentActivities = [
        { id: 1, action: 'New employee registered', user: 'John Doe', time: '2 hours ago', type: 'success', icon: FiUsers },
        { id: 2, action: 'Leave request submitted', user: 'Jane Smith', time: '4 hours ago', type: 'warning', icon: FiClock },
        { id: 3, action: 'Shift swap approved', user: 'Mike Johnson', time: '1 day ago', type: 'success', icon: FiCheckCircle },
        { id: 4, action: 'Schedule updated', user: 'Admin', time: '2 days ago', type: 'info', icon: FiActivity }
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
                                <p className="text-xs text-green-600 mt-1">↗ +2 this week</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FiUsers className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Shifts</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.activeShifts}</p>
                                <p className="text-xs text-green-600 mt-1">↗ 85% capacity</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <FiClock className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.pendingLeaves}</p>
                                <p className="text-xs text-yellow-600 mt-1">⚠ Needs review</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <FiAlertCircle className="h-8 w-8 text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed Shifts</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.completedShifts}</p>
                                <p className="text-xs text-green-600 mt-1">↗ +12% vs last month</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <FiCheckCircle className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Weekly Shifts Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Weekly Shift Overview</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={weeklyShifts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="shifts" fill="#3b82f6" name="Scheduled" />
                                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Department Distribution */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Department Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={departmentData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                >
                                    {departmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => (
                                    <Link
                                        key={index}
                                        to={action.link}
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-blue-300"
                                    >
                                        <div className={`p-3 rounded-lg ${action.color} text-white mr-4`}>
                                            <action.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{action.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {typeof action.count === 'number' ? `${action.count} items` : action.count}
                                            </p>
                                        </div>
                                        <div className="text-gray-400">→</div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Monthly Trend */}
                        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Growth Trend</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="employees" stroke="#3b82f6" strokeWidth={3} name="Employees" />
                                    <Line type="monotone" dataKey="shifts" stroke="#10b981" strokeWidth={3} name="Shifts" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Activities</h2>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                                        <div className={`flex-shrink-0 p-2 rounded-full ${
                                            activity.type === 'success' ? 'bg-green-100 text-green-600' :
                                            activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            <activity.icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                            <p className="text-sm text-gray-600">{activity.user}</p>
                                            <p className="text-xs text-gray-400">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <Link to="/activities" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    View all activities →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;