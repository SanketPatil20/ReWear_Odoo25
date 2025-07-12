const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other']
  },
  type: {
    type: String,
    required: true,
    enum: ['casual', 'formal', 'sportswear', 'vintage', 'designer', 'other']
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'good', 'fair', 'worn']
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    required: true
  }],
  pointsValue: {
    type: Number,
    required: true,
    min: 10,
    max: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'swapped', 'removed'],
    default: 'available'
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  location: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  material: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for search functionality
itemSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Item', itemSchema); 