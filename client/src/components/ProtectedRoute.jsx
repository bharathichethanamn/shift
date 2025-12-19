import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/ShiftContext';
import Dashboard from '../pages/Dashboard';
import EmployeeDashboard from '../pages/EmployeeDashboard';

const ProtectedRoute = () => {
    const { user } = useContext(AuthContext);
    
    if (!user) {
        return <Navigate to="/" replace />;
    }
    
    // Route to appropriate dashboard based on role
    if (user.role === 'admin') {
        return <Dashboard />;
    } else {
        return <EmployeeDashboard />;
    }
};

export default ProtectedRoute;