## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Python 3 (for ChromaDB processing)
- Docker (for ChromaDB and/or full stack setup)
- MongoDB Atlas account (or local MongoDB for development)
- Google Gemini API Key

---

## 1. Clone the Repository

## 2. Environment Variables

### **Backend (`server/.env`):**

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CHROMA_HOST=http://localhost:8000
NODE_ENV=development
PORT=5000

### **Frontend (`my-app/.env`):**

REACT_APP_API_BASE_URL=http://localhost:5000

text

---

## 3. Install Dependencies

## 4. Running ChromaDB with Docker

You must run ChromaDB as a Docker container on port 8000 before using document processing features.

docker run -d -p 8000:8000 ghcr.io/chroma-core/chroma:latest

text

- This command pulls the ChromaDB image and runs it on port 8000.
- Ensure `CHROMA_HOST` in your backend `.env` is set to `http://localhost:8000`.
## 5. Running Locally

### **Backend**

cd server
node server.js


### **Frontend**

cd my-app
npm start

---

## 8. Python Requirements

Install Python dependencies for ChromaDB processing:

pip install -r requirements.txt


## 9. API Endpoints

- `POST /api/companies/register` — Register company
- `POST /api/companies/login` — Login company
- `POST /api/companies/upload` — Upload document (auth required)
- `GET /api/companies/documents` — List documents (auth required)
- `DELETE /api/companies/documents/:id` — Delete document (auth required)
- `POST /api/chat` — Customer chatbot query

---

## 10. Troubleshooting

- Ensure all required env variables are set
- Check backend logs for errors
- For CORS issues, set allowed origins in backend
- Ensure ChromaDB is running and accessible at port 8000

Backend requirements.txt (for reference)

express
mongoose
bcryptjs
jsonwebtoken
cors
dotenv
morgan
helmet
express-rate-limit
multer
child_process
fs
Install with:
cd server && npm install

Frontend requirements.txt (for reference)

react
react-dom
react-router-dom
@mui/material
@emotion/react
@emotion/styled
axios
Install with:
cd my-app && npm install

Python requirements.txt (for ChromaDB processing)
chromadb
pypdf
gemini generative ai
PyPDF2



