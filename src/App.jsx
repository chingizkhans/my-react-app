import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/useAuth.jsx";
import AppLayout from "./assets/layout/app.layout.jsx";
import AdminPage from "./pages/Admin.jsx";
import DashboardPage from "./pages/dashboard.jsx";
import DocumentsPage from "./pages/Documents.jsx";
import EmployeesPage from "./pages/Employees.jsx";
import LoginPage from "./pages/Login.jsx";
import ProfilePage from "./pages/Profile.jsx";
import RequestsPage from "./pages/Requests.jsx";
import "./App.css";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="auth-state">Checking access...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
