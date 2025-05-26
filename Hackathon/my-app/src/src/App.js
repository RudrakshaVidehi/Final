import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import Home from './pages/Home';
import CompanyLogin from './pages/CompanyLogin';
import CustomerLogin from './pages/CustomerLogin';
import CompanyRegister from './pages/CompanyRegister';
import CustomerRegister from './pages/CustomerRegister';
import CompanyDashboard from './pages/CompanyDashboard';
import CustomerAssist from './pages/CustomerAssist';
import RegisterType from './pages/RegisterType';

const theme = createTheme({
  palette: {
    primary: { main: '#7f5af0' },
    secondary: { main: '#2cb67d' },
    background: { default: '#f7f7fb' },
    text: { primary: '#22223b', secondary: '#4a4e69' }
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica Neue, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 700 }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterType />} />
        <Route path="/company/login" element={<CompanyLogin />} />
        <Route path="/company/register" element={<CompanyRegister />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/customer/assist" element={<CustomerAssist />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
