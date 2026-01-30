import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/ShiftContext';
import Navbar from '../components/Navbar';
import { User, Save, Edit } from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        department: '',
        designation: '',
        workLocation: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                department: user.department || '',
                designation: user.designation || '',
                workLocation: user.workLocation || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, profileData, config);
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <User className="text-blue-500" />
                            My Profile
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage your personal information and work details
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Edit size={16} />
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 ${
                                            isEditing ? 'bg-white' : 'bg-gray-100'
                                        } focus:ring-2 focus:ring-blue-500 outline-none`}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-500"
                                        disabled
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.department}
                                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 ${
                                            isEditing ? 'bg-white' : 'bg-gray-100'
                                        } focus:ring-2 focus:ring-blue-500 outline-none`}
                                        disabled={!isEditing}
                                        placeholder="e.g., Sales, Marketing, IT"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Designation
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.designation}
                                        onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 ${
                                            isEditing ? 'bg-white' : 'bg-gray-100'
                                        } focus:ring-2 focus:ring-blue-500 outline-none`}
                                        disabled={!isEditing}
                                        placeholder="e.g., Manager, Developer, Analyst"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Work Location
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.workLocation}
                                        onChange={(e) => setProfileData({...profileData, workLocation: e.target.value})}
                                        className={`w-full border border-gray-300 rounded-lg px-4 py-3 ${
                                            isEditing ? 'bg-white' : 'bg-gray-100'
                                        } focus:ring-2 focus:ring-blue-500 outline-none`}
                                        disabled={!isEditing}
                                        placeholder="e.g., New York Office, Remote, Building A"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            // Reset form data
                                            setProfileData({
                                                name: user.name || '',
                                                email: user.email || '',
                                                department: user.department || '',
                                                designation: user.designation || '',
                                                workLocation: user.workLocation || ''
                                            });
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>

                        {!isEditing && (
                            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <strong>Note:</strong> Click "Edit Profile" to update your information. 
                                    Your email address cannot be changed for security reasons.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;