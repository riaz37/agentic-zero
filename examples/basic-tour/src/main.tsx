import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AgenticProvider } from '@agentic-zero/core';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AgenticProvider config={{
            autoStart: false, // Wait for user click in App.tsx
            debug: true,      // Enable flight recorder logging
            bridge: {
                scrollBehavior: 'smooth',
                interruptionThreshold: 50, // Sensitivity for tug-of-war
            }
        }}>
            <App />
        </AgenticProvider>
    </React.StrictMode>
);
