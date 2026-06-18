import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { MobileViewProvider } from './context/MobileViewContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <MobileViewProvider>
        <App />
      </MobileViewProvider>
    </AuthProvider>
  </StrictMode>,
)
