const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const path = require('path');
const { splitText } = require('../utils/textSplitter');
const chroma = require('../services/chromaClient');
const Document = require('../models/Document');

const handleUpload = async (req, res) => {
  let filePath;
  try {
    if (!req.file) {
      console.log('[UPLOAD] No file uploaded.');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { id: companyId, name: companyName } = req.company;
    filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileType = req.file.mimetype;

    console.log(`[UPLOAD] File received: ${originalName} (type: ${fileType}) for company: "${companyName}"`);

    if (!['application/pdf', 'text/plain'].includes(fileType)) {
      await fs.unlink(filePath);
      console.log('[UPLOAD] Unsupported file type:', fileType);
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    let text;
    if (fileType === 'application/pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const parsed = await pdfParse(dataBuffer);
      text = parsed.text;
      console.log(`[UPLOAD] Extracted text from PDF (length: ${text.length})`);
    } else {
      text = await fs.readFile(filePath, 'utf-8');
      console.log(`[UPLOAD] Extracted text from TXT (length: ${text.length})`);
    }

    const chunks = splitText(text);
    console.log(`[UPLOAD] Split text into ${chunks.length} chunk(s).`);
    if (chunks.length > 0) {
      console.log('[UPLOAD] First chunk preview:', chunks[0].slice(0, 100));
    }

    const documents = chunks.map((content, index) => ({
      id: `${companyId}-${Date.now()}-${index}`,
      content
    }));

    await chroma.addDocumentsToCompany(companyName, documents);
    console.log(`[UPLOAD] Added ${documents.length} documents to ChromaDB for "${companyName}".`);

    if (typeof chroma.listDocumentsInCompany === 'function') {
      await chroma.listDocumentsInCompany(companyName);
    }

    const document = new Document({
      companyId,
      fileName: originalName,
      filePath,
      fileType: fileType.split('/').pop()
    });
    await document.save();
    console.log('[UPLOAD] Metadata saved to MongoDB:', document._id);

    await fs.unlink(filePath);
    console.log('[UPLOAD] Temporary file deleted:', filePath);

    return res.status(200).json({
      message: 'File processed successfully',
      document: {
        id: document._id,
        fileName: document.fileName,
        fileType: document.fileType,
        uploadedAt: document.uploadedAt
      }
    });

  } catch (error) {
    if (filePath) await fs.unlink(filePath).catch(() => {});
    console.error('[Upload Error]', error);
    return res.status(500).json({ 
      error: 'File processing failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

module.exports = { handleUpload };
