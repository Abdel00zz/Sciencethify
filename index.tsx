
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { MathJaxContext } from 'better-react-mathjax';
import { HashRouter } from 'react-router-dom';
import { mathjaxConfig } from './services/mathjaxConfig';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <MathJaxContext config={mathjaxConfig}>
        <ToastProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </ToastProvider>
      </MathJaxContext>
    </HashRouter>
  </React.StrictMode>
);