import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axiosInstance from '../axiosConfig';
import { useWebhook } from '../context/WebhookContext';
import WebhookReplay from './WebhookReplay';
import toast from 'react-hot-toast';

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId, deleteWebhook } = useWebhook();
  const [webhook, setWebhook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('headers');
  
  useEffect(() => {
    const fetchWebhook = async () => {
      try {
        const response = await axiosInstance.get(`/webhooks/${id}`,{
          headers: { 'X-Client-ID': userId }
        });
        setWebhook(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load webhook details');
        setLoading(false);
      }
    };
    
    fetchWebhook();
  }, [id]);


  // Determine if the webhook is a replay
  const isReplay = webhook && webhook?.replayOf;
  
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !webhook) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700">
        <h2 className="font-bold mb-2">Error</h2>
        <p>{error || 'Webhook not found'}</p>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
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
  
  const formatJSON = (data) => {
    try {
      if (typeof data === 'string') {
        // Try to parse if it's a JSON string
        return JSON.stringify(JSON.parse(data), null, 2);
      }
      return JSON.stringify(data, null, 2);
    } catch (e) {
      // If it's not valid JSON, return as is
      return data;
    }
  };
  
  const formatHeaders = (headers) => {
    return Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\n');
  };
  const detectContentType = (body, headers) => {
    console.log(headers);
  
    // Check Content-Type header
    const contentType = headers['content-type'] || headers['Content-Type'] || '';
  
    if (contentType.includes('application/json')) {
      return 'json';
    } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
      return 'xml';
    } else if (contentType.includes('text/html')) {
      return 'html';
    } else if (contentType.includes('text/plain')) {
      return 'text';
    }
  
    // Try to detect based on content
    try {
      if (typeof body === 'string') {
        JSON.parse(body); // Attempt to parse as JSON
        return 'json';
      }
    } catch (e) {
      // If not JSON, check if the body looks like XML
      if (typeof body === 'string' && body.trim().startsWith('<') && body.trim().endsWith('>')) {
        return 'xml';
      }
    }
  
    // Default to 'text' if no other matches
    return 'text';
  };
  
  
  const contentType = detectContentType(webhook.body, webhook.headers);
  
  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="text-indigo-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {isReplay ? 'Webhook Replay' : 'Webhook Details'}
        </h1>
        <div>
          <button
            onClick={() => {
              deleteWebhook(webhook.id)
              toast.success(
                'Webhook deleted successfully',
              )
              navigate('/')
            }}
            className="px-3 py-1 cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 mr-2"
          >
            Delete
          </button>
        </div>
      </div>
      {isReplay && (
        <div className="bg-indigo-50 p-3 rounded-md mb-4 border border-indigo-200">
          <p className="text-indigo-700">
            This is a replayed webhook. Original webhook received at{' '}
            <span className="font-medium">{new Date(webhook.originalTimestamp).toLocaleString()}</span>
          </p>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                <span className={`px-3 py-1 rounded-md text-sm font-medium ${getMethodColor(webhook.method)}`}>
                  {webhook.method.toUpperCase()}
                </span>
                <h1 className="ml-3 text-xl font-semibold text-gray-800">{webhook.path}</h1>
              </div>
              <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-500 mt-2">
                <div className="flex items-center mr-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(webhook.timestamp)}
                </div>
                <div className="flex items-center mr-6 mt-1 md:mt-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {webhook.ip}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'headers' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('headers')}
            >
              Headers
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'body' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('body')}
            >
              Body
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'query' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('query')}
            >
              Query Params
            </button>
          </div>
          
          <div className="p-4 bg-gray-50">
            {activeTab === 'headers' && (
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Request Headers</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(formatHeaders(webhook.headers))}
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Copy
                  </button>
                </div>
                <SyntaxHighlighter language="http" style={tomorrow} customStyle={{ borderRadius: '0.375rem' }}>
                  {formatHeaders(webhook.headers)}
                </SyntaxHighlighter>
              </div>
            )}
            
            {activeTab === 'body' && (
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Request Body</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(typeof webhook.body === 'string' ? webhook.body : formatJSON(webhook.body))}
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Copy
                  </button>
                </div>
                {webhook.body ? (
                  <SyntaxHighlighter language={contentType} style={tomorrow} customStyle={{ borderRadius: '0.375rem' }}>
                    {typeof webhook.body === 'string' ? webhook.body : formatJSON(webhook.body)}
                  </SyntaxHighlighter>
                ) : (
                  <div className="text-gray-500 text-sm italic p-4 bg-gray-100 rounded-md">
                    No request body
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'query' && (
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Query Parameters</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(formatJSON(webhook.query))}
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Copy
                  </button>
                </div>
                {webhook?.query  && Object.keys(webhook.query).length > 0 ? (
                  <SyntaxHighlighter language="json" style={tomorrow} customStyle={{ borderRadius: '0.375rem' }}>
                    {formatJSON(webhook.query)}
                  </SyntaxHighlighter>
                ) : (
                  <div className="text-gray-500 text-sm italic p-4 bg-gray-100 rounded-md">
                    No query parameters
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {!isReplay && (
          <WebhookReplay webhook={webhook} />
        )}
      </div>
    </div>
  );
}

export default RequestDetails;

