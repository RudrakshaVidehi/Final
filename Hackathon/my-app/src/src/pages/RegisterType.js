// src/pages/RegisterType.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Paper, Box } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

const RegisterType = () => (
  <Box
    minHeight="100vh"
    display="flex"
    alignItems="center"
    justifyContent="center"
    bgcolor="#f3f6fb"
  >
    <Paper elevation={6} sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
      <Typography variant="h4" gutterBottom>
        Choose Registration Type
      </Typography>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} justifyContent="center" mt={3}>
        <Link to="/company/register" style={{ textDecoration: 'none' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<BusinessIcon />}
            sx={{ minWidth: 180 }}
          >
            Company Register
          </Button>
        </Link>
        <Link to="/customer/register" style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<PersonIcon />}
            sx={{ minWidth: 180 }}
          >
            Customer Register
          </Button>
        </Link>
      </Box>
    </Paper>
  </Box>
);

export default RegisterType;
