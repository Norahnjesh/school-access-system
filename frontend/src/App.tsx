// src/App.tsx (Updated with ProtectedRoute)


import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';

// Student Pages
import StudentListPage from './components/Students/StudentListPage';
import StudentDetailPage from './components/Students/StudentDetailPage';
import StudentCreatePage from './components/Students/StudentCreatePage';

// Bus Pages
import BusListPage from './pages/Buses/BusListPage';
import BusDetailPage from './pages/Buses/BusDetailPage';

// Scanner Pages
import TransportScannerPage from './pages/Scanner/TransportScannerPage';
import LunchScannerPage from './pages/Scanner/LunchScannerPage';

// Import Page
import ImportPage from './pages/Import/ImportPage';

// Report Pages
import TransportReportPage from './pages/Reports/TransportReportPage';
import LunchReportPage from './pages/Reports/LunchReportPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Student Routes - Admin only */}
      <Route 
        path="/students" 
        element={
          <ProtectedRoute>
            <StudentListPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/students/create" 
        element={
          <ProtectedRoute requiredRole="admin">
            <StudentCreatePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/students/:id" 
        element={
          <ProtectedRoute>
            <StudentDetailPage />
          </ProtectedRoute>
        } 
      />

      {/* Bus Routes */}
      <Route 
        path="/buses" 
        element={
          <ProtectedRoute>
            <BusListPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/buses/:id" 
        element={
          <ProtectedRoute>
            <BusDetailPage />
          </ProtectedRoute>
        } 
      />

      {/* Scanner Routes - Role-based */}
      <Route 
        path="/scanner/transport" 
        element={
          <ProtectedRoute>
            <TransportScannerPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/scanner/lunch" 
        element={
          <ProtectedRoute>
            <LunchScannerPage />
          </ProtectedRoute>
        } 
      />

      {/* Import Route - Admin only */}
      <Route 
        path="/import" 
        element={
          <ProtectedRoute requiredRole="admin">
            <ImportPage />
          </ProtectedRoute>
        } 
      />

      {/* Report Routes */}
      <Route 
        path="/reports/transport" 
        element={
          <ProtectedRoute>
            <TransportReportPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports/lunch" 
        element={
          <ProtectedRoute>
            <LunchReportPage />
          </ProtectedRoute>
        } 
      />

      {/* 404 Not Found */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    
  );
}

export default App;
