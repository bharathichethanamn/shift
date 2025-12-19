import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/ShiftContext';
import Navbar from '../components/Navbar';
import { RefreshCw, CheckCircle, XCircle, Plus, ArrowRightLeft, Clock, User } from 'lucide-react';

const Swaps = () => {
    const { user } = useContext(AuthContext);
    
    const [requests, setRequests] = useState([]);
    const [myShifts, setMyShifts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        requestingShiftId: '',
        targetShiftId: '',
        reason: ''
    });

    const fetchData = useCallback(async () => {
        if (!user?.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            const swapsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/swaps`, config);
            setRequests(swapsRes.data);

            if (user.role === 'employee') {
                const shiftsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/shifts`, config);
                const myShiftsData = shiftsRes.data.filter(s => 
                    new Date(s.startTime) > new Date()
                );
                setMyShifts(myShiftsData);

                const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
                const allShiftsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/shifts/all`, config);
                
                const otherEmployees = usersRes.data.filter(emp => 
                    emp._id !== user._id &&
                    emp.role === 'employee'
                ).map(emp => {
                    const empShifts = allShiftsRes.data.filter(s => 
                        s.userId && String(s.userId._id) === String(emp._id) &&
                        new Date(s.startTime) > new Date()
                    );
                    return { ...emp, shifts: empShifts };
                });
                setEmployees(otherEmployees);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            await axios.post(`${import.meta.env.VITE_API_URL}/api/swaps`, {
                requestingShiftId: formData.requestingShiftId,
                targetShiftId: formData.targetShiftId,
                reason: formData.reason
            }, config);

            alert('Swap request submitted successfully!');
            setFormData({ requestingShiftId: '', targetShiftId: '', reason: '' });
            setSelectedEmployee('');
            setShowForm(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting swap request');
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeResponse = async (swapId, action) => {
        if(!window.confirm(`Are you sure you want to ${action} this request?`)) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/swaps/${swapId}/${action}`, {}, config);
            
            alert(`Swap request ${action}ed successfully!`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || `Error trying to ${action} swap`);
        }
    };

    const handleManagerResponse = async (swapId, action) => {
        const actionText = action === 'approve' ? 'approve' : 'reject';
        if(!window.confirm(`Are you sure you want to ${actionText} this request?`)) return;
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const endpoint = action === 'approve' ? 'approve' : 'manager-reject';
            await axios.put(`${import.meta.env.VITE_API_URL}/api/swaps/${swapId}/${endpoint}`, {}, config);
            
            alert(`Swap request ${actionText}d successfully!`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || `Error trying to ${actionText} swap`);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800 border border-green-200';
            case 'Rejected by Employee': 
            case 'Rejected by Manager': 
                return 'bg-red-100 text-red-800 border border-red-200';
            case 'Pending Manager': return 'bg-blue-100 text-blue-800 border border-blue-200';
            default: return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
        }
    };

    return (
        <>
            <Navbar />
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                <ArrowRightLeft className="text-purple-600" /> 
                                Shift Swaps
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {user.role === 'admin' ? 'Approve or reject employee swap requests.' : 'Trade shifts with your colleagues.'}
                            </p>
                        </div>
                        {user.role === 'employee' && (
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all"
                            >
                                <Plus size={20} />
                                {showForm ? 'Close Form' : 'New Request'}
                            </button>
                        )}
                    </div>

                    {showForm && user.role === 'employee' && (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 text-gray-700">Create New Request</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">My Shift (To Give)</label>
                                        <select
                                            value={formData.requestingShiftId}
                                            onChange={(e) => setFormData({...formData, requestingShiftId: e.target.value})}
                                            className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                            required
                                        >
                                            <option value="">-- Select Your Shift --</option>
                                            {myShifts.map(shift => (
                                                <option key={shift._id} value={shift._id}>
                                                    {new Date(shift.startTime).toLocaleDateString()} - {shift.type} ({new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee & Shift</label>
                                        <select
                                            value={selectedEmployee ? `${selectedEmployee}|${formData.targetShiftId}` : ''}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const [empId, shiftId] = e.target.value.split('|');
                                                    setSelectedEmployee(empId);
                                                    setFormData({...formData, targetShiftId: shiftId});
                                                } else {
                                                    setSelectedEmployee('');
                                                    setFormData({...formData, targetShiftId: ''});
                                                }
                                            }}
                                            className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                            required
                                        >
                                            <option value="">-- Select Employee & Shift --</option>
                                            {employees.flatMap(emp => 
                                                emp.shifts && emp.shifts.length > 0 ? 
                                                    emp.shifts.map(shift => (
                                                        <option key={shift._id} value={`${emp._id}|${shift._id}`}>
                                                            {emp.name} - {new Date(shift.startTime).toLocaleDateString()} ({shift.type})
                                                        </option>
                                                    ))
                                                : [
                                                    <option key={emp._id} disabled>
                                                        {emp.name} - No available shifts
                                                    </option>
                                                ]
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                                    <textarea
                                        value={formData.reason}
                                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                        className="w-full border border-gray-300 bg-gray-50 rounded-lg px-4 py-2 h-20 focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Why do you need this swap?"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                                <RefreshCw size={18} className="text-gray-400" />
                                Recent Requests
                            </h2>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Exchange</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                                No swap requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => {
                                            const isTargetEmployee = req.targetUserId?._id === user._id;
                                            const canEmployeeRespond = isTargetEmployee && req.status === 'Pending Employee';
                                            const canManagerRespond = user.role === 'admin' && req.status === 'Pending Manager';
                                            
                                            return (
                                                <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <User className="mr-2 text-gray-400" size={16} />
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900">{req.requestingUserId?.name}</div>
                                                                <div className="text-xs text-gray-500">{req.requestingUserId?.department}</div>
                                                            </div>
                                                        </div>
                                                        {req.reason && (
                                                            <div className="text-xs text-gray-500 italic mt-1">"{req.reason}"</div>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <User className="mr-2 text-purple-400" size={16} />
                                                            <div>
                                                                <div className="text-sm font-bold text-purple-700">{req.targetUserId?.name}</div>
                                                                <div className="text-xs text-gray-500">{req.targetUserId?.department}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center text-gray-600">
                                                                <Clock className="mr-1" size={14} />
                                                                <span className="font-medium">
                                                                    {req.requestingShiftId ? 
                                                                        `${new Date(req.requestingShiftId.startTime).toLocaleDateString()} (${req.requestingShiftId.type})` : 
                                                                        'Deleted'
                                                                    }
                                                                </span>
                                                            </div>
                                                            <ArrowRightLeft className="mx-auto text-gray-400" size={16} />
                                                            <div className="flex items-center text-gray-600">
                                                                <Clock className="mr-1" size={14} />
                                                                <span className="font-medium">
                                                                    {req.targetShiftId ? 
                                                                        `${new Date(req.targetShiftId.startTime).toLocaleDateString()} (${req.targetShiftId.type})` : 
                                                                        'Deleted'
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {canEmployeeRespond && (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleEmployeeResponse(req._id, 'accept')}
                                                                    className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md hover:bg-green-100 transition-colors text-xs font-medium"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEmployeeResponse(req._id, 'reject')}
                                                                    className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors text-xs font-medium"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                        {canManagerRespond && (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleManagerResponse(req._id, 'approve')}
                                                                    className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded-md hover:bg-green-100 transition-colors"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleManagerResponse(req._id, 'reject')}
                                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded-md hover:bg-red-100 transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {!canEmployeeRespond && !canManagerRespond && (
                                                            <span className="text-gray-400 text-xs">
                                                                {req.status === 'Approved' ? 'Completed' : 
                                                                 req.status.includes('Rejected') ? 'Closed' : 'Waiting'}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Swaps;