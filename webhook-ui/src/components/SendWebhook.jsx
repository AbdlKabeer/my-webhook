import React, { useState, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import RequestTemplates from './RequestTemplates';

function SendWebhook() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('POST');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [bodyContent, setBodyContent] = useState('{\n  "message": "Hello World"\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Get current request for saving as a template
  const getCurrentRequest = () => {
    return {
      url,
      method,
      headers,
      body: bodyContent
    };
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  // Export configuration to a JSON file
  const exportConfiguration = () => {
    const config = {
      url,
      method,
      headers,
      body: bodyContent,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Configuration exported successfully');
  };

  // Trigger file input click
  const triggerImportFile = () => {
    fileInputRef.current.click();
  };

  // Import configuration from a JSON file
  const importConfiguration = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        
        // Validate the imported configuration
        if (!config.url || !config.method) {
          throw new Error('Invalid configuration file');
        }
        
        // Update state with imported configuration
        setUrl(config.url || '');
        setMethod(config.method || 'POST');
        
        // Handle headers
        if (config.headers && Array.isArray(config.headers)) {
          setHeaders(config.headers);
        } else {
          setHeaders([{ key: 'Content-Type', value: 'application/json' }]);
        }
        
        // Handle body
        if (config.body) {
          setBodyContent(config.body);
        }
        
        toast.success('Configuration imported successfully');
      } catch (err) {
        console.error('Error importing configuration:', err);
        toast.error('Failed to import configuration');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    // Convert headers array to object
    const headerObj = {};
    headers.forEach(h => {
      if (h.key.trim()) {
        headerObj[h.key.trim()] = h.value;
      }
    });

    try {
      // Prepare request options
      const requestOptions = {
        method,
        headers: headerObj,
      };

      // Handle the body for non-GET requests
      if (method !== 'GET') {
        // Check if we're sending JSON
        const contentType = headerObj['Content-Type'] || '';
        if (contentType.includes('application/json')) {
          // Validate and parse JSON before sending
          try {
            // Parse and stringify to validate JSON
            const jsonBody = JSON.parse(bodyContent);
            requestOptions.body = JSON.stringify(jsonBody);
          } catch (jsonError) {
            toast.error('Invalid JSON in body');
            throw new Error(`Invalid JSON in body: ${jsonError.message}`);
          }
        } else {
          // For other content types, send as is
          requestOptions.body = bodyContent;
        }
      }

      // Make the request using fetch
      const response = await fetch(url, requestOptions);

      // Read the response as text first
      const responseText = await response.text();
      let responseData = responseText;

      // Try to parse as JSON if possible
      try {
        if (responseText && responseText.trim()) {
          responseData = JSON.parse(responseText);
        }
      } catch (err) {
        // If not JSON, keep as text
        console.log('Response is not JSON:', responseText);
      }

      setResult({
        status: response.status,
        headers: Object.fromEntries([...response.headers.entries()]),
        data: responseData
      });
      
      toast.success('Webhook Sent Successfully');
    } catch (error) {
      console.error('Error sending webhook:', error);
      setError(error.message || 'Failed to send webhook');
      toast.error('Failed to Send Webhook');
    } finally {
      setLoading(false);
    }
  };

  // Load template function to be passed to RequestTemplates
  const loadTemplate = (template) => {
    setUrl(template.url || '');
    setMethod(template.method || 'POST');
    
    // Handle headers
    if (template.headers && Array.isArray(template.headers)) {
      setHeaders(template.headers);
    } else {
      // Convert header object to array format if needed
      const headerArray = [];
      if (template.headers) {
        Object.entries(template.headers).forEach(([key, value]) => {
          headerArray.push({ key, value });
        });
        setHeaders(headerArray.length ? headerArray : [{ key: 'Content-Type', value: 'application/json' }]);
      } else {
        setHeaders([{ key: 'Content-Type', value: 'application/json' }]);
      }
    }
    
    // Handle body
    if (template.body) {
      if (typeof template.body === 'object') {
        setBodyContent(JSON.stringify(template.body, null, 2));
      } else {
        setBodyContent(template.body);
      }
    } else {
      setBodyContent('');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Toaster position="top-right" />

      <RequestTemplates 
        currentRequest={getCurrentRequest()} 
        loadTemplate={loadTemplate} 
      />
      
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Send Webhook</h1>
            <p className="text-gray-600">Use this form to send a webhook request to any URL.</p>
          </div>
          
          {/* Export/Import Buttons */}
          <div className="flex space-x-2">
            {/* <button
              type="button"
              onClick={exportConfiguration}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Export Config
            </button> */}
            <button
              type="button"
              onClick={triggerImportFile}
              className="px-3 py-2 cursor-pointer bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Import Config
            </button>
            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={importConfiguration}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <form onSubmit={handleSubmit} className="w-full">
          {/* URL Field */}
          <div className="mb-6">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              id="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          {/* Method Dropdown */}
          <div className="mb-6">
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
              Method
            </label>
            <select
              id="method"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          {/* Headers Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Headers</label>
              <button
                type="button"
                onClick={addHeader}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Header
              </button>
            </div>
            {headers.map((header, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Header name"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                />
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Header value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeHeader(index)}
                  className="px-2 py-2 cursor-pointer text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          {/* Body Section */}
          <div className="mb-6">
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
              Body
            </label>
            <textarea
              id="body"
              rows={10}
              className="font-mono w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={bodyContent}
              onChange={(e) => setBodyContent(e.target.value)}
            />
          </div>
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Webhook'
              )}
            </button>
          </div>
        </form>
        {/* Response Section */}
        <div>
          {loading === false && !result && !error && (
            <div className="text-gray-600 text-center py-4">Please send a webhook request.</div>
          )}

          {(result || error) && (
            <div className="mt-4">
              <h2 className="text-lg font-medium text-gray-800 mb-2">Response</h2>
              {error ? (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <div className="flex justify-between items-start">
                    <h3 className="text-green-800 font-medium">Success</h3>
                    <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      {result.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Response Headers</h4>
                    <pre className="bg-gray-800 p-3 rounded-md text-xs text-gray-200 overflow-x-auto">
                      {result?.headers && Object.entries(result.headers).map(([key, value]) => (
                        `${key}: ${value}\n`
                      ))}
                    </pre>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Response Body</h4>
                    <pre className="bg-gray-800 p-3 rounded-md text-xs text-gray-200 overflow-x-auto">
                      {typeof result?.data === 'object' ? JSON.stringify(result.data, null, 2) : result?.data}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SendWebhook;