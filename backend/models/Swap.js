const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemRequested: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  itemOffered: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: false // Optional for point-based redemptions
  },
  pointsUsed: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  swapType: {
    type: String,
    enum: ['direct', 'points'],
    required: true
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Swap', swapSchema); 