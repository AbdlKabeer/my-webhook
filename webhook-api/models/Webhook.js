const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  uniqueId: String,
  method: String,
  path: String,
  query: mongoose.Schema.Types.Mixed,
  headers: mongoose.Schema.Types.Mixed,
  body: mongoose.Schema.Types.Mixed,
  ip: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  replayOf: String,
  originalTimestamp: Date,
  response: {
    status: Number,
    headers: mongoose.Schema.Types.Mixed,
    data: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create compound index for efficient retrieval
webhookSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Webhook', webhookSchema);