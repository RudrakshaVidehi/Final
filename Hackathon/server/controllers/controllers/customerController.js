const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Customer
exports.registerCustomer = async (req, res) => {
  const { name, email, password } = req.body;
  console.log('[CUSTOMER REGISTER] Request body:', req.body);

  if (!name || !email || !password) {
    console.log('[CUSTOMER REGISTER] Missing fields:', { name, email });
    return res.status(400).json({ error: 'All fields (name, email, password) are required' });
  }

  try {
    const existing = await Customer.findOne({ email });
    if (existing) {
      console.log('[CUSTOMER REGISTER] Duplicate email:', email);
      return res.status(400).json({ error: 'Customer already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = new Customer({ name, email, password: hashedPassword });
    await newCustomer.save();
    console.log('[CUSTOMER REGISTER] Customer registered:', email);
    res.status(201).json({ message: 'Customer registered successfully' });
  } catch (err) {
    console.error('[CUSTOMER REGISTER] Error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

// Login Customer
exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;
  console.log('[CUSTOMER LOGIN] Request body:', req.body);

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      console.log('[CUSTOMER LOGIN] Invalid email:', email);
      return res.status(400).json({ error: 'Email not found' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      console.log('[CUSTOMER LOGIN] Invalid password for:', email);
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: customer._id, email: customer.email, name: customer.name, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('[CUSTOMER LOGIN] Login successful:', email);
    res.status(200).json({
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
      role: 'customer'
    });
  } catch (err) {
    console.error('[CUSTOMER LOGIN] Error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

// Get customer profile (protected)
exports.getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id).select('-password');
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error('[CUSTOMER PROFILE] Error:', err);
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
};
