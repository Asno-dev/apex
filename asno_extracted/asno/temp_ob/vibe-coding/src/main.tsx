import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress known benign Workspace preview warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('dispatch cannot be called while in idle mode')) {
    return;
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')!).render(
  <App />
);
