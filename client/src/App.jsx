import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/ShiftContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeList from "./pages/EmployeeList";
import Schedule from "./pages/Schedule";
import Leaves from "./pages/Leaves";
import Swaps from "./pages/Swaps";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<EmployeeList />} />
        <Route path="/employees" element={<EmployeeList />} /> 
        <Route path="/schedule" element={<Schedule />} />
        
        {/* <-- New Route --> */}
        <Route path="/leaves" element={<Leaves />} /> 
        <Route path="/swaps" element={<Swaps />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;