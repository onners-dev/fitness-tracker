import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';
import CalorieTracker from './pages/CalorieTracker.js';
import './App.css';
import Login from './pages/Login.js';
import Signup from './pages/Signup.js';
import ForgotPassword from './pages/ForgotPassword.js';
import About from './pages/About.js';
import Dashboard from './pages/Dashboard.js';
import ProfileSetup from './pages/ProfileSetup.js';
import Workouts from './pages/Workouts.js';
import Favorites from './pages/Favorites.js';
import TrackingPage from './pages/TrackingPage.js';
import TrendsPage from './pages/TrendsPage.js';
import WorkoutLogging from './pages/WorkoutLogging.js';
import Settings from './pages/Settings.js';
import WorkoutPlans from './pages/WorkoutPlans.js';
import NotFound from './pages/NotFound.js';
import EmailVerification from './pages/EmailVerification.js';
import EmailVerified from './pages/EmailVerified.js';
import AdminDashboard from './admin/pages/AdminDashboard.js';
import UserManagement from './admin/pages/UserManagement.js';
import ContentModeration from './admin/pages/ContentModeration.js';
import WorkoutModeration from './admin/pages/WorkoutModeration.js';
import NutritionModeration from './admin/pages/NutritionModeration.js';
import SystemAnalytics from './admin/pages/SystemAnalytics.js';
import WorkoutExerciseEdit from './admin/pages/WorkoutExerciseEdit.js';
import WorkoutExerciseLibrary from './admin/pages/WorkoutExerciseLibrary.js';
import WorkoutPlanBuilder from './pages/WorkoutPlanBuilder.js';
import WorkoutPlanGenerate from './pages/WorkoutPlanGenerate.js';
import WorkoutPlanOnboarding from './pages/WorkoutPlanOnboarding.js';
import WorkoutPlanDetails from './pages/WorkoutPlanDetails.js';
import FitnessProfileOnboarding from './pages/FitnessProfileOnboarding.js';
import WorkoutPlanEdit from './pages/WorkoutPlanEdit.js';
import SiteDock from './components/SiteDock.js';
import PageWrapper from './components/PageWrapper.js';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Navigate to="/home" replace /></PageWrapper>} />
        <Route path="/home" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/verify-email" element={<PageWrapper><EmailVerification /></PageWrapper>} />
        <Route path="/email-verified" element={<PageWrapper><EmailVerified /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />

        <Route 
          path="/dashboard" 
          element={
            <PageWrapper>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route 
          path="/calorietracker" 
          element={
            <PageWrapper>
              <ProtectedRoute>
                <CalorieTracker />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/profile-setup"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/workouts"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <Workouts />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/favorites"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/tracking"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <TrackingPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/trends"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <TrendsPage />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/workout-logging"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <WorkoutLogging />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/settings"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            </PageWrapper>
          }
        />  
        <Route
          path="/workout-plans/onboarding"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <WorkoutPlanOnboarding />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/workout-plans/generate"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <WorkoutPlanGenerate />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/workout-plans/builder"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <WorkoutPlanBuilder />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/workout-plans/existing"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <WorkoutPlans />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/workout-plans/details"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <WorkoutPlanDetails />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/workout-plans/edit"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <WorkoutPlanEdit />
              </ProtectedRoute>
            </PageWrapper>
          }
        /> 
        <Route
          path="/fitness-profile-onboarding"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <FitnessProfileOnboarding />
              </ProtectedRoute>
            </PageWrapper>
          }
        />  
        <Route 
          path="/admin" 
          element={
            <PageWrapper>
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route 
          path="/admin/users" 
          element={
            <PageWrapper>
              <ProtectedRoute adminOnly={true}>
                <UserManagement />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route 
          path="/admin/content" 
          element={
            <PageWrapper>
              <ProtectedRoute adminOnly={true}>
                <ContentModeration />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route 
          path="/admin/workouts" 
          element={
            <PageWrapper>
              <ProtectedRoute adminOnly={true}>
                <WorkoutModeration />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route 
          path="/admin/analytics" 
          element={
            <PageWrapper>
              <ProtectedRoute adminOnly={true}>
                <SystemAnalytics />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route 
          path="/admin/nutrition" 
          element={
            <PageWrapper>
              <ProtectedRoute adminOnly={true}>
                <NutritionModeration />
              </ProtectedRoute>
            </PageWrapper>
          }
        />  
        <Route 
          path="/admin/workouts/exercises" 
          element={
            <PageWrapper>
              <ProtectedRoute adminOnly={true}>
                <WorkoutExerciseLibrary />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route 
          path="/admin/workouts/exercises/new" 
          element={
            <PageWrapper>
              <ProtectedRoute adminOnly={true}>
                <WorkoutExerciseEdit />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route 
          path="/admin/workouts/exercises/:exerciseId" 
          element={
            <PageWrapper>
              <ProtectedRoute adminOnly={true}>
                <WorkoutExerciseEdit />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main>
          <AnimatedRoutes />
        </main>
        <SiteDock />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
