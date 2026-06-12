const UserUrl = require('./models/UserUrl');
const Webhook = require('./models/Webhook');

const DBStorage = {
  // Save user URL
  saveUrl: async (userId, url) => {
    try {
      await UserUrl.findOneAndUpdate(
        { userId },
        { userId, url },
        { upsert: true, new: true }
      );
      return true;
    } catch (error) {
      console.error('Error saving URL to database:', error);
      return false;
    }
  },

  // Load URL for a user
  loadUrl: async (userId) => {
    try {
      const userUrl = await UserUrl.findOne({ userId });
      return userUrl ? userUrl.url : null;
    } catch (error) {
      console.error('Error loading URL from database:', error);
      return null;
    }
  },

  // Load all URLs
  loadAllUrls: async () => {
    try {
      const userUrls = await UserUrl.find({});
      const urlMap = new Map();
      
      userUrls.forEach(userUrl => {
        urlMap.set(userUrl.userId, userUrl.url);
      });
      
      return urlMap;
    } catch (error) {
      console.error('Error loading all URLs from database:', error);
      return new Map();
    }
  },

  // Save webhook
  saveWebhook: async (webhook) => {
    try {
      const newWebhook = new Webhook(webhook);
      await newWebhook.save();
      return true;
    } catch (error) {
      console.error('Error saving webhook to database:', error);
      return false;
    }
  },

  // Get webhooks for a user with pagination
  getWebhooks: async (userId, limit = 100) => {
    try {
      return await Webhook.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error getting webhooks from database:', error);
      return [];
    }
  },

  // Get a specific webhook
  getWebhook: async (userId, webhookId) => {
    try {
      return await Webhook.findOne({ userId, id: webhookId });
    } catch (error) {
      console.error('Error getting webhook from database:', error);
      return null;
    }
  },

  // Delete a specific webhook
  deleteWebhook: async (userId, webhookId) => {
    try {
      const result = await Webhook.deleteOne({ userId, id: webhookId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting webhook from database:', error);
      return false;
    }
  },

  // Delete all webhooks for a user
  deleteAllWebhooks: async (userId) => {
    try {
      const result = await Webhook.deleteMany({ userId });
      return result.deletedCount;
    } catch (error) {
      console.error('Error deleting all webhooks from database:', error);
      return 0;
    }
  },

  // Get unique IDs for all users
  getUserIds: async () => {
    try {
      const userUrls = await UserUrl.find({}, 'userId');
      return userUrls.map(u => u.userId);
    } catch (error) {
      console.error('Error getting user IDs from database:', error);
      return [];
    }
  }
};

module.exports = DBStorage;