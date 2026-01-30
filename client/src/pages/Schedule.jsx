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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                {user.role === 'admin' ? 'Shift Management Center' : 'My Schedule'}
                            </h1>
                            <p className="text-gray-600 text-lg">Manage your team's schedules efficiently • {user.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Today</p>
                            <p className="text-xl font-semibold text-gray-800">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* --- ENHANCED STATS WIDGETS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" key="schedule-cards-v2">
                    {user.role === 'admin' ? (
                        <>
                            <div className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow" style={{background: '#6366f1'}}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium" style={{color: 'rgba(255,255,255,0.9)'}}>Total Employees</p>
                                        <p className="text-3xl font-bold mt-1" style={{color: 'white'}}>{employees.length}</p>
                                        <p className="text-xs mt-2 flex items-center" style={{color: 'rgba(255,255,255,0.8)'}}>
                                            <TrendingUp size={12} className="mr-1" />
                                            Active workforce
                                        </p>
                                    </div>
                                    <Users size={32} style={{color: 'rgba(255,255,255,0.8)'}} />
                                </div>
                            </div>
                            
                            <div className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow" style={{background: '#8b5cf6'}}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium" style={{color: 'rgba(255,255,255,0.9)'}}>Total Shifts</p>
                                        <p className="text-3xl font-bold mt-1" style={{color: 'white'}}>{shifts.length}</p>
                                        <p className="text-xs mt-2 flex items-center" style={{color: 'rgba(255,255,255,0.8)'}}>
                                            <Activity size={12} className="mr-1" />
                                            This month
                                        </p>
                                    </div>
                                    <Briefcase size={32} style={{color: 'rgba(255,255,255,0.8)'}} />
                                </div>
                            </div>
                            
                            <div className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow" style={{background: '#10b981'}}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium" style={{color: 'rgba(255,255,255,0.9)'}}>System Status</p>
                                        <p className="text-2xl font-bold mt-1" style={{color: 'white'}}>Online</p>
                                        <p className="text-xs mt-2 flex items-center" style={{color: 'rgba(255,255,255,0.8)'}}>
                                            <CheckCircle size={12} className="mr-1" />
                                            All systems operational
                                        </p>
                                    </div>
                                    <CheckCircle size={32} style={{color: 'rgba(255,255,255,0.8)'}} />
                                </div>
                            </div>
                            
                            <div className="rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow" style={{background: '#f59e0b'}}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium" style={{color: 'rgba(255,255,255,0.9)'}}>Pending Tasks</p>
                                        <p className="text-3xl font-bold mt-1" style={{color: 'white'}}>{notifications.length}</p>
                                        <p className="text-xs mt-2 flex items-center" style={{color: 'rgba(255,255,255,0.8)'}}>
                                            <AlertCircle size={12} className="mr-1" />
                                            Requires attention
                                        </p>
                                    </div>
                                    <Bell size={32} style={{color: 'rgba(255,255,255,0.8)'}} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Enhanced Next Shift Widget */}
                            <div className="lg:col-span-3 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <Clock className="text-white" size={28} />
                                        <h3 className="font-bold text-xl text-white uppercase tracking-wider">Upcoming Shift</h3>
                                    </div>
                                    <ChevronRight className="text-white" size={24} />
                                </div>
                                {nextShift ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h2 className="text-4xl font-bold mb-2">
                                                {new Date(nextShift.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </h2>
                                            <p className="text-white text-xl font-medium">
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
                                        <p className="text-white">Enjoy your break! 🌴</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Enhanced Notification Widget */}
                            <div className="rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                                <div className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <Bell className="text-white" size={24} />
                                        <h3 className="font-bold text-white text-lg">Notifications</h3>
                                    </div>
                                </div>
                                <div className="p-6" style={{backgroundColor: 'white'}}>
                                    <div className="space-y-4">
                                        {notifications.slice(0, 3).map(note => (
                                            <div key={note._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
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
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-4">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                            <PlusCircle className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Create New Shift</h2>
                                            <p className="text-blue-100 text-sm mt-1">Assign shifts to your team members</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-gray-50">
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-3 flex items-center">
                                            <Users size={16} className="mr-2 text-blue-600" />
                                            Select Employee
                                        </label>
                                        <select 
                                            className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                                            onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                            required
                                        >
                                            <option value="">Choose an employee...</option>
                                            {employees.length === 0 ? (
                                                <option disabled>No employees found. Create employees first.</option>
                                            ) : (
                                                employees.map(emp => (
                                                    <option key={emp._id} value={emp._id}>{emp.name} - {emp.department || 'No Dept'}</option>
                                                ))
                                            )}
                                        </select>
                                        {employees.length === 0 && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-600 flex items-center">
                                                    <AlertCircle size={16} className="mr-2" />
                                                    No employees available. Please create employees first.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-3 flex items-center">
                                            <CalIcon size={16} className="mr-2 text-blue-600" />
                                            Shift Date
                                        </label>
                                        <input 
                                            type="date" 
                                            className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                                            onChange={(e) => setFormData({...formData, date: e.target.value})} 
                                            required 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 block mb-3 flex items-center">
                                                <Clock size={16} className="mr-2 text-blue-600" />
                                                Start Time
                                            </label>
                                            <input 
                                                type="time" 
                                                className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                                                onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 block mb-3 flex items-center">
                                                <Clock size={16} className="mr-2 text-blue-600" />
                                                End Time
                                            </label>
                                            <input 
                                                type="time" 
                                                className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                                                onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700 block mb-4 flex items-center">
                                            <Briefcase size={16} className="mr-2 text-blue-600" />
                                            Shift Type
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { type: 'Morning', color: '#f59e0b' },
                                                { type: 'Afternoon', color: '#f97316' },
                                                { type: 'Night', color: '#8b5cf6' }
                                            ].map(({ type, color }) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, type})}
                                                    className={`py-4 px-3 text-sm font-bold rounded-xl border-2 transition-all transform hover:scale-105 ${
                                                        formData.type === type 
                                                        ? 'text-white border-transparent shadow-lg scale-105' 
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                    }`}
                                                    style={formData.type === type ? {backgroundColor: color} : {}}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 transform hover:scale-105"
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
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <CalIcon className="text-blue-600" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800">Team Schedule Calendar</h2>
                                            <p className="text-gray-600 text-sm">Manage and view all team shifts</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#f59e0b'}}></div>
                                            <span className="font-medium">Morning</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#f97316'}}></div>
                                            <span className="font-medium">Afternoon</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#8b5cf6'}}></div>
                                            <span className="font-medium">Night</span>
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
                                        let bgColor = '#f59e0b';
                                        let borderColor = '#d97706';
                                        
                                        if (type === 'Afternoon') {
                                            bgColor = '#f97316';
                                            borderColor = '#ea580c';
                                        } else if (type === 'Night') {
                                            bgColor = '#8b5cf6';
                                            borderColor = '#7c3aed';
                                        }
                                        
                                        return { 
                                            style: {
                                                backgroundColor: bgColor,
                                                borderRadius: '8px',
                                                border: `2px solid ${borderColor}`,
                                                color: 'white',
                                                padding: '4px 8px',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
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