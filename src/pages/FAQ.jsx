import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
import RichTextField from '../components/RichTextField.jsx';
import SortableItems from '../components/SortableItems.jsx';
import { getFaqs, createFaq, updateFaq, deleteFaq, reorderFaqs } from '../services/faqApi.js';

const EMPTY_FORM = { question: '', answer: '' };

export default function FAQ() {
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
      const res = await getFaqs();
      const list = res.data?.items || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (_err) {
      setError('Could not load FAQ items.');
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
    setForm({ question: item.question, answer: item.answer });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await updateFaq(editingId, form);
      } else {
        await createFaq(form);
      }
      setDialogOpen(false);
      load();
    } catch (_err) {
      setFormError('Could not save this FAQ item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFaq(deleteTarget._id || deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (_err) {
      setError('Could not delete this FAQ item.');
    } finally {
      setDeleting(false);
    }
  };

  const handleReorder = async (newItems) => {
    setItems(newItems);
    try {
      await reorderFaqs(newItems.map((it) => it._id || it.id));
    } catch (_err) {
      setError('Could not save the new order.');
    }
  };

  if (loading) return <LoadingState label="Loading FAQ…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="FAQ"
        subtitle="Frequently asked questions. Drag to reorder."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add FAQ
          </Button>
        }
      />

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No FAQ items yet.</Typography>
        </Paper>
      ) : (
        <SortableItems
          items={items}
          onReorder={handleReorder}
          renderItem={(item) => (
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <DragIndicatorIcon sx={{ color: 'text.secondary', mt: 0.5 }} />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.question}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.answer}
                  </Typography>
                </Box>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Stack spacing={2.5}>
            <TextField fullWidth label="Question" value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
            <RichTextField label="Answer" value={form.answer} onChange={(answer) => setForm((f) => ({ ...f, answer }))} />
          </Stack>
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
        title="Delete FAQ item?"
        message="This will permanently remove this question and answer."
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
