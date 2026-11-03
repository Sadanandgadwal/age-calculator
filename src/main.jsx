import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import { preloadToolPage } from './data/toolPages.js';
import './styles/index.css';

function start() {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

// If the tool's code can't load now, starting anyway lets the app show its error message.
preloadToolPage(window.location.pathname).then(start, start);
