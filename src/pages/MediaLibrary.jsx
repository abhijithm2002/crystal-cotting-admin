import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { resolveMediaUrl } from '../services/api.js';
import { formatBytes, formatDate } from '../utils/formatters.js';
import {
  getMediaList,
  uploadMedia,
  updateMedia,
  replaceMedia,
  deleteMedia,
  getMediaUsage,
} from '../services/mediaApi.js';

const CATEGORIES = ['homepage', 'about', 'services', 'gallery', 'portfolio', 'testimonials', 'contact', 'team', 'certificates', 'settings'];

export default function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameCategory, setRenameCategory] = useState('');
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const replaceInputRef = useRef(null);
  const [replaceForId, setReplaceForId] = useState(null);

  const load = useCallback(async () => {
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
    load();
  }, [load]);

  const handleUpload = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      await uploadMedia(files.length > 1 ? files : files[0], category || undefined);
      load();
    } catch (_err) {
      setError('Upload failed. Check file type/size and backend connection.');
    } finally {
      setUploading(false);
    }
  };

  const openDetails = (item) => {
    setSelected(item);
    setRenameValue(item.originalName || item.filename || '');
    setRenameCategory(item.category || '');
    setUsage(null);
  };

  const handleRename = async () => {
    if (!selected) return;
    try {
      await updateMedia(selected._id || selected.id, { originalName: renameValue, category: renameCategory });
      setSelected(null);
      load();
    } catch (_err) {
      setError('Could not rename/update this media item.');
    }
  };

  const handleLoadUsage = async () => {
    if (!selected) return;
    setUsageLoading(true);
    try {
      const res = await getMediaUsage(selected._id || selected.id);
      setUsage(res.data?.usage || res.data || []);
    } catch (_err) {
      setUsage([]);
    } finally {
      setUsageLoading(false);
    }
  };

  const handleReplaceFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !replaceForId) return;
    try {
      await replaceMedia(replaceForId, file);
      load();
    } catch (_err) {
      setError('Could not replace this file.');
    } finally {
      setReplaceForId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMedia(deleteTarget._id || deleteTarget.id);
      setDeleteTarget(null);
      setSelected(null);
      load();
    } catch (_err) {
      setError('Could not delete this media item.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Media Library"
        subtitle="All uploaded media across the site"
        action={
          <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
            <input type="file" hidden multiple accept=".jpg,.jpeg,.png,.webp,.svg" onChange={(e) => handleUpload(e.target.files)} />
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search media…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">All categories</MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <Paper
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleUpload(e.dataTransfer.files);
        }}
        sx={{
          p: 2,
          mb: 2,
          border: dragOver ? '2px dashed' : '2px dashed transparent',
          borderColor: dragOver ? 'primary.main' : 'transparent',
          bgcolor: dragOver ? 'action.hover' : 'transparent',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Drag and drop files here to upload, or use the Upload button above.
        </Typography>
      </Paper>

      {loading ? (
        <LoadingState label="Loading media…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No media found.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={item._id || item.id}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => openDetails(item)}>
                <CardMedia
                  component="img"
                  image={resolveMediaUrl(item.thumbnailUrl || item.url)}
                  alt={item.originalName}
                  sx={{ height: 110, objectFit: 'cover', bgcolor: 'background.default' }}
                />
                <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                  <Typography variant="caption" noWrap display="block" fontWeight={600}>
                    {item.originalName || item.filename}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formatBytes(item.size)}
                    {item.width && item.height ? ` • ${item.width}×${item.height}` : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle fontWeight={700}>Media details</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box
                  component="img"
                  src={resolveMediaUrl(selected.url)}
                  alt=""
                  sx={{ width: '100%', maxHeight: 240, objectFit: 'contain', bgcolor: 'background.default', borderRadius: 2 }}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" label={formatBytes(selected.size)} />
                  {selected.width && selected.height && (
                    <Chip size="small" label={`${selected.width}×${selected.height}`} />
                  )}
                  <Chip size="small" label={selected.mimeType} variant="outlined" />
                  <Chip size="small" label={formatDate(selected.createdAt)} variant="outlined" />
                </Stack>
                <TextField label="Name" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} fullWidth />
                <TextField select label="Category" value={renameCategory} onChange={(e) => setRenameCategory(e.target.value)} fullWidth>
                  <MenuItem value="">Uncategorized</MenuItem>
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>

                <Stack direction="row" spacing={1}>
                  <Button size="small" startIcon={<EditOutlinedIcon />} onClick={handleRename}>
                    Save name / category
                  </Button>
                  <Button
                    size="small"
                    startIcon={<SwapHorizIcon />}
                    onClick={() => {
                      setReplaceForId(selected._id || selected.id);
                      replaceInputRef.current?.click();
                    }}
                  >
                    Replace file
                  </Button>
                  <Button size="small" startIcon={<InfoOutlinedIcon />} onClick={handleLoadUsage}>
                    Show where used
                  </Button>
                </Stack>

                {usageLoading && <LoadingState label="Checking usage…" />}
                {usage && (
                  usage.length === 0 ? (
                    <Alert severity="info">This file isn&apos;t referenced anywhere yet.</Alert>
                  ) : (
                    <Stack spacing={1}>
                      {usage.map((u, i) => (
                        <Alert severity="info" key={i} icon={false}>
                          <strong>{u.collection}</strong> → {u.field} (doc {u.docId})
                        </Alert>
                      ))}
                    </Stack>
                  )
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
              <Button color="error" startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteTarget(selected)}>
                Delete
              </Button>
              <Button onClick={() => setSelected(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <input type="file" ref={replaceInputRef} hidden accept=".jpg,.jpeg,.png,.webp,.svg" onChange={handleReplaceFile} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete media?"
        message="This will permanently delete the file. Any content still referencing it may show a broken image."
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
