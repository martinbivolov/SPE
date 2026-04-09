import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { VolumeProvider } from './contexts/VolumeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <ChakraProvider value={defaultSystem}>
          <VolumeProvider>
            <App />
          </VolumeProvider>
        </ChakraProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
