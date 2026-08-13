import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Stack, TextField, Button, Alert, Link, Typography } from '@mui/material';
import { forgotPassword } from '../services/authApi.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setStatus('If that email is registered, a reset link has been sent.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not process the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        <Typography variant="h6" fontWeight={700} textAlign="center">
          Forgot password
        </Typography>
        {status && <Alert severity="success">{status}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          autoFocus
        />
        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
        <Link component={RouterLink} to="/login" textAlign="center" variant="body2">
          Back to sign in
        </Link>
      </Stack>
    </form>
  );
}
