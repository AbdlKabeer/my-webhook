import React from 'react';
import { Link } from 'react-router-dom';
import { useWebhook } from '../context/WebhookContext';

function WebhookListItem({ webhook }) {
  const { deleteWebhook } = useWebhook();
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const getMethodColor = (method) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };
  
  const calculateSize = (body) => {
    try {
      const bytes = new TextEncoder().encode(JSON.stringify(body)).length;
      if (bytes < 1024) {
        return `${bytes} B`;
      } else if (bytes < 1048576) {
        return `${(bytes / 1024).toFixed(1)} KB`;
      } else {
        return `${(bytes / 1048576).toFixed(1)} MB`;
      }
    } catch (e) {
      return '0 B';
    }
  };
  
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getMethodColor(webhook.method)}`}>
          {webhook.method.toUpperCase()}
        </span>
      </td>
      <td className="py-3 px-4 max-w-xs truncate">{webhook.path}</td>
      <td className="py-3 px-4">{webhook.ip}</td>
      <td className="py-3 px-4">{formatDate(webhook.timestamp)}</td>
      <td className="py-3 px-4">{calculateSize(webhook.body)}</td>
      <td className="py-3 px-4 text-center">
        <div className="flex justify-center space-x-2">
          <Link 
            to={`/webhook/${webhook.id}`}
            className="text-indigo-600 hover:text-indigo-900"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </Link>
          <button
            onClick={() => deleteWebhook(webhook.id)}
            className="text-red-600 cursor-pointer hover:text-red-900"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default WebhookListItem;
