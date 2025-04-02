import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ Use createRoot for React 18
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const loadGoogleMapsScript = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/google-maps-api-key");
        const data = await response.json();
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } catch (error) {
        console.error("Failed to load Google Maps script:", error);
    }
};

loadGoogleMapsScript();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
