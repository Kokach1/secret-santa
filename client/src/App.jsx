import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage'; // Keeping for legacy/verify links if any
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import CompleteProfilePage from './pages/CompleteProfilePage';

const PrivateRoute = ({ role }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) return <Navigate to="/login" replace />;

  const user = JSON.parse(userStr);
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <Outlet />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-christmas-white font-sans text-gray-900 relative">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Student Routes */}
          <Route element={<PrivateRoute role="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<PrivateRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
