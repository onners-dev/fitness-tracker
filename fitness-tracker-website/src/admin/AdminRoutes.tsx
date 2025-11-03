import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard.js';
import UserManagement from './pages/UserManagement.js';
import ContentModeration from './pages/ContentModeration.js';
import WorkoutModeration from './pages/WorkoutModeration.js';
import WorkoutExerciseEdit from './pages/WorkoutExerciseEdit.js';
import WorkoutExerciseLibrary from './pages/WorkoutExerciseLibrary.js';
import NutritionModeration from './pages/NutritionModeration.js';
import SystemAnalytics from './pages/SystemAnalytics.js';
import AdminLayout from './components/AdminLayout.js';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="content" element={<ContentModeration />} />
        <Route path="workouts" element={<WorkoutModeration />} />
        <Route path="workouts/exercises" element={<WorkoutExerciseLibrary />} />
        <Route path="workouts/exercises/new" element={<WorkoutExerciseEdit />} />
        <Route path="workouts/exercises/:exerciseId" element={<WorkoutExerciseEdit />} />
        <Route path="nutrition" element={<NutritionModeration />} />
        <Route path="analytics" element={<SystemAnalytics />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
