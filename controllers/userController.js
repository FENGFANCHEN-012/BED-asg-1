//Hash Passwords on Sign Up//
const bcrypt = require('bcrypt');
const { createUser } = require('../models/userModel');

async function signUp(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await createUser(email, passwordHash);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    if (err.originalError?.info?.number === 2627) {
      // Unique constraint violation
      res.status(409).json({ error: 'Email already exists' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
}

//Add Login Function (and Compare Passwords)//
const jwt = require('jsonwebtoken');
const { getUserByEmail } = require('models/userModel'); 

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { signUp };