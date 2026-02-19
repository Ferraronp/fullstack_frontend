import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OperationsPage from "./pages/OperationsPage";
import AddCategoryPage from "./pages/AddCategoryPage";
import SettingsPage from "./pages/SettingsPage";
import Dashboard from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import AddOperationPage from "./pages/AddOperationPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/operations" element={<OperationsPage />} />
        <Route path="/add-operation" element={<AddOperationPage />} />
        <Route path="/add-category" element={<AddCategoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/report" element={<ReportsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
