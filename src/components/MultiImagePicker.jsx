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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { getMediaList, uploadMedia } from '../services/mediaApi.js';
import { resolveMediaUrl } from '../services/api.js';

function normalizeUploaded(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter((m) => m?.url);
  if (Array.isArray(data.media)) return data.media.filter((m) => m?.url);
  if (data.url) return [data];
  return [];
}

// Manages an array-of-image-URL field (e.g. Service.gallery, Portfolio.images).
export default function MultiImagePicker({ label, value = [], onChange, category }) {
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
      setError('Could not load the media library.');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    if (open && tab === 1) loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab]);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadMedia(files.length > 1 ? files : files[0], category);
      const media = normalizeUploaded(res.data);
      if (media.length) {
        onChange([...value, ...media.map((m) => m.url)]);
      } else {
        setError('Upload succeeded but no file URL was returned.');
      }
    } catch (_err) {
      setError('Upload failed. Check the backend connection and file type/size.');
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index) => onChange(value.filter((_, i) => i !== index));

  return (
    <Box>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <Grid container spacing={1.5}>
        {value.map((url, index) => (
          <Grid item xs={4} sm={3} md={2} key={`${url}-${index}`}>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={resolveMediaUrl(url)}
                alt=""
                sx={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 1.5 }}
              />
              <IconButton
                size="small"
                onClick={() => removeAt(index)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
        <Grid item xs={4} sm={3} md={2}>
          <Button
            onClick={() => setOpen(true)}
            sx={{
              width: '100%',
              height: 80,
              border: '1px dashed rgba(28,37,54,0.3)',
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <AddPhotoAlternateOutlinedIcon fontSize="small" />
            <Typography variant="caption">Add</Typography>
          </Button>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add images
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
              <Typography color="text.secondary">Select one or more files (JPG, PNG, WEBP, SVG — up to 20MB each)</Typography>
              <Button variant="contained" component="label" disabled={uploading}>
                {uploading ? <CircularProgress size={20} color="inherit" /> : 'Choose files'}
                <input type="file" hidden multiple accept=".jpg,.jpeg,.png,.webp,.svg" onChange={handleFiles} />
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
                            if (!value.includes(item.url)) onChange([...value, item.url]);
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
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
