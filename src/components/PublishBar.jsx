import { Alert, Box, Button, Stack, Typography } from '@mui/material';
export default function PublishBar({ dirty, saving, onSave, message }) {
  const failed = message?.startsWith('error:');
  return <Box sx={{ position: 'sticky', top: 64, zIndex: 10, bgcolor: 'background.paper', border: '1px solid', borderColor: dirty ? 'warning.main' : 'divider', borderRadius: 2, p: 2, mb: 3, boxShadow: 2 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
      <Box><Typography fontWeight={700}>{saving ? 'Publishing…' : dirty ? 'You have unpublished changes' : 'All changes published'}</Typography><Typography variant="body2" color="text.secondary">1. Edit text or images → 2. Publish changes → 3. View website</Typography></Box>
      <Stack direction="row" gap={1}>
        <Button variant="outlined" component="a" href={import.meta.env.VITE_WEBSITE_URL || 'https://crystal-cotting.vercel.app'} target="_blank" rel="noreferrer">View website</Button>
        <Button variant="contained" onClick={onSave} disabled={saving || !dirty}>{saving ? 'Publishing…' : 'Publish changes'}</Button>
      </Stack>
    </Stack>
    {message && (!dirty || failed) && <Alert severity={failed ? 'error' : 'success'} sx={{ mt: 1 }}>{failed ? message.slice(6) : 'Published successfully. Open or refresh the website to see your changes.'}</Alert>}
  </Box>;
}
