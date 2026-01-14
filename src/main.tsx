import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { SidebarProvider } from './contexts/SidebarContext'
import { validateConfig } from './config/environment'
import { validateEnvironment } from '@shared/types/env.d'

// Validate environment variables before starting the app
try {
  validateEnvironment();
  validateConfig();
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  // In production, you might want to show a user-friendly error page
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
        <div style="text-align: center; max-width: 500px; padding: 20px;">
          <h1 style="color: #d32f2f;">Configuration Error</h1>
          <p>The application is not properly configured. Please contact your administrator.</p>
        </div>
      </div>
    `;
    throw error;
  }
}


const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </AuthProvider>
  </StrictMode>,
)
