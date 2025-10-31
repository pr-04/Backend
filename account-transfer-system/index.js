
// Account Transfer System with Balance Validation in Node.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = 3000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/bankDB';

// --- MongoDB Connection ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- User Schema ---
const userSchema = new mongoose.Schema({
  name: String,
  balance: Number
});

const User = mongoose.model('User', userSchema);

// --- Route to create sample users ---
app.post('/create-users', async (req, res) => {
  await User.deleteMany({});
  const users = await User.insertMany([
    { name: 'Alice', balance: 1000 },
    { name: 'Bob', balance: 500 }
  ]);
  res.status(201).json({ message: 'Users created', users });
});

// --- Route to transfer money ---
app.post('/transfer', async (req, res) => {
  try {
    const { fromUserId, toUserId, amount } = req.body;

    // Validate request data
    if (!fromUserId || !toUserId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid transfer details' });
    }

    const sender = await User.findById(fromUserId);
    const receiver = await User.findById(toUserId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }

    // Check sender balance
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Perform logical updates
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.json({
      message: `Transferred $${amount} from ${sender.name} to ${receiver.name}`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
