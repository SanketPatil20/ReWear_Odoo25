const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5001;

// Simple in-memory storage
let users = [];
let items = [];
let swaps = [];

// Load data from file if exists
const dataFile = path.join(__dirname, 'data.json');
if (fs.existsSync(dataFile)) {
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  users = data.users || [];
  items = data.items || [];
  swaps = data.swaps || [];
}

// Save data to file
const saveData = () => {
  fs.writeFileSync(dataFile, JSON.stringify({ users, items, swaps }, null, 2));
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      points: 100,
      role: 'user'
    };

    users.push(user);
    saveData();

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/profile', auth, (req, res) => {
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Items routes
app.get('/api/items', (req, res) => {
  const approvedItems = items.filter(item => item.isApproved && item.status === 'available');
  res.json({
    items: approvedItems,
    totalPages: 1,
    currentPage: 1,
    total: approvedItems.length
  });
});

app.get('/api/items/featured', (req, res) => {
  const featuredItems = items
    .filter(item => item.isApproved && item.status === 'available')
    .slice(0, 6);
  res.json(featuredItems);
});

app.get('/api/items/:id', (req, res) => {
  const item = items.find(item => item.id === req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  res.json(item);
});

app.post('/api/items', auth, (req, res) => {
  const item = {
    id: Date.now().toString(),
    ...req.body,
    owner: req.user.id,
    status: 'pending',
    isApproved: false,
    images: ['placeholder.jpg'], // Simplified for demo
    createdAt: new Date().toISOString()
  };

  items.push(item);
  saveData();

  res.status(201).json(item);
});

app.get('/api/items/user/me', auth, (req, res) => {
  const userItems = items.filter(item => item.owner === req.user.id);
  res.json(userItems);
});

// Swaps routes
app.post('/api/swaps', auth, (req, res) => {
  const swap = {
    id: Date.now().toString(),
    ...req.body,
    requester: req.user.id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  swaps.push(swap);
  saveData();

  res.status(201).json(swap);
});

app.get('/api/swaps/my-requests', auth, (req, res) => {
  const userSwaps = swaps.filter(swap => swap.requester === req.user.id);
  res.json(userSwaps);
});

// Admin routes
app.get('/api/admin/pending-items', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  const pendingItems = items.filter(item => !item.isApproved && item.status === 'pending');
  res.json(pendingItems);
});

app.get('/api/admin/stats', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  res.json({
    totalUsers: users.length,
    totalItems: items.length,
    pendingItems: items.filter(item => !item.isApproved).length,
    activeItems: items.filter(item => item.isApproved && item.status === 'available').length,
    totalSwaps: swaps.length,
    completedSwaps: swaps.filter(swap => swap.status === 'accepted').length
  });
});

app.put('/api/admin/approve-item/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const item = items.find(item => item.id === req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  item.isApproved = true;
  item.status = 'available';
  saveData();

  res.json(item);
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ReWear API is running! (Simple Mode)' });
});

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log('Using in-memory storage with JSON file backup');
}); 