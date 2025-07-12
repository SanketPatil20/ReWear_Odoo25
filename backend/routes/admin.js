const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const Swap = require('../models/Swap');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get pending items for approval
router.get('/pending-items', adminAuth, async (req, res) => {
  try {
    const items = await Item.find({ 
      isApproved: false,
      status: 'pending'
    })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve item
router.put('/approve-item/:id', adminAuth, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: true,
        status: 'available'
      },
      { new: true }
    ).populate('owner', 'name');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject item
router.put('/reject-item/:id', adminAuth, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: false,
        status: 'removed'
      },
      { new: true }
    ).populate('owner', 'name');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item (for inappropriate content)
router.delete('/remove-item/:id', adminAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update item status to removed
    item.status = 'removed';
    item.isApproved = false;
    await item.save();

    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get platform statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const pendingItems = await Item.countDocuments({ isApproved: false, status: 'pending' });
    const activeItems = await Item.countDocuments({ isApproved: true, status: 'available' });
    const totalSwaps = await Swap.countDocuments();
    const completedSwaps = await Swap.countDocuments({ status: 'accepted' });

    res.json({
      totalUsers,
      totalItems,
      pendingItems,
      activeItems,
      totalSwaps,
      completedSwaps
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin view)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent swaps
router.get('/recent-swaps', adminAuth, async (req, res) => {
  try {
    const swaps = await Swap.find()
      .populate('requester', 'name')
      .populate('itemRequested', 'title')
      .populate('itemOffered', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(swaps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 