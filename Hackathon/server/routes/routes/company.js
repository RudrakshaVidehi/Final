const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { execSync } = require('child_process');

const Company = require('../models/Company');
const Document = require('../models/Document');
const authCompany = require('../middleware/authCompany');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (['application/pdf', 'text/plain'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF/TXT files allowed!'));
    }
  }
});

// Company Registration (accepts both 'name' and 'companyName', with logs)
router.post('/register', async (req, res) => {
  console.log('[REGISTER] Request received. Body:', req.body);

  // Accept either 'name' or 'companyName'
  const name = (req.body.name || req.body.companyName || '').trim();
  const email = req.body.email && req.body.email.trim();
  const password = req.body.password;

  console.log('[REGISTER] Processed fields:', { name, email, password });

  if (!name || !email || !password) {
    console.error('[REGISTER] Validation failed. Missing fields:',
      !name ? 'name ' : '',
      !email ? 'email ' : '',
      !password ? 'password' : ''
    );
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    console.log('[REGISTER] Checking for existing company with email:', email);
    const existingCompany = await Company.findOne({ email });

    if (existingCompany) {
      console.error('[REGISTER] Conflict - Company already exists:', email);
      return res.status(400).json({ error: 'Company already exists' });
    }

    console.log('[REGISTER] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('[REGISTER] Creating new company:', { name, email });
    await new Company({
      name,
      email,
      password: hashedPassword
    }).save();

    console.log('[REGISTER] Success:', email);
    res.status(201).json({ message: 'Registration successful' });

  } catch (err) {
    console.error('[REGISTER] Error:', err.message);
    console.error(err.stack);

    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Registration failed: ${err.message}`
      : 'Registration failed';

    res.status(500).json({ error: errorMessage });
  }
});

// Company Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email });

    if (!company || !(await bcrypt.compare(password, company.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: company._id, email, name: company.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      company: { id: company._id, name: company.name, email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get company profile
router.get('/profile', authCompany, async (req, res) => {
  try {
    const company = await Company.findById(req.company.id).select('-password');
    company ? res.json(company) : res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: 'Profile fetch failed' });
  }
});

// File upload endpoint
router.post('/upload', authCompany, upload.single('file'), async (req, res) => {
  let filePath;
  try {
    const { id: companyId, name: companyName } = req.company;
    filePath = req.file.path;
    const originalName = req.file.originalname;
    let fileType = req.file.mimetype.split('/').pop();
    if (fileType === 'plain') fileType = 'txt'; // Fix for schema

    // Call Python processor with error handling
    let result;
    try {
      result = execSync(
        `python3 chroma_processor.py "${filePath}" "${companyName}" "${companyId}"`
      ).toString().trim();
      console.log('[UPLOAD] Raw Python output:', result);
    } catch (pythonError) {
      console.error('[UPLOAD] Python script execution failed:', pythonError.message);
      throw new Error('Document processing failed');
    }

    if (!result) {
      console.error('[UPLOAD] Python script returned empty output');
      throw new Error('No data received from document processor');
    }

    // Parse Python output with validation
    let chromaIds;
    try {
      chromaIds = JSON.parse(result);
    } catch (parseError) {
      console.error('[UPLOAD] Failed to parse Python output:', result);
      throw new Error('Invalid response from document processor');
    }

    if (chromaIds.error) {
      console.error('[UPLOAD] Python script reported error:', chromaIds.error);
      throw new Error(chromaIds.error);
    }

    // Validate Chroma IDs
    if (!Array.isArray(chromaIds) || !chromaIds.every(id => typeof id === 'string')) {
      console.error('[UPLOAD] Invalid Chroma IDs format:', chromaIds);
      throw new Error('Invalid document processing results');
    }

    // Save document metadata
    const document = await new Document({
      companyId,
      fileName: originalName,
      fileType, // now always 'pdf' or 'txt'
      chromaIds
    }).save();

    // Cleanup uploaded file
    await fs.unlink(filePath);
    console.log(`[UPLOAD] Successfully processed file: ${originalName}`);

    res.status(200).json({
      message: 'File processed successfully',
      document: {
        id: document._id,
        fileName: document.fileName,
        fileType: document.fileType,
        uploadedAt: document.uploadedAt
      }
    });

  } catch (error) {
    // Cleanup on error
    if (filePath) {
      await fs.unlink(filePath).catch(err =>
        console.error('[UPLOAD] Cleanup error:', err.message)
      );
    }

    console.error('[UPLOAD] Processing error:', error.message);
    res.status(500).json({
      error: process.env.NODE_ENV === 'development'
        ? error.message
        : 'File processing failed. Please try again.'
    });
  }
});

// Document management endpoints
router.get('/documents', authCompany, async (req, res) => {
  try {
    const documents = await Document.find({ companyId: req.company.id })
      .sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.delete('/documents/:id', authCompany, async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({
      _id: req.params.id,
      companyId: req.company.id
    });

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Get company name for ChromaDB
    const company = await Company.findById(req.company.id);
    if (company?.name && doc.chromaIds?.length) {
      await require('../services/chromaClient')
        .deleteDocumentsFromCompany(company.name, doc.chromaIds);
      console.log(`[DELETE] Removed ${doc.chromaIds.length} chunks from ChromaDB`);
    }

    res.json({ message: 'Document deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

module.exports = router;
