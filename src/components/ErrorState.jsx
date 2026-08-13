import { Box, Typography, Button, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function ErrorState({ message, onRetry }) {
  return (
    <Box sx={{ py: 4 }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={onRetry}>
              Retry
            </Button>
          ) : null
        }
      >
        <Typography variant="body2">
          {message || 'Something went wrong while talking to the server. The backend may be offline.'}
        </Typography>
      </Alert>
    </Box>
  );
}
