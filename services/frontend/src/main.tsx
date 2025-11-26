import React from 'react';
import ReactDom from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from '@/components/ui/provider';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import App from './App.tsx'

const googleClientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const queryClient = new QueryClient();

ReactDom.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
  <GoogleOAuthProvider clientId={googleClientID}>
    <BrowserRouter>
      <Provider defaultTheme="dark">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </Provider>
    </BrowserRouter>
  </GoogleOAuthProvider>
  //</React.StrictMode>,
)
