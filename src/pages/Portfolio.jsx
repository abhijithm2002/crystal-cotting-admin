import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import MultiImagePicker from '../components/MultiImagePicker.jsx';
import TagInput from '../components/TagInput.jsx';
import RichTextField from '../components/RichTextField.jsx';
import { resolveMediaUrl } from '../services/api.js';
import {
  getPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from '../services/portfolioApi.js';

const EMPTY_FORM = {
  title: '',
  category: '',
  location: '',
  completionDate: '',
  duration: '',
  description: '',
  coverImage: '',
  images: [],
  beforeImage: '',
  afterImage: '',
  materials: [],
  services: [],
  isFeatured: false,
};

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPortfolioItems();
      const list = res.data?.items || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (_err) {
      setError('Could not load portfolio projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id || item.id);
    setForm({ ...EMPTY_FORM, ...item, completionDate: item.completionDate ? String(item.completionDate).slice(0, 10) : '' });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await updatePortfolioItem(editingId, form);
      } else {
        await createPortfolioItem(form);
      }
      setDialogOpen(false);
      load();
    } catch (_err) {
      setFormError('Could not save this project.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      await updatePortfolioItem(item._id || item.id, { isFeatured: !item.isFeatured });
      load();
    } catch (_err) {
      setError('Could not update the featured flag.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePortfolioItem(deleteTarget._id || deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (_err) {
      setError('Could not delete this project.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState label="Loading portfolio…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Portfolio"
        subtitle="Completed projects shown in the portfolio and homepage featured projects"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Project
          </Button>
        }
      />

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No portfolio projects yet.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id || item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={resolveMediaUrl(item.coverImage) || undefined}
                  alt={item.title}
                  sx={{ objectFit: 'cover', bgcolor: 'background.default' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      {item.title}
                    </Typography>
                    {item.isFeatured && <Chip size="small" color="secondary" label="Featured" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.location} • {item.category}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} alignItems="center" justifyContent="space-between">
                    <FormControlLabel
                      control={<Switch size="small" checked={!!item.isFeatured} onChange={() => handleToggleFeatured(item)} />}
                      label="Featured"
                    />
                    <Stack direction="row">
                      <IconButton size="small" onClick={() => openEdit(item)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                type="date"
                label="Completion date"
                InputLabelProps={{ shrink: true }}
                value={form.completionDate}
                onChange={(e) => setForm((f) => ({ ...f, completionDate: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Duration" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="e.g. 3 weeks" />
            </Grid>
            <Grid item xs={12}>
              <RichTextField label="Description" value={form.description} onChange={(description) => setForm((f) => ({ ...f, description }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MediaPicker label="Cover image" value={form.coverImage} onChange={(v) => setForm((f) => ({ ...f, coverImage: v }))} category="portfolio" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MediaPicker label="Before image" value={form.beforeImage} onChange={(v) => setForm((f) => ({ ...f, beforeImage: v }))} category="portfolio" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MediaPicker label="After image" value={form.afterImage} onChange={(v) => setForm((f) => ({ ...f, afterImage: v }))} category="portfolio" />
            </Grid>
            <Grid item xs={12}>
              <MultiImagePicker label="Gallery images" value={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} category="portfolio" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TagInput label="Materials" value={form.materials} onChange={(materials) => setForm((f) => ({ ...f, materials }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TagInput label="Services used" value={form.services} onChange={(services) => setForm((f) => ({ ...f, services }))} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch checked={!!form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
                }
                label="Featured on homepage"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project?"
        message={`This will permanently remove "${deleteTarget?.title}".`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
