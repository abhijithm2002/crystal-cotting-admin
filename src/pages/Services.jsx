import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import MultiImagePicker from '../components/MultiImagePicker.jsx';
import IconPicker, { DynamicIcon } from '../components/IconPicker.jsx';
import TagInput from '../components/TagInput.jsx';
import RichTextField from '../components/RichTextField.jsx';
import SortableItems from '../components/SortableItems.jsx';
import { resolveMediaUrl } from '../services/api.js';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  reorderServices,
} from '../services/servicesApi.js';

const EMPTY_FORM = {
  title: '',
  description: '',
  image: '',
  banner: '',
  icon: '',
  accent: '',
  category: 'main',
  isFeatured: false,
  features: [],
  gallery: [],
};

export default function Services() {
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
      const res = await getServices();
      const list = res.data?.items || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (_err) {
      setError('Could not load services.');
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
    setForm({ ...EMPTY_FORM, ...item });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await updateService(editingId, form);
      } else {
        await createService(form);
      }
      setDialogOpen(false);
      load();
    } catch (_err) {
      setFormError('Could not save this service.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      await updateService(item._id || item.id, { isFeatured: !item.isFeatured });
      load();
    } catch (_err) {
      setError('Could not update the featured flag.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService(deleteTarget._id || deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (_err) {
      setError('Could not delete this service.');
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (newItems) => {
    setItems(newItems);
    try {
      await reorderServices(newItems.map((it) => it._id || it.id));
    } catch (_err) {
      setError('Could not save the new order.');
    }
  };

  if (loading) return <LoadingState label="Loading services…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Services"
        subtitle="Main and secondary services shown across the site. Drag to reorder."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Service
          </Button>
        }
      />

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No services yet. Add the first one.</Typography>
        </Paper>
      ) : (
        <SortableItems
          items={items}
          onReorder={handleReorder}
          renderItem={(item) => (
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <DragIndicatorIcon sx={{ color: 'text.secondary' }} />
                <Box
                  component="img"
                  src={resolveMediaUrl(item.image)}
                  alt=""
                  sx={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 1.5, bgcolor: 'background.default' }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {item.icon && <DynamicIcon name={item.icon} size={16} />}
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      {item.title}
                    </Typography>
                    <Chip size="small" label={item.category} variant="outlined" />
                    {item.isFeatured && <Chip size="small" color="secondary" label="Featured" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.description}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={<Switch checked={!!item.isFeatured} onChange={() => handleToggleFeatured(item)} />}
                  label="Featured"
                  labelPlacement="start"
                  sx={{ mr: 1 }}
                />
                <IconButton onClick={() => openEdit(item)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton color="error" onClick={() => setDeleteTarget(item)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          )}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Service' : 'Add Service'}</DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <MenuItem value="main">Main</MenuItem>
                <MenuItem value="secondary">Secondary</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <RichTextField label="Description" value={form.description} onChange={(description) => setForm((f) => ({ ...f, description }))} minRows={2} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MediaPicker label="Image (card)" value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} category="services" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MediaPicker label="Banner" value={form.banner} onChange={(v) => setForm((f) => ({ ...f, banner: v }))} category="services" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <IconPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Accent (gradient/color token)"
                value={form.accent}
                onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))}
                placeholder="e.g. from-blue-500 to-blue-700"
              />
            </Grid>
            <Grid item xs={12}>
              <TagInput label="Features" value={form.features} onChange={(features) => setForm((f) => ({ ...f, features }))} />
            </Grid>
            <Grid item xs={12}>
              <MultiImagePicker label="Gallery" value={form.gallery} onChange={(gallery) => setForm((f) => ({ ...f, gallery }))} category="services" />
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
        title="Delete service?"
        message={`This will permanently remove "${deleteTarget?.title}".`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
