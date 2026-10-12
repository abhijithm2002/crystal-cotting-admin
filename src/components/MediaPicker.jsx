import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Card, CardActionArea, CardMedia, Typography, TextField, CircularProgress, Stack, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { getMediaList, uploadMedia, verifyMediaImage } from '../services/mediaApi.js';
import { resolveMediaUrl } from '../services/api.js';
import { normalizeMediaResponse } from '../utils/mediaResponse.js';

export default function MediaPicker({ label = 'Image', value, onChange, category }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [value]);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMediaList();
      setItems(normalizeMediaResponse(res.data));
    } catch (err) { setError(err.message || 'Could not load saved images. Try again.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (open) loadLibrary(); }, [open, loadLibrary]);

  async function handleUpload(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadMedia(file, category);
      const image = normalizeMediaResponse(res.data)[0];
      if (!image) throw new Error('No image was returned. Please try again.');
      onChange(image.url);
      setBroken(false);
    } catch (err) { setError(err?.response?.data?.message || err.message || 'Could not upload the image. Please try again.'); }
    finally { setUploading(false); input.value = ''; }
  }

  return (
    <Box role="group" aria-label={`${label} editor`} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, height: '100%' }}>
      <Typography fontWeight={700} sx={{ mb: 1.5 }}>{label}</Typography>
      {value && !broken ? (
        <Box component="img" src={resolveMediaUrl(value)} alt={label} onError={() => setBroken(true)} sx={{ width: '100%', height: 160, objectFit: 'contain', bgcolor: 'grey.100', borderRadius: 1, mb: 1.5 }} />
      ) : (
        <Box sx={{ height: 110, display: 'grid', placeItems: 'center', bgcolor: 'grey.100', borderRadius: 1, mb: 1.5, px: 2 }}>
          <Typography variant="body2" color={broken ? 'error' : 'text.secondary'}>{broken ? 'This image is missing. Upload a replacement below.' : 'No image selected'}</Typography>
        </Box>
      )}
      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button component="label" variant="contained" startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />} disabled={uploading}>
          {uploading ? 'Uploading and checking…' : 'Upload image'}
          <input aria-label={`Upload ${label}`} type="file" hidden accept=".jpg,.jpeg,.png,.webp,.svg" onChange={handleUpload} />
        </Button>
        <Button startIcon={<PhotoLibraryIcon />} onClick={() => setOpen(true)} disabled={uploading}>Saved images</Button>
        {value && <Button color="error" onClick={() => onChange('')} disabled={uploading}>Remove</Button>}
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>JPG, PNG, WebP or SVG · up to 20 MB. Choose an image, then publish the page.</Typography>
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Choose a saved image</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Click an image to use it on this page. Images from all sections are shown.</Typography>
          <TextField fullWidth label="Search images" value={search} onChange={e => setSearch(e.target.value)} sx={{ mb: 2 }} />
          {loading ? <CircularProgress /> : <Grid container spacing={2}>
            {items.filter(item => (item.originalName || '').toLowerCase().includes(search.toLowerCase())).map(item => <Grid item xs={6} sm={4} key={item._id || item.url}>
              <Card variant="outlined"><CardActionArea onClick={async () => { setError(''); try { await verifyMediaImage(item.url); onChange(item.url); setOpen(false); } catch (err) { setError(err.message); } }}>
                <CardMedia component="img" image={resolveMediaUrl(item.thumbnailUrl || item.url)} alt={item.originalName || 'Saved image'} sx={{ height: 130, objectFit: 'cover' }} />
                <Typography noWrap variant="caption" sx={{ display: 'block', p: 1 }}>{item.originalName || 'Use this image'}</Typography>
              </CardActionArea></Card>
            </Grid>)}
          </Grid>}
          {!loading && !items.length && <Typography>No saved images yet. Close this window and upload your first image.</Typography>}
          {error && <Alert severity="error" action={<Button onClick={loadLibrary}>Retry</Button>}>{error}</Alert>}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
