import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import ArtistLogin from './pages/ArtistLogin';
import DashboardLayout from './layouts/DashboardLayout';
import PriceList from './pages/PriceList';
import CareInstructions from './pages/CareInstructions';
import AppointmentForm from './pages/AppointmentForm';
import CustomerAppointments from './pages/CustomerAppointments';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistCalendar from './pages/ArtistCalendar';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import ReceptionistCalendar from './pages/ReceptionistCalendar';
import AdminDashboard from './pages/AdminDashboard';
import AdminFinance from './pages/AdminFinance';
import ArtistEarnings from './pages/ArtistEarnings';
import AdminLogs from './pages/AdminLogs';

import AdminShifts from './pages/AdminShifts';
import AdminLeaves from './pages/AdminLeaves';
import ArtistSchedule from './pages/ArtistSchedule';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RoleBasedRedirect = () => {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch(user.role) {
    case 'CUSTOMER': return <Navigate to="/dashboard/customer" replace />;
    case 'ARTIST': return <Navigate to="/dashboard/artist" replace />;
    case 'RECEPTIONIST': return <Navigate to="/dashboard/receptionist" replace />;
    case 'ADMIN': return <Navigate to="/dashboard/admin" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login/artist" element={<ArtistLogin />} />
        
        <Route path="/" element={<LandingPage />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Customer Routes */}
          <Route path="customer" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><PriceList /></ProtectedRoute>} />
          <Route path="customer/care" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CareInstructions /></ProtectedRoute>} />
          <Route path="customer/appointment" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><AppointmentForm /></ProtectedRoute>} />
          <Route path="customer/appointments" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerAppointments /></ProtectedRoute>} />
          
          {/* Artist Routes */}
          <Route path="artist" element={<ProtectedRoute allowedRoles={['ARTIST']}><ArtistCalendar /></ProtectedRoute>} />
          <Route path="artist/my-earnings" element={<ProtectedRoute allowedRoles={['ARTIST']}><ArtistEarnings /></ProtectedRoute>} />
          <Route path="artist/my-schedule" element={<ProtectedRoute allowedRoles={['ARTIST']}><ArtistSchedule /></ProtectedRoute>} />
          <Route path="artist/calendar" element={<Navigate to="/dashboard/artist" replace />} />
          
          {/* Receptionist Routes */}
          <Route path="receptionist" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><ReceptionistDashboard /></ProtectedRoute>} />
          <Route path="receptionist/calendar" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><ReceptionistCalendar /></ProtectedRoute>} />
          <Route path="receptionist/shifts" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><AdminShifts /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/finance" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminFinance /></ProtectedRoute>} />
          <Route path="admin/logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLogs /></ProtectedRoute>} />
          <Route path="admin/shifts" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminShifts /></ProtectedRoute>} />
          <Route path="admin/leaves" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLeaves /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
