const { ChromaClient } = require('chromadb');

const chromaClient = new ChromaClient({ path: 'http://localhost:8000' });

/**
 * Gets an existing collection (never creates).
 * All creation/addition should be done via Python to ensure embedding function consistency.
 */
async function getCompanyCollection(companyName) {
  if (typeof companyName !== 'string' || !companyName.trim()) {
    console.error('[ChromaDB] ERROR: companyName must be a non-empty string. Got:', companyName, 'Type:', typeof companyName);
    throw new TypeError('companyName must be a non-empty string');
  }
  const slug = companyName.trim().toLowerCase().replace(/\s+/g, '-');
  try {
    const collection = await chromaClient.getCollection({ name: slug });
    console.log(`[ChromaDB] Got existing collection: ${slug}`);
    return collection;
  } catch (err) {
    console.error(`[ChromaDB] ERROR: Collection "${slug}" does not exist. Make sure to upload documents first with the Python script.`);
    throw new Error(`ChromaDB collection "${slug}" does not exist.`);
  }
}

/**
 * Query documents for a company using queryTexts (ChromaDB handles embedding)
 */
async function queryCompanyDocuments(companyName, queryText, topK = 5) {
  if (typeof queryText !== 'string' || !queryText.trim()) {
    throw new TypeError('queryText must be a non-empty string');
  }
  console.log(`[ChromaDB] Querying documents for company:`, companyName, 'Type:', typeof companyName);
  const collection = await getCompanyCollection(companyName);
  const allDocs = await collection.get();
  console.log(`[ChromaDB] All docs in "${companyName}" before query:`, allDocs);

  // Use queryTexts, NOT queryEmbeddings!
  const results = await collection.query({
    queryTexts: [queryText],
    nResults: topK
  });
  console.log(`[ChromaDB] Query for "${queryText}" in "${companyName}" returned:`, results);
  return results;
}

/**
 * Utility: List all collections
 */
async function listAllCollections() {
  const collections = await chromaClient.listCollections();
  console.log('[ChromaDB] All collections:', collections);
  return collections;
}

/**
 * Utility: List all documents in a collection
 */
async function listDocumentsInCompany(companyName) {
  if (typeof companyName !== 'string' || !companyName.trim()) {
    console.error('[ChromaDB] ERROR: companyName must be a non-empty string for listing documents. Got:', companyName, 'Type:', typeof companyName);
    throw new TypeError('companyName must be a non-empty string');
  }
  const slug = companyName.trim().toLowerCase().replace(/\s+/g, '-');
  const collection = await chromaClient.getCollection({ name: slug });
  const docs = await collection.get();
  console.log(`[ChromaDB] All docs in "${companyName}":`, docs);
  return docs;
}

module.exports = {
  queryCompanyDocuments,
  listAllCollections,
  listDocumentsInCompany,
};
