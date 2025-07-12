const express = require('express');
const { body, validationResult } = require('express-validator');
const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create swap request
router.post('/', auth, [
  body('itemRequested').isMongoId().withMessage('Valid item ID required'),
  body('itemOffered').optional().isMongoId().withMessage('Valid item ID required'),
  body('swapType').isIn(['direct', 'points']).withMessage('Invalid swap type'),
  body('pointsUsed').optional().isInt({ min: 0 }).withMessage('Points must be a positive number'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemRequested, itemOffered, swapType, pointsUsed, message } = req.body;

    // Check if requested item exists and is available
    const requestedItem = await Item.findById(itemRequested);
    if (!requestedItem || requestedItem.status !== 'available' || !requestedItem.isApproved) {
      return res.status(400).json({ message: 'Item not available for swap' });
    }

    // Check if user is not swapping their own item
    if (requestedItem.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot swap your own item' });
    }

    // Validate points-based swap
    if (swapType === 'points') {
      if (!pointsUsed || pointsUsed < requestedItem.pointsValue) {
        return res.status(400).json({ 
          message: `Insufficient points. Item requires ${requestedItem.pointsValue} points` 
        });
      }

      if (req.user.points < pointsUsed) {
        return res.status(400).json({ message: 'Not enough points in your account' });
      }
    }

    // Validate direct swap
    if (swapType === 'direct') {
      if (!itemOffered) {
        return res.status(400).json({ message: 'Item to offer is required for direct swap' });
      }

      const offeredItem = await Item.findById(itemOffered);
      if (!offeredItem || offeredItem.owner.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'Invalid item offered' });
      }

      if (offeredItem.status !== 'available') {
        return res.status(400).json({ message: 'Offered item is not available' });
      }
    }

    // Create swap request
    const swap = new Swap({
      requester: req.user._id,
      itemRequested,
      itemOffered: swapType === 'direct' ? itemOffered : null,
      pointsUsed: swapType === 'points' ? pointsUsed : 0,
      swapType,
      message
    });

    await swap.save();

    // Deduct points if points-based swap
    if (swapType === 'points') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: -pointsUsed }
      });
    }

    const populatedSwap = await Swap.findById(swap._id)
      .populate('requester', 'name')
      .populate('itemRequested')
      .populate('itemOffered');

    res.status(201).json(populatedSwap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's swap requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const swaps = await Swap.find({ requester: req.user._id })
      .populate('itemRequested')
      .populate('itemOffered')
      .populate('requester', 'name')
      .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get swap requests for user's items
router.get('/my-items', auth, async (req, res) => {
  try {
    const userItems = await Item.find({ owner: req.user._id });
    const itemIds = userItems.map(item => item._id);

    const swaps = await Swap.find({ 
      itemRequested: { $in: itemIds },
      status: 'pending'
    })
    .populate('requester', 'name')
    .populate('itemRequested')
    .populate('itemOffered')
    .sort({ createdAt: -1 });

    res.json(swaps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept swap request
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('itemRequested')
      .populate('itemOffered');

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user owns the requested item
    if (swap.itemRequested.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap request already processed' });
    }

    // Update swap status
    swap.status = 'accepted';
    swap.completedAt = new Date();
    await swap.save();

    // Update item statuses
    await Item.findByIdAndUpdate(swap.itemRequested._id, { status: 'swapped' });
    
    if (swap.itemOffered) {
      await Item.findByIdAndUpdate(swap.itemOffered._id, { status: 'swapped' });
    }

    // Add points to item owner if points-based swap
    if (swap.swapType === 'points') {
      await User.findByIdAndUpdate(swap.itemRequested.owner, {
        $inc: { points: swap.pointsUsed }
      });
    }

    const updatedSwap = await Swap.findById(swap._id)
      .populate('requester', 'name')
      .populate('itemRequested')
      .populate('itemOffered');

    res.json(updatedSwap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject swap request
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('itemRequested');

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user owns the requested item
    if (swap.itemRequested.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap request already processed' });
    }

    // Update swap status
    swap.status = 'rejected';
    await swap.save();

    // Refund points if points-based swap
    if (swap.swapType === 'points') {
      await User.findByIdAndUpdate(swap.requester, {
        $inc: { points: swap.pointsUsed }
      });
    }

    const updatedSwap = await Swap.findById(swap._id)
      .populate('requester', 'name')
      .populate('itemRequested')
      .populate('itemOffered');

    res.json(updatedSwap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel swap request
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user is the requester
    if (swap.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap request already processed' });
    }

    // Update swap status
    swap.status = 'cancelled';
    await swap.save();

    // Refund points if points-based swap
    if (swap.swapType === 'points') {
      await User.findByIdAndUpdate(swap.requester, {
        $inc: { points: swap.pointsUsed }
      });
    }

    res.json({ message: 'Swap request cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single swap
router.get('/:id', auth, async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('requester', 'name')
      .populate('itemRequested')
      .populate('itemOffered');

    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    res.json(swap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 