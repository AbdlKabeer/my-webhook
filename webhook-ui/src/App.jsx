import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WebhookProvider } from './context/WebhookContext';
import Dashboard from './components/Dashboard';
import RequestDetails from './components/RequestDetails';
import SendWebhook from './components/SendWebhook';
import Navbar from './components/Navbar';
import DojahWidget from './Dojah';

function App() {
  return (
    // <WebhookProvider>
    //   <Router>
    //     <div className="min-h-screen bg-gray-100">
    //       <Navbar />
    //       <div className="container mx-auto px-4 py-8">
    //         <Routes>
    //           <Route path="/" element={<Dashboard />} />
    //           <Route path="/webhook/:id" element={<RequestDetails />} />
    //           <Route path="/send" element={<SendWebhook />} />
    //         </Routes>
    //       </div>
    //     </div>
    //   </Router>
    // </WebhookProvider>
    <DojahWidget />
  );
}

export default App;