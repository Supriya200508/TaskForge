import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import MainLayout from './layout/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboards
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

// Management Pages
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route
              path="/admin/dashboard"
              element={
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              }
            />
            <Route
              path="/admin/tasks"
              element={<MainLayout><Tasks /></MainLayout>}
            />
            <Route
              path="/admin/users"
              element={<MainLayout><Users /></MainLayout>}
            />
          </Route>

          {/* Manager Routes */}
          <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
            <Route
              path="/manager/dashboard"
              element={
                <MainLayout>
                  <ManagerDashboard />
                </MainLayout>
              }
            />
            <Route
              path="/manager/tasks"
              element={
                <MainLayout>
                  <Tasks />
                </MainLayout>
              }
            />
          </Route>

          {/* Employee Routes */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
            <Route
              path="/employee/dashboard"
              element={
                <MainLayout>
                  <EmployeeDashboard />
                </MainLayout>
              }
            />
            <Route
              path="/employee/tasks"
              element={
                <MainLayout>
                  <Tasks />
                </MainLayout>
              }
            />
          </Route>

          {/* Default Redirect */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;