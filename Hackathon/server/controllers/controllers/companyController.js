const Company = require('../models/Company');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginCompany = async (req, res) => {
  const { email, password } = req.body;
  console.log('[LOGIN] Request received. Body:', req.body);

  try {
    const company = await Company.findOne({ email });
    if (!company) {
      console.log('[LOGIN] Invalid email:', email);
      return res.status(400).json({ error: 'Email not found' });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      console.log('[LOGIN] Invalid password for:', email);
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: company._id, email: company.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('[LOGIN] Login successful:', email);
    res.status(200).json({
      token,
      company: { id: company._id, name: company.name, email: company.email },
    });
  } catch (err) {
    console.error('[LOGIN] Error occurred:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};
