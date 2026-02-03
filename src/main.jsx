import React from 'react';
import ReactDOM from 'react-dom/client';
import DigitalEventCalendar from './twa';
import './index.css';

console.log('Rendering DigitalEventCalendar...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DigitalEventCalendar />
  </React.StrictMode>,
);
