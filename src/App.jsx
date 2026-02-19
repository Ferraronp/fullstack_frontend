import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OperationsPage from "./pages/OperationsPage";
import AddCategoryPage from "./pages/AddCategoryPage";
import SettingsPage from "./pages/SettingsPage";
import Dashboard from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import AddOperationPage from "./pages/AddOperationPage";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null; // or a loader
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user['role'] !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/operations"
            element={
              <ProtectedRoute>
                <OperationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-operation"
            element={
              <ProtectedRoute>
                <AddOperationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-category"
            element={
              <ProtectedRoute>
                <AddCategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
