import React from 'react';
import { Link } from 'react-router-dom';
import { useWebhook } from '../context/WebhookContext';

function Navbar() {
  const { userUrl } = useWebhook();
  
  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-white font-bold text-xl">WebhookTester (Beta)</Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md">Dashboard</Link>
            <Link to="/send" className="text-white hover:text-indigo-200 px-3 py-2 rounded-md">Send Webhook</Link>
          </div>
          {userUrl && (
            <div className="hidden md:flex items-center">
              <div className="bg-white rounded-md px-3 py-1 flex items-center">
                <span className="text-gray-600 text-sm mr-2">Your Webhook URL:</span>
                <span className="text-indigo-600 font-mono text-sm truncate max-w-xs">{userUrl}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(userUrl)}
                  className="ml-2 cursor-pointer text-gray-500 hover:text-indigo-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;