import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/Dock.css'
import App from './App.js'
import { AuthProvider } from './contexts/AuthContext.js'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error("Root container missing in index.html")
}

createRoot(rootEl).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
)
