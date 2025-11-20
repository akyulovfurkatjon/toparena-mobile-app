import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Bu 'web/public/index.html' faylidagi "root" div ni topadi
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

// Va uning ichiga bizning asosiy <App /> komponentimizni joylaydi
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
