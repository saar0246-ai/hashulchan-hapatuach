import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '0.875rem',
          fontFamily: 'Heebo, sans-serif',
          direction: 'rtl',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: 'hsl(var(--primary))', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: 'hsl(var(--destructive))', secondary: '#fff' },
        },
      }}
    />
  </React.StrictMode>,
)
