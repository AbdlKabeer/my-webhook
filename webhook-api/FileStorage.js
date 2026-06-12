const fs = require('fs');
const path = require('path');

// Configure storage directory
const STORAGE_DIR = path.join(__dirname, 'data');
const WEBHOOKS_FILE = path.join(STORAGE_DIR, 'webhooks.json');
const URLS_FILE = path.join(STORAGE_DIR, 'urls.json');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Storage utility functions
const FileStorage = {
  // Save data to file
  saveData: (filePath, data) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Data saved to ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Error saving data to ${filePath}:`, error);
      return false;
    }
  },

  // Load data from file
  loadData: (filePath, defaultValue = {}) => {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Check if file is empty or has invalid content
        if (!fileContent || fileContent.trim() === '') {
          console.log(`File ${filePath} exists but is empty. Using default value.`);
          return defaultValue;
        }
        
        try {
          const data = JSON.parse(fileContent);
          console.log(`Data loaded from ${filePath}`);
          return data;
        } catch (parseError) {
          console.error(`Error parsing JSON from ${filePath}:`, parseError);
          console.log(`Creating backup of corrupted file...`);
          
          // Create a backup of the corrupted file
          const backupPath = `${filePath}.backup-${Date.now()}`;
          fs.copyFileSync(filePath, backupPath);
          console.log(`Backup created at ${backupPath}`);
          
          // Initialize with default value
          console.log(`Using default value instead.`);
          return defaultValue;
        }
      }
      console.log(`File ${filePath} does not exist. Using default value.`);
      return defaultValue;
    } catch (error) {
      console.error(`Error loading data from ${filePath}:`, error);
      return defaultValue;
    }
  },

  // Convert Map to JSON-serializable object
  mapToObject: (map) => {
    const obj = {};
    for (const [key, value] of map.entries()) {
      obj[key] = value;
    }
    return obj;
  },

  // Convert object back to Map
  objectToMap: (obj) => {
    const map = new Map();
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          map.set(key, obj[key]);
        }
      }
    }
    return map;
  },

  // Save webhooks data
  saveWebhooks: (webhooksByUser) => {
    const webhooksObj = FileStorage.mapToObject(webhooksByUser);
    return FileStorage.saveData(WEBHOOKS_FILE, webhooksObj);
  },

  // Load webhooks data
  loadWebhooks: () => {
    const webhooksObj = FileStorage.loadData(WEBHOOKS_FILE, {});
    return FileStorage.objectToMap(webhooksObj);
  },

  // Save URLs data
  saveUrls: (userUrls) => {
    const urlsObj = FileStorage.mapToObject(userUrls);
    return FileStorage.saveData(URLS_FILE, urlsObj);
  },

  // Load URLs data
  loadUrls: () => {
    const urlsObj = FileStorage.loadData(URLS_FILE, {});
    return FileStorage.objectToMap(urlsObj);
  },

  // Initialize files with empty objects if they don't exist
  initializeFiles: () => {
    if (!fs.existsSync(WEBHOOKS_FILE)) {
      FileStorage.saveData(WEBHOOKS_FILE, {});
    }
    if (!fs.existsSync(URLS_FILE)) {
      FileStorage.saveData(URLS_FILE, {});
    }
  }
};

// Initialize files on module load
FileStorage.initializeFiles();

module.exports = FileStorage;