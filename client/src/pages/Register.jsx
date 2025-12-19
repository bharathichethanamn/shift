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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Create Account</h2>
        <form onSubmit={handleSubmit}>
          
          <label className="block mb-2 font-bold text-sm">Full Name</label>
          <input className="w-full mb-3 p-2 border rounded" required 
            onChange={e => setName(e.target.value)} />

          <label className="block mb-2 font-bold text-sm">Email</label>
          <input className="w-full mb-3 p-2 border rounded" type="email" required 
            onChange={e => setEmail(e.target.value)} />

          <label className="block mb-2 font-bold text-sm">Password</label>
          <input className="w-full mb-3 p-2 border rounded" type="password" required 
            onChange={e => setPassword(e.target.value)} />

          {/* --- ROLE SELECTION --- */}
          <label className="block mb-2 font-bold text-sm">I am a:</label>
          <select 
            className="w-full mb-6 p-2 border rounded bg-white"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="employee">Employee</option>
            <option value="admin">Manager (Admin)</option>
          </select>

          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;