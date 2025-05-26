import sys
import json
import uuid
import traceback
import os
from PyPDF2 import PdfReader
from chromadb import HttpClient
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from langchain.text_splitter import RecursiveCharacterTextSplitter

def process_file(file_path, company_name, company_id):
    # Validate file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    # Read file content
    if file_path.endswith('.pdf'):
        reader = PdfReader(file_path)
        text = "\n".join([page.extract_text() for page in reader.pages])
    else:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

    # Split text into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_text(text)

    # Connect to ChromaDB with validation
    client = HttpClient(host="localhost", port=8000)
    try:
        client.heartbeat()  # Check connection
    except Exception as e:
        raise ConnectionError(f"Failed to connect to ChromaDB: {str(e)}")

    collection_name = company_name.lower().replace(" ", "-")

    # Delete old collection to avoid embedding mismatch
    try:
        client.delete_collection(collection_name)
        print(f"[Python] Deleted old collection '{collection_name}'", file=sys.stderr)
    except Exception as e:
        print(f"[Python] No existing collection to delete: {e}", file=sys.stderr)

    # Create collection with embedding function
    ef = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    collection = client.get_or_create_collection(
        name=collection_name,
        embedding_function=ef
    )

    # Generate document IDs
    doc_ids = [f"{company_id}-{str(uuid.uuid4())}" for _ in chunks]

    # Add to ChromaDB in batches
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch_chunks = chunks[i:i+batch_size]
        batch_ids = doc_ids[i:i+batch_size]
        collection.add(documents=batch_chunks, ids=batch_ids)
        print(f"[Python] Added batch {i//batch_size + 1}", file=sys.stderr)

    return doc_ids

if __name__ == "__main__":
    try:
        file_path = sys.argv[1]
        company_name = sys.argv[2]
        company_id = sys.argv[3]
        ids = process_file(file_path, company_name, company_id)
        print(json.dumps(ids))
    except Exception as e:
        traceback.print_exc()
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
