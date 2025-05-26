import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Button, Box, Drawer, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Divider, Alert, CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api/companies';

const CompanyDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(true);
  const navigate = useNavigate();

  // Fetch company profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('companyToken');
        const res = await axios.get(`${API}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  // Fetch documents
  useEffect(() => {
    const fetchDocs = async () => {
      setLoadingDocs(true);
      try {
        const token = localStorage.getItem('companyToken');
        const res = await axios.get(`${API}/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocuments(res.data);
      } catch (err) {
        setError('Failed to load documents');
      }
      setLoadingDocs(false);
    };
    fetchDocs();
  }, [message]);

  // Handle file upload
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setMessage('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const token = localStorage.getItem('companyToken');
      const res = await axios.post(`${API}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(res.data.message || 'File uploaded successfully');
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'File upload failed');
    }
    setUploading(false);
  };

  // Handle document delete
  const handleDelete = async (docId) => {
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('companyToken');
      await axios.delete(`${API}/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Document deleted');
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('companyToken');
    navigate('/company/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            background: 'rgba(255,255,255,0.98)',
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)',
            borderRight: '1px solid #e0e0e0',
            p: 2
          }
        }}
      >
        <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
          Manage Documents
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {loadingDocs ? (
          <CircularProgress sx={{ mt: 2 }} />
        ) : (
          <List>
            {documents.length === 0 && (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No documents uploaded yet.
              </Typography>
            )}
            {documents.map((doc) => (
              <ListItem key={doc._id} divider>
                <ListItemText
                  primary={doc.fileName}
                  secondary={`Type: ${doc.fileType} | Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    color="error"
                    onClick={() => handleDelete(doc._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 10, mb: 6, flex: 1 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.92)',
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.22)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.18)',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          {/* Sidebar Toggle */}
          <IconButton
            color="primary"
            sx={{ position: 'absolute', left: 16, top: 16 }}
            onClick={() => setSidebarOpen(true)}
            size="large"
          >
            <MenuIcon fontSize="large" />
          </IconButton>

          {/* Logout Button */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            sx={{ position: 'absolute', right: 16, top: 16, fontWeight: 'bold', borderRadius: 3 }}
            onClick={handleLogout}
          >
            Logout
          </Button>

          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Company Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Welcome! Manage your company profile and documents with ease.
          </Typography>

          {profile && (
            <Box sx={{ mb: 4, textAlign: 'left' }}>
              <Typography variant="h6" color="secondary" gutterBottom>
                Profile
              </Typography>
              <Typography><b>Name:</b> {profile.name}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="secondary" gutterBottom>
              Upload Document
            </Typography>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              style={{ marginBottom: 12 }}
              id="upload-input"
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadFileIcon />}
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              sx={{ ml: 2, fontWeight: 'bold', borderRadius: 3 }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </Box>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" color="secondary" gutterBottom>
              Quick Actions
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2, fontWeight: 'bold', borderRadius: 3 }}
              onClick={() => setSidebarOpen(true)}
              startIcon={<MenuIcon />}
            >
              Manage &amp; Delete Documents
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CompanyDashboard;
