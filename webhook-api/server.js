
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

// Import models
const UserUrl = require('./models/UserUrl');
const Webhook = require('./models/Webhook');
const DBStorage = require('./dbStorage');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket clients map - keeps track of connected clients
const connectedClients = new Map();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.text({ type: 'text/*', limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'build')));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = req.headers['sec-websocket-key'] || uuidv4();
  console.log(`WebSocket client connected: ${clientId}`);
  
  // Store the client connection
  connectedClients.set(clientId, ws);
  
  // Send the client ID back
  ws.send(JSON.stringify({ type: 'connection', clientId }));
  
  ws.on('close', () => {
    console.log(`WebSocket client disconnected: ${clientId}`);
    connectedClients.delete(clientId);
  });
});

// Broadcast new webhook to the specific client
const sendWebhookToClient = (clientId, webhook) => {
  const client = connectedClients.get(clientId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(webhook));
  }
};

// API Routes
app.get('/api/url', async (req, res) => {
  const id = req.headers['sec-websocket-key'] || req.query.userId || uuidv4();
  
  try {
    // Check if URL exists for this user
    let userUrl = await UserUrl.findOne({ userId: id });
    
    if (!userUrl) {
      // Create new URL for this user
      
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`;
      const url = `${baseUrl}/webhook/${id}`;
      
      userUrl = new UserUrl({
        userId: id,
        url: url
      });
      
      await userUrl.save();
    }
    
    res.json({ url: userUrl.url, clientId: id });
  } catch (error) {
    console.error('Error handling URL request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get webhooks for the current user
app.get('/api/webhooks', async (req, res) => {
  const id = req.headers['sec-websocket-key'] || req.query.userId;
  
  if (!id) {
    return res.json([]);
  }
  
  try {
    const webhooks = await DBStorage.getWebhooks(id);
    res.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific webhook
app.get('/api/webhooks/:webhookId', async (req, res) => {
  const userId = req.headers['x-client-id'] || req.query.userId;
  const webhookId = req.params.webhookId;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  try {
    const webhook = await DBStorage.getWebhook(userId, webhookId);
    
    if (webhook) {
      res.status(200).json(webhook);
    } else {
      res.status(404).json({ message: 'Webhook not found' });
    }
  } catch (error) {
    console.error('Error fetching webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a specific webhook
app.delete('/api/webhooks/:webhookId', async (req, res) => {
  const userId = req.headers['x-client-id'] || req.query.userId;
  const webhookId = req.params.webhookId;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  try {
    const success = await DBStorage.deleteWebhook(userId, webhookId);
    
    if (success) {
      res.status(200).json({ message: 'Webhook deleted' });
    } else {
      res.status(404).json({ message: 'Webhook not found' });
    }
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete all webhooks for the current user
app.delete('/api/webhooks', async (req, res) => {
  const userId = req.headers['sec-websocket-key'] || req.query.userId;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  try {
    const deletedCount = await DBStorage.deleteAllWebhooks(userId);
    res.status(200).json({ 
      message: 'All webhooks deleted for this user',
      count: deletedCount
    });
  } catch (error) {
    console.error('Error deleting all webhooks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a webhook
app.post('/api/send', async (req, res) => {
  const { url, method, headers, body } = req.body;
  
  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }
  
  try {
    const response = await axios({
      method: method || 'POST',
      url,
      headers,
      data: body,
      validateStatus: () => true, // Accept any status code
    });
    
    res.json({
      status: response.status,
      headers: response.headers,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to send webhook',
      error: error.message
    });
  }
});

// Webhook receiver endpoint
app.all('/webhook/:uniqueId', async (req, res) => {
  const { uniqueId } = req.params;
  let body = req.body;
  
  // Find which user this uniqueId belongs to
  let targetUserId = null;
  try {
    const userUrl = await UserUrl.findOne({ url: { $regex: `/webhook/${uniqueId}$` } });
    if (userUrl) {
      targetUserId = userUrl.userId;
    }
  } catch (error) {
    console.error('Error finding user for webhook:', error);
  }
  
  // If no matching user is found, return an error
  if (!targetUserId) {
    console.log(`Received webhook for unknown uniqueId: ${uniqueId}`);
    return res.status(400).json({
      status: 400,
      message: 'Webhook not received - unknown endpoint'
    });
  }

  // For non-JSON content types
  if (typeof body === 'object' && Object.keys(body).length === 0 && req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
    body = req.rawBody || '';
  }

  // Create the webhook object
  const webhook = {
    id: uuidv4(),
    userId: targetUserId,
    uniqueId,
    method: req.method,
    path: req.path,
    query: req.query,
    headers: req.headers,
    body,
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date()
  };
  
  try {
    // Save webhook to database
    await DBStorage.saveWebhook(webhook);
    
    // Send the webhook to the client if connected
    sendWebhookToClient(targetUserId, webhook);
    
    // Send a response
    res.status(200).json({ 
      success: true, 
      message: 'Webhook received successfully',
      id: webhook.id,
      timestamp: webhook.timestamp
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
});

// Replay a webhook
app.post('/api/replay', async (req, res) => {
  const { webhookId, targetUrl, method, headers, customBody, useOriginalBody } = req.body;
  const userId = req.headers['x-client-id'] || req.query.userId;
  
  if (!webhookId || !targetUrl) {
    return res.status(400).json({ message: 'Webhook ID and target URL are required' });
  }
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  try {
    // Find the original webhook
    const originalWebhook = await DBStorage.getWebhook(userId, webhookId);
    
    if (!originalWebhook) {
      return res.status(404).json({ message: 'Original webhook not found' });
    }
    
    // Prepare request options
    const requestOptions = {
      method: method || originalWebhook.method,
      headers: headers || originalWebhook.headers,
      data: useOriginalBody ? originalWebhook.body : customBody,
      validateStatus: () => true, // Accept any status code
    };
    
    // Remove content-length header if present as it will be set automatically
    if (requestOptions.headers && requestOptions.headers['content-length']) {
      delete requestOptions.headers['content-length'];
    }
    
    // Send the webhook to the target URL
    const response = await axios({
      url: targetUrl,
      ...requestOptions
    });
    
    // Store the replay attempt as a new webhook with a reference to the original
    const replayWebhook = {
      id: uuidv4(),
      userId,
      uniqueId: originalWebhook.uniqueId,
      method: requestOptions.method,
      path: targetUrl,
      headers: requestOptions.headers,
      body: requestOptions.data,
      replayOf: webhookId,
      originalTimestamp: originalWebhook.timestamp,
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date(),
      response: {
        status: response.status,
        headers: response.headers,
        data: response.data
      }
    };
    
    // Save the replay webhook
    await DBStorage.saveWebhook(replayWebhook);
    
    // Send the webhook to the client
    sendWebhookToClient(userId, replayWebhook);
    
    res.json({
      success: true,
      replayId: replayWebhook.id,
      status: response.status,
      headers: response.headers,
      data: response.data
    });
  } catch (error) {
    console.error('Error replaying webhook:', error);
    res.status(500).json({ 
      message: 'Failed to replay webhook',
      error: error.message
    });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});