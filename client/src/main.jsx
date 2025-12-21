import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import Snowfall from 'react-snowfall'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Snowfall color='white'/>
      <App />
    </AuthProvider>
  </StrictMode>,
)