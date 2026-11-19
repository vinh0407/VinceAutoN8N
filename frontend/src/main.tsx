import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { ReactFlowProvider } from '@xyflow/react';
import { App } from './App';
import { LoginGate } from './components/auth/LoginGate';
import './index.css';

const RENDER_BACKEND_URL = 'https://vinceauto-backend.onrender.com';
const envApiBase = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const isVercelHost = typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app');
const apiBase = envApiBase || (isVercelHost ? RENDER_BACKEND_URL : '');
if (apiBase) {
  axios.defaults.baseURL = apiBase;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <LoginGate>
        <App />
      </LoginGate>
    </ReactFlowProvider>
  </React.StrictMode>
);
