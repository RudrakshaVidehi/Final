import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import Chatbot from '../components/Chatbot'; // Adjust path if needed

const CustomerAssist = () => (
  <Container maxWidth="sm" sx={{ mt: 10 }}>
    <Paper
      elevation={6}
      sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 4,
        background: 'rgba(255,255,255,0.85)',
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.18)'
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Customer Assistance
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
        Welcome! Ask any question about a company's services or documents.
      </Typography>
      {/* Chatbot Integration - company name is now prompted inside Chatbot */}
      <Chatbot />
    </Paper>
  </Container>
);

export default CustomerAssist;
