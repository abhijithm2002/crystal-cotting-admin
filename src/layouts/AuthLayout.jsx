import { Outlet } from 'react-router-dom';
import { Box, Paper, Stack, Typography, Avatar } from '@mui/material';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #123262 0%, #1e4d8b 55%, #4a75b3 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
        }}
      >
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 52, height: 52 }}>
            <FormatPaintIcon sx={{ color: 'primary.dark' }} />
          </Avatar>
          <Typography variant="h5" fontWeight={700}>
            Crystal Coat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin Dashboard
          </Typography>
        </Stack>
        <Outlet />
      </Paper>
    </Box>
  );
}
