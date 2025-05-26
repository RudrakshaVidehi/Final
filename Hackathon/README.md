🚀 Features
For Companies
Company Registration & Login: Secure onboarding and authentication.

Company Dashboard:
View company profile (name only for privacy).
Upload PDF/TXT documents.
View, manage, and delete uploaded documents.
Modern sliding sidebar for document management.
Logout functionality.

For Customers
Customer Registration & Login: Secure access for customers.

Customer Dashboard:
Welcome page for assistance.
(Future) Chatbot and support tools.

General
Modern UI: Responsive, professional design using Material UI and custom theming.

Authentication: JWT-based for both company and customer users.

API: RESTful backend with Express.js.

Persistent Storage: MongoDB for user and document data.

Vector Storage: ChromaDB for advanced document/vector storage (Dockerized).

🛠️ Tech Stack
Frontend: React, React Router, Material UI (MUI)

Backend: Node.js, Express.js, MongoDB, JWT

Vector DB: ChromaDB (Docker)

HTTP Client: Axios

Styling: MUI Theme, Inter font, custom CSS

⚡ Quick Start
1. Clone the Repository

2. Install Frontend Dependencies
bash
npm install
3. Start the Frontend
bash
npm start
App runs at http://localhost:3000

4. Backend Setup
Ensure you have Node.js and MongoDB installed.

Set up your backend in a separate folder (e.g., backend/).

Install backend dependencies:

bash
npm install
Create a .env file for environment variables (MongoDB URI, JWT secret, etc.).

Start the backend server:

bash
npm start
Backend runs at http://localhost:5000

5. ChromaDB (Vector DB) Setup
Make sure you have Docker installed.

Run ChromaDB on port 8000:

bash
docker run -d --rm --name chromadb -p 8000:8000 \
  -v ./chroma:/chroma/chroma \
  -e IS_PERSISTENT=TRUE \
  -e ANONYMIZED_TELEMETRY=FALSE \
  chromadb/chroma:latest
ChromaDB will be accessible at http://localhost:8000

🧑‍💻 Usage
Register as a company or customer.

Login to access your dashboard.

Company Dashboard: Upload, view, and delete documents via the sidebar. Logout when done.

Customer Dashboard: Access assistance tools (future: chatbot, support).

📝 Customization
Theme: Modify colors and fonts in App.js (createTheme).

Sidebar/Drawer: Customize document management UI in CompanyDashboard.js.

API URLs: Change backend or ChromaDB URLs in API calls as needed.

🛡️ Security
All sensitive routes are JWT-protected.

Passwords are hashed with bcrypt.

Tokens are stored in localStorage (for demo—consider HTTP-only cookies for production).

🧩 Dependencies
@mui/material, @mui/icons-material, @emotion/react, @emotion/styled

react-router-dom, axios

Backend: express, mongoose, jsonwebtoken, bcryptjs

ChromaDB: Dockerized service

