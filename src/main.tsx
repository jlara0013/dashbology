import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ModalProvider } from './context/ModalContext.tsx'
import { TimeTrackerProvider } from './context/TimeTrackerContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ModalProvider>
        <TimeTrackerProvider>
          <App />
        </TimeTrackerProvider>
      </ModalProvider>
    </AuthProvider>
  </StrictMode>,
)
