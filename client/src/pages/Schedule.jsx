import { useState, useEffect, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import AuthContext from '../context/ShiftContext';
import Navbar from '../components/Navbar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
    Calendar as CalIcon, 
    Clock, 
    Users, 
    Bell, 
    Briefcase, 
    PlusCircle,
    CheckCircle,
    TrendingUp,
    Activity,
    AlertCircle,
    ChevronRight
} from 'lucide-react';

const localizer = momentLocalizer(moment);

// UI Helper Component
// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color} text-white`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const Schedule = () => {
    const { user } = useContext(AuthContext);
    
    // States
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());
    const [shifts, setShifts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [nextShift, setNextShift] = useState(null); // New Widget State

    // Form State
    const [formData, setFormData] = useState({
        userId: '', date: '', startTime: '', endTime: '', type: 'Morning'
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                
                // 1. Fetch Shifts
                const shiftsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/shifts`, config);
                let shiftData = shiftsRes.data;

                // Filter for Employees
                if (user.role !== 'admin') {
                    shiftData = shiftData.filter(s => 
                        s.userId && (String(s.userId._id) === String(user._id))
                    );
                    
                    // Logic: Find Next Shift
                    const upcoming = shiftData
                        .filter(s => new Date(s.startTime) > new Date())
                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                    setNextShift(upcoming[0] || null);
                }

                // Format for Calendar
                const formattedShifts = shiftData.map(shift => ({
                    title: `${shift.userId?.name || 'Unknown'} (${shift.type})`,
                    start: new Date(shift.startTime),
                    end: new Date(shift.endTime),
                    resource: shift
                }));
                setShifts(formattedShifts);

                // 2. Fetch Employees (Admin)
                if (user.role === 'admin') {
                    const empRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
                    console.log('Fetched employees:', empRes.data);
                    setEmployees(empRes.data);
                }

                // 3. Notifications
                const notifRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, config);
                setNotifications(notifRes.data);

            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        fetchData();
    }, [user, refreshKey]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const start = new Date(`${formData.date}T${formData.startTime}`);
            const end = new Date(`${formData.date}T${formData.endTime}`);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/shifts`, {
                userId: formData.userId,
                startTime: start,
                endTime: end,
                type: formData.type
            }, config);

            alert("Shift Assigned Successfully!");
            setRefreshKey(old => old + 1);
        } catch (error) {
            alert(error.response?.data?.message || "Error assigning shift");
        }
    };



    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="container mx-auto p-6">
                
                {/* --- HEADER SECTION --- */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {user.role === 'admin' ? 'Manager Dashboard' : 'My Schedule'}
                    </h1>
                    <p className="text-gray-500">Welcome back, {user.name}</p>
                </div>

                {/* --- ENHANCED STATS WIDGETS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {user.role === 'admin' ? (
                        <>
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Total Employees</p>
                                        <p className="text-3xl font-bold mt-1">{employees.length}</p>
                                        <p className="text-blue-100 text-xs mt-2 flex items-center">
                                            <TrendingUp size={12} className="mr-1" />
                                            Active workforce
                                        </p>
                                    </div>
                                    <Users size={32} className="text-blue-200" />
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm font-medium">Total Shifts</p>
                                        <p className="text-3xl font-bold mt-1">{shifts.length}</p>
                                        <p className="text-purple-100 text-xs mt-2 flex items-center">
                                            <Activity size={12} className="mr-1" />
                                            This month
                                        </p>
                                    </div>
                                    <Briefcase size={32} className="text-purple-200" />
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm font-medium">System Status</p>
                                        <p className="text-2xl font-bold mt-1">Online</p>
                                        <p className="text-green-100 text-xs mt-2 flex items-center">
                                            <CheckCircle size={12} className="mr-1" />
                                            All systems operational
                                        </p>
                                    </div>
                                    <CheckCircle size={32} className="text-green-200" />
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm font-medium">Pending Tasks</p>
                                        <p className="text-3xl font-bold mt-1">{notifications.length}</p>
                                        <p className="text-orange-100 text-xs mt-2 flex items-center">
                                            <AlertCircle size={12} className="mr-1" />
                                            Requires attention
                                        </p>
                                    </div>
                                    <Bell size={32} className="text-orange-200" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Enhanced Next Shift Widget */}
                            <div className="lg:col-span-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <Clock className="text-indigo-200" size={28} />
                                        <h3 className="font-bold text-xl text-indigo-100 uppercase tracking-wider">Upcoming Shift</h3>
                                    </div>
                                    <ChevronRight className="text-indigo-200" size={24} />
                                </div>
                                {nextShift ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h2 className="text-4xl font-bold mb-2">
                                                {new Date(nextShift.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </h2>
                                            <p className="text-indigo-100 text-xl font-medium">
                                                {moment(nextShift.startTime).format('h:mm A')} - {moment(nextShift.endTime).format('h:mm A')}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                                                {nextShift.type} Shift
                                            </span>
                                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                                                {moment(nextShift.startTime).fromNow()}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-2xl font-medium mb-2">No upcoming shifts scheduled</p>
                                        <p className="text-indigo-200">Enjoy your break! 🌴</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Enhanced Notification Widget */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4">
                                    <div className="flex items-center space-x-3">
                                        <Bell className="text-white" size={24} />
                                        <h3 className="font-bold text-white text-lg">Notifications</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {notifications.slice(0, 3).map(note => (
                                            <div key={note._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{note.message}</p>
                                            </div>
                                        ))}
                                        {notifications.length === 0 && (
                                            <div className="text-center py-8">
                                                <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                                                <p className="text-gray-500 font-medium">All caught up!</p>
                                                <p className="text-gray-400 text-sm">No new notifications</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* LEFT COLUMN: ENHANCED ADMIN FORM */}
                    {user.role === 'admin' && (
                        <div className="w-full lg:w-1/3">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-4">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                                    <div className="flex items-center space-x-3">
                                        <PlusCircle className="text-white" size={24} />
                                        <h2 className="text-xl font-bold text-white">Assign New Shift</h2>
                                    </div>
                                    <p className="text-blue-100 text-sm mt-2">Schedule shifts for your team members</p>
                                </div>
                                <div className="p-6">
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center">
                                            <Users size={16} className="mr-2 text-blue-500" />
                                            Employee
                                        </label>
                                        <select 
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                                            onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                            required
                                        >
                                            <option value="">Choose an employee...</option>
                                            {employees.length === 0 ? (
                                                <option disabled>No employees found. Create employees first.</option>
                                            ) : (
                                                employees.map(emp => (
                                                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                                                ))
                                            )}
                                        </select>
                                        {employees.length === 0 && (
                                            <p className="text-sm text-red-500 mt-1">No employees available. Please create employees first in the Employee List page.</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center">
                                            <CalIcon size={16} className="mr-2 text-blue-500" />
                                            Date
                                        </label>
                                        <input 
                                            type="date" 
                                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                                            onChange={(e) => setFormData({...formData, date: e.target.value})} 
                                            required 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center">
                                                <Clock size={16} className="mr-2 text-blue-500" />
                                                Start Time
                                            </label>
                                            <input 
                                                type="time" 
                                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                                                onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center">
                                                <Clock size={16} className="mr-2 text-blue-500" />
                                                End Time
                                            </label>
                                            <input 
                                                type="time" 
                                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                                                onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-3 flex items-center">
                                            <Briefcase size={16} className="mr-2 text-blue-500" />
                                            Shift Type
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { type: 'Morning', color: 'from-yellow-400 to-orange-400' },
                                                { type: 'Afternoon', color: 'from-orange-400 to-red-400' },
                                                { type: 'Night', color: 'from-purple-400 to-indigo-400' }
                                            ].map(({ type, color }) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, type})}
                                                    className={`py-3 px-2 text-sm font-medium rounded-lg border-2 transition-all ${
                                                        formData.type === type 
                                                        ? `bg-gradient-to-r ${color} text-white border-transparent shadow-lg transform scale-105` 
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 transform hover:scale-105"
                                    >
                                        <CheckCircle size={20} /> 
                                        Assign Shift
                                    </button>
                                </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RIGHT COLUMN: ENHANCED CALENDAR */}
                    <div className={`w-full ${user.role === 'admin' ? 'lg:w-2/3' : 'lg:w-full'}`}>
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <CalIcon className="text-blue-500" size={24} />
                                        <h2 className="text-xl font-bold text-gray-800">Schedule Calendar</h2>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span>Morning</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                            <span>Afternoon</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                            <span>Night</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                            
                                <Calendar
                                    localizer={localizer}
                                    events={shifts}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ height: 600 }}
                                    view={view}
                                    date={date}
                                    onNavigate={setDate}
                                    onView={setView}
                                    eventPropGetter={(event) => {
                                        const type = event.resource?.type || 'Morning';
                                        let bgColor = '#3b82f6';
                                        let borderColor = '#2563eb';
                                        
                                        if (type === 'Afternoon') {
                                            bgColor = '#f59e0b';
                                            borderColor = '#d97706';
                                        } else if (type === 'Night') {
                                            bgColor = '#7c3aed';
                                            borderColor = '#6d28d9';
                                        }
                                        
                                        return { 
                                            style: {
                                                backgroundColor: bgColor,
                                                borderRadius: '8px',
                                                border: `2px solid ${borderColor}`,
                                                color: 'white',
                                                padding: '4px 8px',
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            } 
                                        };
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Schedule;