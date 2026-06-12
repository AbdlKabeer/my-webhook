// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useWebhook } from '../context/WebhookContext';
// import WebhookList from './WebhookList';

// function Dashboard() {
//   const { userUrl, clearWebhooks, loading } = useWebhook();
//   const [copied, setCopied] = useState(false);
  
//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(userUrl);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };
  
//   return (
//     <div>
//       <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//         <h1 className="text-2xl font-bold text-gray-800 mb-4">Webhook Tester Dashboard</h1>
//         <div className="mb-6">
//           <p className="text-gray-600 mb-2">Your unique webhook URL:</p>
//           <div className="flex flex-col md:flex-row items-start md:items-center">
//             <code className="bg-gray-100 p-3 rounded font-mono text-sm flex-grow break-all">{userUrl}</code>
//             <button
//               onClick={copyToClipboard}
//               className="mt-2 cursor-pointer md:mt-0 md:ml-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
//             >
//               {copied ? (
//                 <>
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   Copied!
//                 </>
//               ) : (
//                 <>
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                     <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
//                     <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
//                   </svg>
//                   Copy URL
//                 </>
//               )}
//             </button>
//           </div>
//           <p className="text-gray-500 text-sm mt-2">Use this URL to receive webhooks from external services.</p>
//         </div>
//         <div className="flex justify-between items-center">
//           <div className="flex space-x-4">
//             <Link
//               to="/send"
//               className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
//               </svg>
//               Send Webhook
//             </Link>
//             <button
//               onClick={clearWebhooks}
//               className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//               Clear All
//             </button>
//           </div>
//         </div>
//       </div>
      
//       <WebhookList />
//     </div>
//   );
// }

// export default Dashboard;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebhook } from '../context/WebhookContext';
import WebhookList from './WebhookList';
import WebhookComparison from './WebhookComparison';

function Dashboard() {
  const { userUrl, clearWebhooks, loading } = useWebhook();
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(userUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Webhook Tester Dashboard</h1>
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Your unique webhook URL:</p>
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <code className="bg-gray-100 p-3 rounded font-mono text-sm flex-grow break-all">{userUrl}</code>
            <button
              onClick={copyToClipboard}
              className="mt-2 cursor-pointer md:mt-0 md:ml-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                  </svg>
                  Copy URL
                </>
              )}
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-2">Use this URL to receive webhooks from external services.</p>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4">
            <Link
              to="/send"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              Send Webhook
            </Link>
            <button
              onClick={clearWebhooks}
              className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Clear All
            </button>
          </div>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {showComparison ? 'Hide Comparison' : 'Compare Webhooks'}
          </button>
        </div>
      </div>
      
      {showComparison && <WebhookComparison />}
      
      <WebhookList />
    </div>
  );
}

export default Dashboard;