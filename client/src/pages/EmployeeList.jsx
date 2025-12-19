import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/ShiftContext';
import Navbar from '../components/Navbar';
import { UserPlus } from 'lucide-react';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        department: '', 
        designation: '', 
        workLocation: '' 
    });
    const [editingEmployee, setEditingEmployee] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
                setEmployees(data);
            } catch (error) {
                console.error("Error fetching employees", error);
            }
        };

        if (user) fetchEmployees();
    }, [user]);

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            if (editingEmployee) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${editingEmployee._id}`, formData, config);
                alert('Employee updated successfully!');
                setEditingEmployee(null);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/create-employee`, {
                    ...formData,
                    role: 'employee'
                }, config);
                alert('Employee created successfully!');
            }
            
            setFormData({ name: '', email: '', password: '', department: '', designation: '', workLocation: '' });
            setShowForm(false);
            
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
            setEmployees(data);
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving employee');
        }
    };

    const handleEditEmployee = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            email: employee.email,
            password: '',
            department: employee.department || '',
            designation: employee.designation || '',
            workLocation: employee.workLocation || ''
        });
        setShowForm(true);
    };

    const handleDeleteEmployee = async (employeeId) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${employeeId}`, config);
            alert('Employee deleted successfully!');
            
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
            setEmployees(data);
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting employee');
        }
    };

    return (
        <>
            <Navbar />
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Employee List</h2>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        Add Employee
                    </button>
                </div>
                
                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h3 className="text-xl font-semibold mb-4">
                            {editingEmployee ? 'Edit Employee' : 'Create New Employee'}
                        </h3>
                        <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Employee Name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Department"
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Designation"
                                value={formData.designation}
                                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Work Location"
                                value={formData.workLocation}
                                onChange={(e) => setFormData({...formData, workLocation: e.target.value})}
                                className="border border-gray-300 rounded-lg px-3 py-2"
                            />
                            <div className="col-span-full md:col-span-1 flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex-1"
                                >
                                    {editingEmployee ? 'Update Employee' : 'Create Employee'}
                                </button>
                                {editingEmployee && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingEmployee(null);
                                            setFormData({ name: '', email: '', password: '', department: '', designation: '', workLocation: '' });
                                            setShowForm(false);
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
                <div className="bg-white shadow-md rounded overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</th>
                                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? employees.map((emp) => (
                                <tr key={emp._id}>
                                    <td className="px-5 py-5 border-b bg-white text-sm font-medium">{emp.name}</td>
                                    <td className="px-5 py-5 border-b bg-white text-sm">{emp.email}</td>
                                    <td className="px-5 py-5 border-b bg-white text-sm">{emp.department || 'N/A'}</td>
                                    <td className="px-5 py-5 border-b bg-white text-sm">{emp.designation || 'N/A'}</td>
                                    <td className="px-5 py-5 border-b bg-white text-sm">{emp.workLocation || 'N/A'}</td>
                                    <td className="px-5 py-5 border-b bg-white text-sm">
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => handleEditEmployee(emp)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteEmployee(emp._id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-5 py-5 border-b bg-white text-sm text-center text-gray-500">
                                        No employees found. Click "Add Employee" to create your first employee.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default EmployeeList;