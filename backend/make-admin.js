const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

async function makeAdmin(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user by email and update role to admin
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`✅ Successfully made ${user.name} (${user.email}) an admin!`);
      console.log('You can now login and access the admin panel at /admin');
    } else {
      console.log(`❌ User with email "${email}" not found`);
      console.log('Please make sure the email is correct and the user exists');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node make-admin.js <email>');
  console.log('Example: node make-admin.js user@example.com');
  process.exit(1);
}

makeAdmin(email); 