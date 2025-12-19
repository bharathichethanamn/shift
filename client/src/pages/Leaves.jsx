import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/ShiftContext';
import Navbar from '../components/Navbar';
import { Calendar, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';

const Leaves = () => {
    const { user } = useContext(AuthContext);
    const [leaves, setLeaves] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
        type: 'Sick Leave'
    });

    useEffect(() => {
        fetchLeaves();
    }, [user]);

    const fetchLeaves = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/leaves`, config);
            setLeaves(data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/leaves`, formData, config);
            alert('Leave request submitted successfully!');
            setFormData({ startDate: '', endDate: '', reason: '', type: 'Sick Leave' });
            setShowForm(false);
            fetchLeaves();
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting leave request');
        }
    };

    const handleApproval = async (leaveId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/api/leaves/${leaveId}`, { status }, config);
            alert(`Leave ${status.toLowerCase()} successfully!`);
            fetchLeaves();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating leave status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <>
            <Navbar />
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Leave Management</h1>
                            <p className="text-gray-600 mt-2">
                                {user.role === 'admin' ? 'Manage employee leave requests' : 'View and request leaves'}
                            </p>
                        </div>
                        {user.role === 'employee' && (
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg"
                            >
                                <Plus size={20} />
                                Request Leave
                            </button>
                        )}
                    </div>

                    {/* Leave Request Form */}
                    {showForm && user.role === 'employee' && (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4">Submit Leave Request</h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Vacation">Vacation</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Emergency">Emergency</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                                    <textarea
                                        value={formData.reason}
                                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24"
                                        placeholder="Please provide reason for leave..."
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 flex gap-4">
                                    <button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                                    >
                                        Submit Request
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Leave Requests Table */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Calendar className="text-blue-500" />
                                Leave Requests
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {user.role === 'admin' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Employee
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Start Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            End Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reason
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        {user.role === 'admin' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leaves.length === 0 ? (
                                        <tr>
                                            <td colSpan={user.role === 'admin' ? '7' : '5'} className="px-6 py-8 text-center text-gray-500">
                                                No leave requests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        leaves.map((leave) => (
                                            <tr key={leave._id}>
                                                {user.role === 'admin' && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {leave.userId?.name || 'Unknown'}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {leave.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(leave.startDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(leave.endDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                    {leave.reason}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                                                        {leave.status}
                                                    </span>
                                                </td>
                                                {user.role === 'admin' && leave.status === 'Pending' && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleApproval(leave._id, 'Approved')}
                                                                className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                                            >
                                                                <CheckCircle size={16} />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleApproval(leave._id, 'Rejected')}
                                                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                                            >
                                                                <XCircle size={16} />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
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

export default Leaves;