import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/ShiftContext';
import Navbar from '../components/Navbar';
import { FiUsers, FiCalendar, FiClock, FiTrendingUp, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalEmployees: 12,
        activeShifts: 8,
        pendingLeaves: 3,
        completedShifts: 45
    });

    const quickActions = [
        { title: 'Manage Employees', icon: FiUsers, link: '/employees', color: 'bg-blue-500' },
        { title: 'View Schedule', icon: FiCalendar, link: '/schedule', color: 'bg-green-500' },
        { title: 'Leave Requests', icon: FiClock, link: '/leaves', color: 'bg-yellow-500' },
        { title: 'Shift Swaps', icon: FiTrendingUp, link: '/swaps', color: 'bg-purple-500' }
    ];

    const recentActivities = [
        { id: 1, action: 'New employee registered', user: 'John Doe', time: '2 hours ago', type: 'success' },
        { id: 2, action: 'Leave request submitted', user: 'Jane Smith', time: '4 hours ago', type: 'warning' },
        { id: 3, action: 'Shift swap approved', user: 'Mike Johnson', time: '1 day ago', type: 'success' },
        { id: 4, action: 'Schedule updated', user: 'Admin', time: '2 days ago', type: 'info' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="container mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome back, {user?.name}!
                    </h1>
                    <p className="text-gray-600">
                        Here's what's happening with your team today.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                            </div>
                            <FiUsers className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Shifts</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeShifts}</p>
                            </div>
                            <FiClock className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pendingLeaves}</p>
                            </div>
                            <FiAlertCircle className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed Shifts</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completedShifts}</p>
                            </div>
                            <FiCheckCircle className="h-8 w-8 text-purple-500" />
                        </div>
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
                                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className={`p-3 rounded-lg ${action.color} text-white mr-4`}>
                                            <action.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{action.title}</h3>
                                            <p className="text-sm text-gray-500">Manage and view</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Activities</h2>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3">
                                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                            activity.type === 'success' ? 'bg-green-400' :
                                            activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                                        }`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                            <p className="text-sm text-gray-500">{activity.user}</p>
                                            <p className="text-xs text-gray-400">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;