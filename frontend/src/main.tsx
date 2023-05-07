import {createRoot} from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom';
import App from './App'
import Header from './components/Common/Header';
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
