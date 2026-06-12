import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useWebhook } from '../context/WebhookContext';
import axiosInstance from '../axiosConfig';
import toast from 'react-hot-toast';

const WebhookComparison = () => {
  const { userId, webhooks } = useWebhook();
  const [webhookA, setWebhookA] = useState(null);
  const [webhookB, setWebhookB] = useState(null);
  const [webhookAId, setWebhookAId] = useState('');
  const [webhookBId, setWebhookBId] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('headers');
  const [differences, setDifferences] = useState({
    headers: {},
    body: {},
    query: {}
  });

  useEffect(() => {
    // Reset differences when webhooks change
    if (webhookA && webhookB) {
      compareWebhooks();
    }
  }, [webhookA, webhookB, activeTab]);

  const fetchWebhook = async (webhookId, setWebhook) => {
    if (!webhookId) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/webhooks/${webhookId}`, {
        headers: { 'X-Client-ID': userId }
      });
      setWebhook(response.data);
    } catch (error) {
      toast.error('Failed to load webhook details');
    } finally {
      setLoading(false);
    }
  };

  const handleWebhookAChange = (e) => {
    const id = e.target.value;
    setWebhookAId(id);
    fetchWebhook(id, setWebhookA);
  };

  const handleWebhookBChange = (e) => {
    const id = e.target.value;
    setWebhookBId(id);
    fetchWebhook(id, setWebhookB);
  };

  // Function to find differences between two objects
  const findDifferences = (obj1, obj2) => {
    const allKeys = [...new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})])];
    const diff = {};

    allKeys.forEach(key => {
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];

      // Check if values are different
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        diff[key] = { 
          left: val1 === undefined ? null : val1, 
          right: val2 === undefined ? null : val2,
          status: val1 === undefined ? 'added' : (val2 === undefined ? 'removed' : 'changed')
        };
      }
    });

    return diff;
  };

  // Compare the selected webhooks
  const compareWebhooks = () => {
    if (!webhookA || !webhookB) return;

    const headerDiffs = findDifferences(webhookA.headers, webhookB.headers);
    
    // Compare body - handling different formats
    let bodyA = webhookA.body;
    let bodyB = webhookB.body;
    
    try {
      if (typeof bodyA === 'string') {
        bodyA = JSON.parse(bodyA);
      }
    } catch {}
    
    try {
      if (typeof bodyB === 'string') {
        bodyB = JSON.parse(bodyB);
      }
    } catch {}
    
    const bodyDiffs = typeof bodyA === 'object' && typeof bodyB === 'object' 
      ? findDifferences(bodyA, bodyB) 
      : bodyA !== bodyB ? { content: { left: bodyA, right: bodyB, status: 'changed' } } : {};
    
    const queryDiffs = findDifferences(webhookA.query, webhookB.query);
    
    setDifferences({
      headers: headerDiffs,
      body: bodyDiffs,
      query: queryDiffs
    });
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

  const detectContentType = (body, headers) => {
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Renders the difference highlight for header, query, and body
  const renderDifference = (section) => {
    const diffs = differences[section];
    
    if (!diffs || Object.keys(diffs).length === 0) {
      return (
        <div className="text-gray-500 text-sm italic p-4 bg-gray-100 rounded-md">
          No differences detected
        </div>
      );
    }
    
    return (
      <div className="bg-gray-100 rounded-md p-4">
        {Object.entries(diffs).map(([key, { left, right, status }]) => (
          <div key={key} className="mb-4 last:mb-0">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold">{key}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                status === 'added' ? 'bg-green-100 text-green-800' : 
                status === 'removed' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {status === 'added' ? 'Added' : status === 'removed' ? 'Removed' : 'Changed'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-2 bg-white">
                <div className="text-xs text-gray-500 mb-1">Webhook A</div>
                <SyntaxHighlighter 
                  language={section === 'body' ? detectContentType(webhookA?.body, webhookA?.headers) : 'json'} 
                  style={tomorrow} 
                  customStyle={{ borderRadius: '0.375rem', fontSize: '12px' }}
                >
                  {left === null ? '(not present)' : typeof left === 'object' ? JSON.stringify(left, null, 2) : String(left)}
                </SyntaxHighlighter>
              </div>
              <div className="border rounded-md p-2 bg-white">
                <div className="text-xs text-gray-500 mb-1">Webhook B</div>
                <SyntaxHighlighter 
                  language={section === 'body' ? detectContentType(webhookB?.body, webhookB?.headers) : 'json'} 
                  style={tomorrow} 
                  customStyle={{ borderRadius: '0.375rem', fontSize: '12px' }}
                >
                  {right === null ? '(not present)' : typeof right === 'object' ? JSON.stringify(right, null, 2) : String(right)}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Webhook Comparison</h2>
        <p className="text-gray-600 text-sm mt-1">Compare two webhooks side-by-side to spot differences</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Webhook</label>
            <select 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={webhookAId}
              onChange={handleWebhookAChange}
            >
              <option value="">Select a webhook</option>
              {webhooks.map(webhook => (
                <option key={webhook.id} value={webhook.id}>
                  {webhook.method} {webhook.path} ({formatDate(webhook.timestamp)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Second Webhook</label>
            <select 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={webhookBId}
              onChange={handleWebhookBChange}
            >
              <option value="">Select a webhook</option>
              {webhooks.map(webhook => (
                <option key={webhook.id} value={webhook.id}>
                  {webhook.method} {webhook.path} ({formatDate(webhook.timestamp)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {webhookA && webhookB && !loading && (
          <>
            <div className="flex border-b mb-4">
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

            <div className="bg-gray-50 rounded-md p-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-semibold text-gray-700">Differences in {activeTab}</h3>
                  <div className="flex space-x-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Added</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Removed</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Changed</span>
                  </div>
                </div>
                {renderDifference(activeTab)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-indigo-50 p-3 border-b border-indigo-100">
                    <h3 className="font-medium">Webhook A</h3>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">{webhookA.method}</span> {webhookA.path}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatDate(webhookA.timestamp)}
                    </div>
                  </div>
                  <div className="p-3">
                    <SyntaxHighlighter 
                      language={activeTab === 'body' ? detectContentType(webhookA.body, webhookA.headers) : 'json'} 
                      style={tomorrow} 
                      customStyle={{ borderRadius: '0.375rem', fontSize: '12px' }}
                    >
                      {activeTab === 'headers' 
                        ? formatJSON(webhookA.headers)
                        : activeTab === 'body' 
                          ? typeof webhookA.body === 'string' ? webhookA.body : formatJSON(webhookA.body)
                          : formatJSON(webhookA.query)}
                    </SyntaxHighlighter>
                  </div>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-indigo-50 p-3 border-b border-indigo-100">
                    <h3 className="font-medium">Webhook B</h3>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">{webhookB.method}</span> {webhookB.path}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatDate(webhookB.timestamp)}
                    </div>
                  </div>
                  <div className="p-3">
                    <SyntaxHighlighter 
                      language={activeTab === 'body' ? detectContentType(webhookB.body, webhookB.headers) : 'json'} 
                      style={tomorrow} 
                      customStyle={{ borderRadius: '0.375rem', fontSize: '12px' }}
                    >
                      {activeTab === 'headers' 
                        ? formatJSON(webhookB.headers)
                        : activeTab === 'body' 
                          ? typeof webhookB.body === 'string' ? webhookB.body : formatJSON(webhookB.body)
                          : formatJSON(webhookB.query)}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WebhookComparison;