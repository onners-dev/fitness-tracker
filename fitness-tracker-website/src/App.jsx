import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import CalorieTracker from './components/CalorieTracker'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/calorietracker" element={<CalorieTracker />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}


export default App
