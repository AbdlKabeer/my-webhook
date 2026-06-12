import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

function RequestTemplates({ currentRequest, loadTemplate }) {
  const [templates, setTemplates] = useState(
    JSON.parse(localStorage.getItem('webhookTemplates') )|| []
  );
  const [templateName, setTemplateName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Load saved templates from localStorage on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('webhookTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);
  
//   // Save templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('webhookTemplates', JSON.stringify(templates));
  }, [templates]);
  
  const saveCurrentAsTemplate = () => {
    // Validate that we have a request to save
    if (!currentRequest || !currentRequest.url) {
      toast.error('Cannot save an empty request as template');
      return;
    }
    
    setShowSaveDialog(true);
  };
  
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please provide a name for your template');
      return;
    }
    
    // Check for duplicate names
    if (templates.some(t => t.name === templateName)) {
      toast.error('A template with this name already exists');
      return;
    }
    
    const newTemplate = {
      id: Date.now().toString(),
      name: templateName,
      request: { ...currentRequest }
    };
    
    const new_templates = [...templates, newTemplate]
    setTemplates(new_templates);
    setTemplateName('');
    setShowSaveDialog(false);
    toast.success('Template saved successfully');
  };
  
  const handleDeleteTemplate = (id) => {
    setTemplates(templates.filter(template => template.id !== id));
    toast.info('Template deleted');
  };
  
  const handleLoadTemplate = (template) => {
    loadTemplate(template.request);
    toast.success(`Template "${template.name}" loaded`);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Request Templates</h2>
        <button
          onClick={saveCurrentAsTemplate}
          className="px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Save Current
        </button>
      </div>
      
      {showSaveDialog && (
        <div className="mb-6 p-4 border border-indigo-100 rounded bg-indigo-50">
          <h3 className="text-lg font-medium mb-2">Save as Template</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              className="flex-grow px-3 py-2 border rounded mr-2"
            />
            <button
              onClick={handleSaveTemplate}
              className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-4 py-2 cursor-pointer ml-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {templates.length === 0 ? (
        <p className="text-gray-500 italic">No saved templates yet. Save your current request configuration as a template for quick access later.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">URL</th>
                <th className="text-left p-3">Method</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <tr key={template.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{template.name}</td>
                  <td className="p-3 text-sm font-mono truncate max-w-xs">{template.request.url}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      template.request.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                      template.request.method === 'POST' ? 'bg-green-100 text-green-800' :
                      template.request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                      template.request.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {template.request.method}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="px-3 py-1 cursor-pointer bg-indigo-600 text-white rounded mr-2 hover:bg-indigo-700"
                      title="Load template"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="px-3 py-1 cursor-pointer bg-red-600 text-white rounded hover:bg-red-700"
                      title="Delete template"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RequestTemplates;