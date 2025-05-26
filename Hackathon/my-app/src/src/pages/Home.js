import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Container, Paper, Typography, Box } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

const Home = () => (
  <Container
    maxWidth="sm"
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Paper
      elevation={8}
      sx={{
        p: 6,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.22)',
        backdropFilter: 'blur(8px)',
        textAlign: 'center',
        width: '100%',
        maxWidth: 480,
      }}
    >
      <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
        Welcome to Support Portal
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: 18 }}>
        Access your dashboard or register to get started.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 2 }}>
        <Button
          component={RouterLink}
          to="/company/login"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<BusinessIcon />}
          sx={{
            flex: 1,
            fontWeight: 700,
            borderRadius: 3,
            boxShadow: 2,
            transition: 'box-shadow 0.3s',
            '&:hover': { boxShadow: 6 },
          }}
        >
          Company Login
        </Button>
        <Button
          component={RouterLink}
          to="/customer/login"
          variant="outlined"
          color="secondary"
          size="large"
          startIcon={<PersonIcon />}
          sx={{
            flex: 1,
            fontWeight: 700,
            borderRadius: 3,
            boxShadow: 2,
            transition: 'box-shadow 0.3s',
            '&:hover': { boxShadow: 6 },
          }}
        >
          Customer Login
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        Don’t have an account?{' '}
        <Button
          component={RouterLink}
          to="/register"
          color="primary"
          sx={{ textTransform: 'none', fontWeight: 700, px: 0.5 }}
        >
          Register here
        </Button>
      </Typography>
    </Paper>
  </Container>
);

export default Home;
