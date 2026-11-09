import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { ReactFlowProvider } from '@xyflow/react';
import { App } from './App';
import './index.css';

const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
if (apiBase) {
  axios.defaults.baseURL = apiBase;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </React.StrictMode>
);
