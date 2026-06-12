import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import { useWebhook } from '../context/WebhookContext';
import WebhookListItem from './WebhookListItem';
import { useWebhook } from '../context/WebhookContext';

function WebhookList() {
  const { webhooks, loading } = useWebhook();
  const [filter, setFilter] = useState('');
  
  const filteredWebhooks = Array.isArray(webhooks) 
  ? webhooks.filter(webhook => 
      webhook.method.toLowerCase().includes(filter.toLowerCase()) ||
      webhook.path.toLowerCase().includes(filter.toLowerCase()) ||
      webhook.ip.toLowerCase().includes(filter.toLowerCase())
    ) 
  : [];

  
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Webhooks</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter webhooks..."
              className="pl-8 pr-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <svg
              className="absolute left-2 top-2 h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {webhooks.length === 0 ? (
        <div className="py-8 px-4 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="mt-2 text-gray-500">No webhooks received yet. Send a request to your unique URL to see it here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">Method</th>
                <th className="py-3 px-4 text-left">Path</th>
                <th className="py-3 px-4 text-left">Source IP</th>
                <th className="py-3 px-4 text-left">Time</th>
                <th className="py-3 px-4 text-left">Size</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredWebhooks.map(webhook => (
                <WebhookListItem key={webhook.id} webhook={webhook} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default WebhookList;