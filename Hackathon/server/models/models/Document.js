const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'txt'],
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  chromaIds: {
    type: [String], // Array of ChromaDB chunk/document IDs
    default: [],
  },
});

module.exports = mongoose.model('Document', DocumentSchema);
