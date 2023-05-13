import {createRoot} from 'react-dom/client'
import App from './App'
import './App.css';
import React from 'react';

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
)
