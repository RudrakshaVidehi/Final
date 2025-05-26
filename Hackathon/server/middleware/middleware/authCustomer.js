const jwt = require('jsonwebtoken');

function authCustomer(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH CUSTOMER] No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customer = decoded;
    console.log(`[AUTH CUSTOMER] Authenticated customer: ${decoded.email}`);
    next();
  } catch (err) {
    console.error('[AUTH CUSTOMER] Invalid token:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authCustomer;
