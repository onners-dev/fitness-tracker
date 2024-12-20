import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ContentModeration from './pages/ContentModeration';
import WorkoutModeration from './pages/WorkoutModeration';
import NutritionModeration from './pages/NutritionModeration';
import SystemAnalytics from './pages/SystemAnalytics';
import AdminLayout from './components/AdminLayout';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="content" element={<ContentModeration />} />
        <Route path="workouts" element={<WorkoutModeration />} />
        <Route path="nutrition" element={<NutritionModeration />} />
        <Route path="analytics" element={<SystemAnalytics />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
