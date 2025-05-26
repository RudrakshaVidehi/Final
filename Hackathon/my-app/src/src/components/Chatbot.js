import React, { useState } from 'react';
import { Paper, Box, Typography, TextField, Button, Avatar, CircularProgress, Divider } from '@mui/material';
import axios from 'axios';

export default function Chatbot({ botName = "Helix Assistant", botAvatar }) {
  const [step, setStep] = useState(0); // 0: ask company, 1: ask question, 2: show answer
  const [companyName, setCompanyName] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCompanySubmit = (e) => {
    e.preventDefault();
    if (companyName.trim()) setStep(1);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const res = await axios.post('/api/chat', { companyName, question });
      setAnswer(res.data.answer);
      setStep(2);
    } catch {
      setAnswer('Sorry, something went wrong.');
      setStep(2);
    }
    setLoading(false);
  };

  const handleRestart = () => {
    setStep(0);
    setCompanyName('');
    setQuestion('');
    setAnswer('');
  };

  return (
    <Paper elevation={8} sx={{ borderRadius: 4, overflow: 'hidden', width: 370, maxWidth: '100%', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', p: 2 }}>
        <Avatar src={botAvatar} />
        <Typography variant="h6" sx={{ ml: 2 }}>{botName}</Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 3 }}>
        {step === 0 && (
          <form onSubmit={handleCompanySubmit}>
            <Typography sx={{ mb: 2 }}>Hello! Please enter your company name to continue:</Typography>
            <TextField
              fullWidth
              label="Company Name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth>
              Continue
            </Button>
          </form>
        )}
        {step === 1 && (
          <form onSubmit={handleQuestionSubmit}>
            <Typography sx={{ mb: 2 }}>
              Thank you! Now, what's your question for <b>{companyName}</b>?
            </Typography>
            <TextField
              fullWidth
              label="Your Question"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }} fullWidth disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Ask"}
            </Button>
          </form>
        )}
        {step === 2 && (
          <Box>
            <Typography sx={{ mb: 2 }}>
              <b>Bot:</b> {loading ? <CircularProgress size={20} /> : answer}
            </Typography>
            <Button variant="outlined" sx={{ mt: 1 }} onClick={handleRestart} fullWidth>
              Ask Another Question
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
