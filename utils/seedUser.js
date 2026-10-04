const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const seedUser = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('[Seed Error] MONGO_URI is not set in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB');

    const defaultUsername = 'admin';
    const defaultPassword = 'AdminPassword@123';
    const defaultRole = 'admin';

    const existingUser = await User.findOne({ username: defaultUsername });

    if (existingUser) {
      console.log(`[Seed] User "${defaultUsername}" already exists in "users" collection. Skipping.`);
    } else {
      const user = await User.create({
        username: defaultUsername,
        password: defaultPassword,
        role: defaultRole
      });
      console.log(`[Seed] Successfully created default user in "users" collection:`);
      console.log(`       ID: ${user._id}`);
      console.log(`       Username: ${user.username}`);
      console.log(`       Role: ${user.role}`);
    }

    await mongoose.connection.close();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedUser();
