const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all items (show all items regardless of approval status)
router.get('/', async (req, res) => {
  try {
    const { category, type, size, search, page = 1, limit = 12 } = req.query;
    
    const query = {}; // Show all items
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (size) query.size = size;
    if (search) {
      query.$text = { $search: search };
    }
    
    const items = await Item.find(query)
      .populate('owner', 'name location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Item.countDocuments(query);
    
    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured items (for carousel)
router.get('/featured', async (req, res) => {
  try {
    const items = await Item.find({}) // Show all items
    .populate('owner', 'name')
    .sort({ createdAt: -1 })
    .limit(6);
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name location bio');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new item
router.post('/', auth, upload.array('images', 5), [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other']).withMessage('Invalid category'),
  body('type').isIn(['casual', 'formal', 'sportswear', 'vintage', 'designer', 'other']).withMessage('Invalid type'),
  body('size').isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']).withMessage('Invalid size'),
  body('condition').isIn(['new', 'like-new', 'good', 'fair', 'worn']).withMessage('Invalid condition'),
  body('pointsValue').isInt({ min: 10, max: 500 }).withMessage('Points value must be between 10 and 500')
], async (req, res) => {
  try {
    console.log('Create item request received');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    console.log('Files:', req.files);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || req.files.length === 0) {
      console.log('No images provided');
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const imagePaths = req.files.map(file => file.filename);
    console.log('Image paths:', imagePaths);
    
    const item = new Item({
      ...req.body,
      images: imagePaths,
      owner: req.user._id,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
    });

    console.log('Item to save:', item);
    await item.save();
    
    const populatedItem = await Item.findById(item._id).populate('owner', 'name');
    console.log('Item created successfully:', populatedItem);
    res.status(201).json(populatedItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => file.filename);
      updateData.images = [...item.images, ...newImagePaths];
    }
    
    if (req.body.tags) {
      updateData.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('owner', 'name');
    
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete associated images
    item.images.forEach(image => {
      const imagePath = path.join(__dirname, '../uploads', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
    
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's items
router.get('/user/me', auth, async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 