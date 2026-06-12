const mongoose = require('mongoose');

const userUrlSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('UserUrl', userUrlSchema);