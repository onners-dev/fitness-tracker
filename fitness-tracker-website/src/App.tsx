import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.js'
import Header from './components/Header.js'
import Footer from './components/Footer.js'
import Home from './pages/Home.js'
import CalorieTracker from './pages/CalorieTracker.js'
import './App.css'
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
import EmailVerified from './pages/EmailVerified.js'
import AdminDashboard from './admin/pages/AdminDashboard.js';
import UserManagement from './admin/pages/UserManagement.js';
import ContentModeration from './admin/pages/ContentModeration.js';
import WorkoutModeration from './admin/pages/WorkoutModeration.js';
import NutritionModeration from './admin/pages/NutritionModeration.js';
import SystemAnalytics from './admin/pages/SystemAnalytics.js';
import WorkoutExerciseEdit from './admin/pages/WorkoutExerciseEdit.js'
import WorkoutExerciseLibrary from './admin/pages/WorkoutExerciseLibrary.js'
import WorkoutPlanBuilder from './pages/WorkoutPlanBuilder.js';
import WorkoutPlanGenerate from './pages/WorkoutPlanGenerate.js';
import WorkoutPlanOnboarding from './pages/WorkoutPlanOnboarding.js';
import WorkoutPlanDetails from './pages/WorkoutPlanDetails.js';
import FitnessProfileOnboarding from './pages/FitnessProfileOnboarding.js';
import WorkoutPlanEdit from './pages/WorkoutPlanEdit.js'
import SiteDock from './components/SiteDock.js';


function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="*" element={<NotFound />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calorietracker" 
              element={
                <ProtectedRoute>
                  <CalorieTracker />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workouts"
              element={
                <ProtectedRoute>
                  <Workouts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracking"
              element={
                <ProtectedRoute>
                  <TrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trends"
              element={
                <ProtectedRoute>
                  <TrendsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout-logging"
              element={
                <ProtectedRoute>
                  <WorkoutLogging />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />  
            <Route
              path="/workout-plans/onboarding"
              element={
                <ProtectedRoute>
                  <WorkoutPlanOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout-plans/generate"
              element={
                <ProtectedRoute>
                  <WorkoutPlanGenerate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout-plans/builder"
              element={
                <ProtectedRoute>
                  <WorkoutPlanBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout-plans/existing"
              element={
                <ProtectedRoute>
                  <WorkoutPlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout-plans/details"
              element={
                <ProtectedRoute>
                  <WorkoutPlanDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout-plans/edit"
              element={
                <ProtectedRoute>
                  <WorkoutPlanEdit />
                </ProtectedRoute>
              }
            /> 
            <Route
              path="/fitness-profile-onboarding"
              element={
                <ProtectedRoute>
                  <FitnessProfileOnboarding />
                </ProtectedRoute>
              }
            />  
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/content" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <ContentModeration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/workouts" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <WorkoutModeration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <SystemAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/nutrition" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <NutritionModeration />
                </ProtectedRoute>
              }
            />  
            <Route 
              path="/admin/workouts/exercises" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <WorkoutExerciseLibrary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/workouts/exercises/new" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <WorkoutExerciseEdit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/workouts/exercises/:exerciseId" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <WorkoutExerciseEdit />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <SiteDock />
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
