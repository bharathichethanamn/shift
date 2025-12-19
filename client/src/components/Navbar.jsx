import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/ShiftContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
            <h1 className="text-2xl font-bold">ShiftMaster</h1>
            <div className="flex items-center gap-6">
                {user && (
                    <>
                        {user.role === 'admin' ? (
                            <>
                                <Link to="/dashboard" className="hover:text-gray-200 font-medium">Dashboard</Link>
                                <Link to="/employees" className="hover:text-gray-200 font-medium">Employees</Link>
                                <Link to="/schedule" className="hover:text-gray-200 font-medium">Schedule</Link>
                                <Link to="/leaves" className="hover:text-gray-200 font-medium">Leaves</Link>
                                <Link to="/swaps" className="hover:text-gray-200 font-medium">Swaps</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/schedule" className="hover:text-gray-200 font-medium">My Schedule</Link>
                                <Link to="/leaves" className="hover:text-gray-200 font-medium">My Leaves</Link>
                                <Link to="/swaps" className="hover:text-gray-200 font-medium">Shift Swaps</Link>
                            </>
                        )}
                        <span className="text-sm opacity-80">| {user.name}</span>
                        <button onClick={logout} className="bg-red-500 px-4 py-1 rounded hover:bg-red-600 text-sm">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;