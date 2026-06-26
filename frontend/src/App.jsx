import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDevices from "./pages/AdminDevices";
import AdminCustomers from "./pages/AdminCustomers";
import AdminRentals from "./pages/AdminRentals";
import AdminCalendar from "./pages/AdminCalendar";
import AdminDamages from "./pages/AdminDamages";
import AdminNotifications from "./pages/AdminNotifications";
import AdminLogs from "./pages/AdminLogs";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";

// Layout
import AdminLayout from "./components/AdminLayout";

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">Checking Credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Default admin redirect to dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="devices" element={<AdminDevices />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="rentals" element={<AdminRentals />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="damages" element={<AdminDamages />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback Legacy Routes Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;