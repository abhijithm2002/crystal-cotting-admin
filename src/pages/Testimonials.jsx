import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
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
  Rating,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import StarRatingInput from '../components/StarRatingInput.jsx';
import RichTextField from '../components/RichTextField.jsx';
import { resolveMediaUrl } from '../services/api.js';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../services/testimonialsApi.js';

const EMPTY_FORM = {
  name: '',
  location: '',
  image: '',
  initials: '',
  review: '',
  rating: 5,
  isFeatured: false,
};

export default function Testimonials() {
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
      const res = await getTestimonials();
      const list = res.data?.items || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (_err) {
      setError('Could not load testimonials.');
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
        await updateTestimonial(editingId, form);
      } else {
        await createTestimonial(form);
      }
      setDialogOpen(false);
      load();
    } catch (_err) {
      setFormError('Could not save this testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      await updateTestimonial(item._id || item.id, { isFeatured: !item.isFeatured });
      load();
    } catch (_err) {
      setError('Could not update the featured flag.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTestimonial(deleteTarget._id || deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (_err) {
      setError('Could not delete this testimonial.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState label="Loading testimonials…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Testimonials"
        subtitle="Customer reviews shown across the site"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Testimonial
          </Button>
        }
      />

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No testimonials yet.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id || item.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={resolveMediaUrl(item.image)}>{item.initials}</Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.location}
                      </Typography>
                    </Box>
                    {item.isFeatured && <Chip size="small" color="secondary" label="Featured" />}
                  </Stack>
                  <Rating value={Number(item.rating) || 0} readOnly size="small" sx={{ mt: 1 }} />
                  <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                    <FormatQuoteIcon fontSize="small" color="disabled" />
                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.review}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MediaPicker label="Photo (optional)" value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} category="testimonials" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Initials" value={form.initials} onChange={(e) => setForm((f) => ({ ...f, initials: e.target.value }))} placeholder="e.g. JD" />
            </Grid>
            <Grid item xs={12}>
              <RichTextField label="Review" value={form.review} onChange={(review) => setForm((f) => ({ ...f, review }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StarRatingInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
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
        title="Delete testimonial?"
        message={`This will permanently remove the testimonial from "${deleteTarget?.name}".`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
