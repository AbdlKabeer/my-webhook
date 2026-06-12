# Webhook Dashboard & API

## Project Overview
The **Webhook Dashboard & API** is a full-stack application designed to help users manage, monitor, and test webhooks in real-time. It consists of a Node.js/Express backend that receives and stores webhooks, and a React frontend that provides an interactive dashboard to view them as they are triggered.

Key features include:
- **Real-Time Webhooks:** View incoming webhooks in real-time via WebSocket integration.
- **Webhook Management:** Add, delete, or clear webhooks from the dashboard.
- **Detailed View:** Inspect individual webhook details, including headers, body, and query parameters.
- **Filter and Search:** Filter webhooks based on method, path, or IP.
- **Clipboard Copying:** Easily copy webhook data (headers, body, query parameters) to your clipboard.
- **Responsive Design:** Fully responsive layout for both desktop and mobile.

## Repository Structure
This repository contains both the frontend and backend of the application:
- `/webhook-api`: The backend Node.js API server.
- `/webhook-ui`: The frontend React application built with Vite.

## Technologies Used
**Frontend (webhook-ui):**
- React 19
- Vite
- Tailwind CSS v4
- React Router
- Axios
- WebSockets
- React Syntax Highlighter

**Backend (webhook-api):**
- Node.js
- Express.js
- MongoDB (via Mongoose)
- WebSockets (ws)
- dotenv

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Backend Setup (API)
1. Navigate to the API directory:
   ```bash
   cd webhook-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `webhook-api` directory with your environment variables (e.g., MongoDB URI, PORT).
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup (UI)
1. Open a new terminal and navigate to the UI directory:
   ```bash
   cd webhook-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. The frontend will be accessible at `http://localhost:5173` (or the port specified by Vite).

## Features

### Real-Time Webhooks
The application listens to a WebSocket and displays incoming webhooks instantly. As soon as a new webhook is received by the backend, it will appear in the frontend list without needing to refresh.

### Filter Webhooks
You can filter webhooks by their method, path, or IP address to quickly find the data you need.

### Detailed View
Clicking on any webhook entry will show you detailed information about it, including:
- Request method (GET, POST, etc.)
- Path and IP address
- Request headers, body content, and query parameters (if applicable)
- Formatted syntax for easier reading

## License
This project is licensed under the MIT License.
