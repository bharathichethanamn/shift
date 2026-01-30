import { useState, useContext } from "react";
import AuthContext from "../context/ShiftContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee"); // Default to employee
  
  const { register } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send role to the context function
    register(name, email, password, role);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ShiftMaster</h1>
          <p className="text-gray-600">Create your account to get started.</p>
        </div>
        <form onSubmit={handleSubmit}>
          
          <label className="block mb-2 font-bold text-sm">Full Name</label>
          <input className="w-full mb-3 p-3 border rounded text-base" required 
            onChange={e => setName(e.target.value)} />

          <label className="block mb-2 font-bold text-sm">Email</label>
          <input className="w-full mb-3 p-3 border rounded text-base" type="email" required 
            onChange={e => setEmail(e.target.value)} />

          <label className="block mb-2 font-bold text-sm">Password</label>
          <input className="w-full mb-3 p-3 border rounded text-base" type="password" required 
            onChange={e => setPassword(e.target.value)} />

          {/* --- ROLE SELECTION --- */}
          <label className="block mb-2 font-bold text-sm">I am a:</label>
          <select 
            className="w-full mb-6 p-3 border rounded bg-white text-base"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="employee">Employee</option>
            <option value="admin">Manager (Admin)</option>
          </select>

          <button type="submit" className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none transition-colors">
            Create Account
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;