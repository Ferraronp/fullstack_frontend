import { lazy, Suspense, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, AuthContext } from "./context/AuthContext";

// Lazy imports — компоненты загружаются только при переходе на страницу
const LoginPage       = lazy(() => import("./pages/LoginPage"));
const RegisterPage    = lazy(() => import("./pages/RegisterPage"));
const Dashboard       = lazy(() => import("./pages/DashboardPage"));
const OperationsPage  = lazy(() => import("./pages/OperationsPage"));
const AddOperationPage= lazy(() => import("./pages/AddOperationPage"));
const AddCategoryPage = lazy(() => import("./pages/AddCategoryPage"));
const SettingsPage    = lazy(() => import("./pages/SettingsPage"));
const ReportsPage     = lazy(() => import("./pages/ReportsPage"));
const AnalysisPage    = lazy(() => import("./pages/AnalysisPage"));

function PageLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      Загрузка...
    </div>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user["role"] !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/operations" element={<ProtectedRoute><OperationsPage /></ProtectedRoute>} />
              <Route path="/add-operation" element={<ProtectedRoute><AddOperationPage /></ProtectedRoute>} />
              <Route path="/add-category" element={<ProtectedRoute><AddCategoryPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute requiredRole="admin"><SettingsPage /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/analysis" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}
