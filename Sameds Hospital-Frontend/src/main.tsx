import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { App } from './App.tsx'
import { HMSProvider } from './store/HMSContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HMSProvider>
      <App />
    </HMSProvider>
  </StrictMode>,
)
