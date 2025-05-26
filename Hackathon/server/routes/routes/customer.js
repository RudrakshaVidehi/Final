const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const authCustomer = require('../middleware/authCustomer');

const router = express.Router();

// Register Customer
router.post('/register', async (req, res) => {
  console.log('[CUSTOMER REGISTER] Endpoint hit');
  console.log('[CUSTOMER REGISTER] Request body:', req.body);

  // Accept both 'name' and 'fullName' for compatibility
  const name = req.body.name || req.body.fullName;
  const { email, password } = req.body;
  try {
    if (!name || !email || !password) {
      console.log('[CUSTOMER REGISTER] Missing fields');
      return res.status(400).json({ 
        error: 'All fields (name, email, password) are required',
        details: 'Missing required registration fields'
      });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      console.log('[CUSTOMER REGISTER] Duplicate email:', email);
      return res.status(400).json({ 
        error: 'Customer already registered',
        details: 'Email already exists in database'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = new Customer({ name, email, password: hashedPassword });
    await newCustomer.save();

    console.log('[CUSTOMER REGISTER] New customer created:', email);
    res.status(201).json({ 
      message: 'Customer registered successfully',
      customer: { id: newCustomer._id, name: newCustomer.name }
    });
  } catch (err) {
    console.error('[CUSTOMER REGISTER] Database error:', err.message);
    res.status(500).json({ 
      error: 'Registration failed',
      details: err.message
    });
  }
});

// Login Customer
router.post('/login', async (req, res) => {
  console.log('[CUSTOMER LOGIN] Endpoint hit');
  console.log('[CUSTOMER LOGIN] Request body:', req.body);

  const { email, password } = req.body;
  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      console.log('[CUSTOMER LOGIN] Email not found:', email);
      return res.status(400).json({ 
        error: 'Email not found',
        details: 'No account exists with this email'
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      console.log('[CUSTOMER LOGIN] Invalid password for:', email);
      return res.status(400).json({ 
        error: 'Incorrect password',
        details: 'Password does not match our records'
      });
    }

    const token = jwt.sign(
      { 
        id: customer._id,
        email: customer.email,
        name: customer.name,
        role: 'customer'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('[CUSTOMER LOGIN] Successful login:', email);
    res.status(200).json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email
      }
    });
  } catch (err) {
    console.error('[CUSTOMER LOGIN] Server error:', err.message);
    res.status(500).json({ 
      error: 'Login failed', 
      details: err.message 
    });
  }
});

// Get customer profile (protected)
router.get('/profile', authCustomer, async (req, res) => {
  console.log('[CUSTOMER PROFILE] Endpoint hit for:', req.customer.email);

  try {
    const customer = await Customer.findById(req.customer.id)
      .select('-password')
      .lean();

    if (!customer) {
      console.log('[CUSTOMER PROFILE] Not found:', req.customer.id);
      return res.status(404).json({ 
        error: 'Customer not found',
        details: 'User account may have been removed'
      });
    }

    res.json(customer);
  } catch (err) {
    console.error('[CUSTOMER PROFILE] Database error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: err.message
    });
  }
});

module.exports = router;
