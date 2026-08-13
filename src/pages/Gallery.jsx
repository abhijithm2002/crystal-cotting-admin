import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Card,
  CardMedia,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogContent,
  Tooltip,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import SortableItems from '../components/SortableItems.jsx';
import { resolveMediaUrl } from '../services/api.js';
import { getMediaList, uploadMedia, replaceMedia, deleteMedia, reorderMedia } from '../services/mediaApi.js';

const GALLERY_CATEGORY = 'gallery';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const replaceInputRef = useRef(null);
  const [replaceForId, setReplaceForId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMediaList({ search: search || undefined, category: GALLERY_CATEGORY });
      const list = res.data?.items || res.data?.media || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (_err) {
      setError('Could not load the gallery.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      await uploadMedia(files.length > 1 ? files : files[0], GALLERY_CATEGORY);
      load();
    } catch (_err) {
      setError('Upload failed. Check file type/size and backend connection.');
    } finally {
      setUploading(false);
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

  const handleReorder = async (nextItems) => {
    setItems(nextItems);
    try {
      await reorderMedia(nextItems.map((item) => item._id || item.id));
    } catch (_err) {
      setError('Could not save the new order. Your arrangement may not persist after reload.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMedia(deleteTarget._id || deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (_err) {
      setError('Could not delete this image.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState label="Loading gallery…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Gallery"
        subtitle="Images shown in the site gallery (Media Library, category: gallery)"
        action={
          <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
            <input type="file" hidden multiple accept=".jpg,.jpeg,.png,.webp,.svg" onChange={(e) => handleUpload(e.target.files)} />
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search gallery…"
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
          Drag and drop images here to bulk-upload to the gallery.
        </Typography>
      </Paper>

      <Alert severity="info" sx={{ mb: 2 }}>
        Drag cards to reorder. The order is saved automatically and reflected on the live site.
      </Alert>

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No gallery images yet. Upload some above.</Typography>
        </Paper>
      ) : (
        <SortableItems
          items={items}
          getId={(item) => item._id || item.id}
          onReorder={handleReorder}
          layout="grid"
          renderItem={(item) => (
            <Card sx={{ width: 168, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 4, left: 4, zIndex: 1, color: '#fff', bgcolor: 'rgba(0,0,0,0.45)', borderRadius: 1 }}>
                <DragIndicatorIcon fontSize="small" />
              </Box>
              <CardMedia
                component="img"
                image={resolveMediaUrl(item.thumbnailUrl || item.url)}
                alt=""
                onClick={() => setPreview(item)}
                sx={{ height: 130, objectFit: 'cover', cursor: 'zoom-in', bgcolor: 'background.default' }}
              />
              <Stack direction="row" justifyContent="center" sx={{ py: 0.5 }}>
                <Tooltip title="Replace">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setReplaceForId(item._id || item.id);
                      replaceInputRef.current?.click();
                    }}
                  >
                    <SwapHorizIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Card>
          )}
        />
      )}

      <input type="file" ref={replaceInputRef} hidden accept=".jpg,.jpeg,.png,.webp,.svg" onChange={handleReplaceFile} />

      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="md">
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton
            onClick={() => setPreview(null)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
          {preview && (
            <Box component="img" src={resolveMediaUrl(preview.url)} alt="" sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete image?"
        message="This will permanently remove this image from the gallery."
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
