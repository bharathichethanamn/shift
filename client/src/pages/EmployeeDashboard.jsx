import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/ShiftContext';
import Navbar from '../components/Navbar';
import { FiCalendar, FiClock, FiUser, FiActivity, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import moment from 'moment';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalShifts: 0,
        upcomingShifts: 0,
        completedShifts: 0,
        pendingLeaves: 0
    });
    const [shifts, setShifts] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [nextShift, setNextShift] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sample data for employee performance
    const weeklyHours = [
        { day: 'Mon', hours: 8 },
        { day: 'Tue', hours: 6 },
        { day: 'Wed', hours: 8 },
        { day: 'Thu', hours: 7 },
        { day: 'Fri', hours: 8 },
        { day: 'Sat', hours: 4 },
        { day: 'Sun', hours: 0 }
    ];

    const shiftTypeData = [
        { name: 'Morning', value: 60, color: '#3b82f6' },
        { name: 'Afternoon', value: 25, color: '#f59e0b' },
        { name: 'Night', value: 15, color: '#8b5cf6' }
    ];

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                if (user?.token) {
                    const config = {
                        headers: { Authorization: `Bearer ${user.token}` }
                    };
                    
                    // Fetch employee shifts
                    const shiftsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/shifts`, config);
                    const myShifts = shiftsRes.data.filter(shift => 
                        shift.userId && shift.userId._id === user._id
                    );
                    setShifts(myShifts);
                    
                    // Fetch employee leaves
                    const leavesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/leaves`, config);
                    setLeaves(leavesRes.data);
                    
                    // Calculate stats
                    const now = new Date();
                    const upcoming = myShifts.filter(shift => new Date(shift.startTime) > now);
                    const completed = myShifts.filter(shift => new Date(shift.endTime) < now);
                    const pendingLeaves = leavesRes.data.filter(leave => leave.status === 'Pending');
                    
                    setStats({
                        totalShifts: myShifts.length,
                        upcomingShifts: upcoming.length,
                        completedShifts: completed.length,
                        pendingLeaves: pendingLeaves.length
                    });
                    
                    // Find next shift
                    const nextUpcoming = upcoming
                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
                    setNextShift(nextUpcoming || null);
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, [user]);

    const quickActions = [
        { title: 'My Schedule', icon: FiCalendar, link: '/schedule', color: 'bg-blue-500', count: stats.upcomingShifts },
        { title: 'Request Leave', icon: FiClock, link: '/leaves', color: 'bg-green-500', count: stats.pendingLeaves },
        { title: 'Shift Swaps', icon: FiActivity, link: '/swaps', color: 'bg-purple-500', count: 'Available' },
        { title: 'My Profile', icon: FiUser, link: '/profile', color: 'bg-orange-500', count: 'Edit' }
    ];

    const recentShifts = shifts
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .slice(0, 5);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-gray-600">Loading your dashboard...</div>
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
                        Here's your personal dashboard for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                    </p>
                </div>

                {/* Next Shift Card */}
                {nextShift && (
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <FiClock className="text-white" size={28} />
                                    <h3 className="font-bold text-xl">Your Next Shift</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-blue-100 text-sm">Date</p>
                                    <p className="text-xl font-bold">
                                        {moment(nextShift.startTime).format('MMM DD, YYYY')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm">Time</p>
                                    <p className="text-xl font-bold">
                                        {moment(nextShift.startTime).format('h:mm A')} - {moment(nextShift.endTime).format('h:mm A')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm">Type</p>
                                    <p className="text-xl font-bold">{nextShift.type} Shift</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-medium">
                                    {moment(nextShift.startTime).fromNow()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Shifts</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalShifts}</p>
                                <p className="text-xs text-blue-600 mt-1">All time</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FiCalendar className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Upcoming Shifts</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.upcomingShifts}</p>
                                <p className="text-xs text-green-600 mt-1">This month</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <FiClock className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed Shifts</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.completedShifts}</p>
                                <p className="text-xs text-purple-600 mt-1">Great job!</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <FiCheckCircle className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.pendingLeaves}</p>
                                <p className="text-xs text-orange-600 mt-1">Awaiting approval</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <FiAlertCircle className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Weekly Hours Chart */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Weekly Hours</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={weeklyHours}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="hours" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Shift Type Distribution */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Shift Types</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={shiftTypeData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                >
                                    {shiftTypeData.map((entry, index) => (
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
                    </div>

                    {/* Recent Shifts */}
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Shifts</h2>
                            <div className="space-y-4">
                                {recentShifts.length > 0 ? (
                                    recentShifts.map((shift) => (
                                        <div key={shift._id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                                            <div className={`flex-shrink-0 p-2 rounded-full ${
                                                shift.type === 'Morning' ? 'bg-blue-100 text-blue-600' :
                                                shift.type === 'Afternoon' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'
                                            }`}>
                                                <FiClock className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{shift.type} Shift</p>
                                                <p className="text-sm text-gray-600">
                                                    {moment(shift.startTime).format('MMM DD, YYYY')}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {moment(shift.startTime).format('h:mm A')} - {moment(shift.endTime).format('h:mm A')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <FiCalendar className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-gray-500 font-medium">No shifts yet</p>
                                        <p className="text-gray-400 text-sm">Your shifts will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;