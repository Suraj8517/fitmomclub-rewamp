import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import LandingPage from './pages/landingPage';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <LandingPage />
  </BrowserRouter>
);