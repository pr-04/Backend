
// JWT Authentication for Secure Banking API Endpoints

const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = 3000;
const SECRET_KEY = 'myjwtsecret';

let user = { username: 'user1', password: 'password123' };
let balance = 1000;

// --- Login Route ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === user.username && password === user.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// --- Middleware to verify JWT ---
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'Token missing or invalid' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = userData;
    next();
  });
}

// --- Protected Routes ---

// Get balance
app.get('/balance', authenticateJWT, (req, res) => {
  res.json({ balance });
});

// Deposit amount
app.post('/deposit', authenticateJWT, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid deposit amount' });
  balance += amount;
  res.json({ message: `Deposited $${amount}`, newBalance: balance });
});

// Withdraw amount
app.post('/withdraw', authenticateJWT, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid withdrawal amount' });
  if (amount > balance) return res.status(400).json({ message: 'Insufficient funds' });
  balance -= amount;
  res.json({ message: `Withdrew $${amount}`, newBalance: balance });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
