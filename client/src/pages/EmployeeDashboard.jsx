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
                        <div className="rounded-xl p-6 text-white shadow-lg" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <FiClock className="text-white" size={28} />
                                    <h3 className="font-bold text-xl">Your Next Shift</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium" style={{color: 'rgba(255,255,255,0.9)'}}>Date</p>
                                    <p className="text-xl font-bold text-white">
                                        {moment(nextShift.startTime).format('MMM DD, YYYY')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{color: 'rgba(255,255,255,0.9)'}}>Time</p>
                                    <p className="text-xl font-bold text-white">
                                        {moment(nextShift.startTime).format('h:mm A')} - {moment(nextShift.endTime).format('h:mm A')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{color: 'rgba(255,255,255,0.9)'}}>Type</p>
                                    <p className="text-xl font-bold text-white">{nextShift.type} Shift</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="px-4 py-2 rounded-full text-sm font-medium" style={{backgroundColor: 'rgba(255,255,255,0.2)', color: 'white'}}>
                                    {moment(nextShift.startTime).fromNow()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="rounded-xl shadow-md p-6 hover:shadow-lg transition-all" style={{background: '#6366f1', color: 'white'}}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{color: 'white'}}>Total Shifts</p>
                                <p className="text-3xl font-bold" style={{color: 'white'}}>{stats.totalShifts}</p>
                                <p className="text-xs mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>All time</p>
                            </div>
                            <div className="p-3 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                                <FiCalendar className="h-8 w-8" style={{color: 'white'}} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl shadow-md p-6 hover:shadow-lg transition-all" style={{background: '#10b981', color: 'white'}}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{color: 'white'}}>Upcoming Shifts</p>
                                <p className="text-3xl font-bold" style={{color: 'white'}}>{stats.upcomingShifts}</p>
                                <p className="text-xs mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>This month</p>
                            </div>
                            <div className="p-3 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                                <FiClock className="h-8 w-8" style={{color: 'white'}} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl shadow-md p-6 hover:shadow-lg transition-all" style={{background: '#8b5cf6', color: 'white'}}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{color: 'white'}}>Completed Shifts</p>
                                <p className="text-3xl font-bold" style={{color: 'white'}}>{stats.completedShifts}</p>
                                <p className="text-xs mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>Great job!</p>
                            </div>
                            <div className="p-3 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                                <FiCheckCircle className="h-8 w-8" style={{color: 'white'}} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl shadow-md p-6 hover:shadow-lg transition-all" style={{background: '#f59e0b', color: 'white'}}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium" style={{color: 'white'}}>Pending Leaves</p>
                                <p className="text-3xl font-bold" style={{color: 'white'}}>{stats.pendingLeaves}</p>
                                <p className="text-xs mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>Awaiting approval</p>
                            </div>
                            <div className="p-3 rounded-full" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                                <FiAlertCircle className="h-8 w-8" style={{color: 'white'}} />
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

                    {/* Recent Shifts */}
                    <div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Shifts</h2>
                            <div className="space-y-4">
                                {recentShifts.length > 0 ? (
                                    recentShifts.map((shift) => (
                                        <div key={shift._id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
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