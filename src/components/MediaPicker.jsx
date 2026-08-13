import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { getMediaList, uploadMedia } from '../services/mediaApi.js';
import { resolveMediaUrl } from '../services/api.js';

function normalizeUploadResponse(data) {
  if (!data) return null;
  const item = Array.isArray(data) ? data[0] : data.media || data.file || data;
  return item?.url ? item : null;
}

// Reusable image field: shows a preview + "Change" button that opens a
// dialog to either upload a new file or pick an existing Media Library item.
export default function MediaPicker({ label, value, onChange, category }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMediaList({ search: search || undefined, category: category || undefined });
      const list = res.data?.items || res.data?.media || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (_err) {
      setError('Could not load the media library. Check the backend connection.');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    if (open && tab === 1) loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadMedia(file, category);
      const media = normalizeUploadResponse(res.data);
      if (media) {
        onChange(media.url);
        setOpen(false);
      } else {
        setError('Upload succeeded but no file URL was returned.');
      }
    } catch (_err) {
      setError('Upload failed. Check the backend connection and file type/size.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 96,
            height: 72,
            borderRadius: 2,
            border: '1px dashed rgba(28,37,54,0.2)',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {value ? (
            <Box
              component="img"
              src={resolveMediaUrl(value)}
              alt="preview"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImageOutlinedIcon sx={{ color: 'text.secondary' }} />
          )}
        </Box>
        <Stack spacing={1}>
          <Button size="small" variant="outlined" onClick={() => setOpen(true)}>
            {value ? 'Change image' : 'Select image'}
          </Button>
          {value && (
            <Button size="small" color="error" onClick={() => onChange('')}>
              Remove
            </Button>
          )}
        </Stack>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Select image
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: 3 }}>
          <Tab label="Upload new" />
          <Tab label="Media Library" />
        </Tabs>
        <DialogContent dividers sx={{ minHeight: 360 }}>
          {tab === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                border: '2px dashed rgba(28,37,54,0.15)',
                borderRadius: 3,
                gap: 2,
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              <Typography color="text.secondary">JPG, PNG, WEBP or SVG — up to 20MB</Typography>
              <Button variant="contained" component="label" disabled={uploading}>
                {uploading ? <CircularProgress size={20} color="inherit" /> : 'Choose file'}
                <input type="file" hidden accept=".jpg,.jpeg,.png,.webp,.svg" onChange={handleFileUpload} />
              </Button>
              {error && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}
            </Box>
          )}
          {tab === 1 && (
            <Box>
              <TextField
                fullWidth
                placeholder="Search media…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadLibrary()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : items.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                  No media found.
                </Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {items.map((item) => (
                    <Grid item xs={4} sm={3} md={2.4} key={item._id || item.id || item.url}>
                      <Card variant="outlined">
                        <CardActionArea
                          onClick={() => {
                            onChange(item.url);
                            setOpen(false);
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={resolveMediaUrl(item.thumbnailUrl || item.url)}
                            alt={item.originalName}
                            sx={{ height: 80, objectFit: 'cover' }}
                          />
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
