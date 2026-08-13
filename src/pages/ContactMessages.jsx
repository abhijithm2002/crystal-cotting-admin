import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import PageHeader from '../components/PageHeader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { formatDateTime } from '../utils/formatters.js';
import {
  getContactMessages,
  exportContactMessagesUrl,
  markMessageRead,
  deleteMessage,
} from '../services/contactApi.js';

export default function ContactMessages() {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [viewing, setViewing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getContactMessages({
        search: search || undefined,
        read: readFilter || undefined,
        page: page + 1,
      });
      const data = res.data || {};
      const list = data.items || data.messages || data || [];
      setRows((Array.isArray(list) ? list : []).map((m) => ({ id: m._id || m.id, ...m })));
      setRowCount(data.total ?? (Array.isArray(list) ? list.length : 0));
    } catch (_err) {
      setError('Could not load contact messages.');
    } finally {
      setLoading(false);
    }
  }, [search, readFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleRead = async (row) => {
    try {
      await markMessageRead(row.id, !row.isRead);
      load();
    } catch (_err) {
      setError('Could not update read status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMessage(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (_err) {
      setError('Could not delete this message.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 130 },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 130 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 160 },
    { field: 'service', headerName: 'Service', flex: 1, minWidth: 130 },
    {
      field: 'isRead',
      headerName: 'Status',
      minWidth: 110,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value ? 'Read' : 'Unread'}
          color={params.value ? 'success' : 'warning'}
          variant={params.value ? 'outlined' : 'filled'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Received',
      minWidth: 170,
      valueFormatter: (value) => formatDateTime(value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => setViewing(params.row)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleToggleRead(params.row)}>
            {params.row.isRead ? <MarkEmailUnreadIcon fontSize="small" /> : <MarkEmailReadIcon fontSize="small" />}
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(params.row)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Contact Messages"
        subtitle="Leads submitted via the public contact form"
        action={
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            component="a"
            href={exportContactMessagesUrl()}
            target="_blank"
            rel="noopener"
          >
            Export CSV
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Status"
            value={readFilter}
            onChange={(e) => {
              setPage(0);
              setReadFilter(e.target.value);
            }}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Read</MenuItem>
            <MenuItem value="false">Unread</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <Paper sx={{ height: 560 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Paper>

      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        {viewing && (
          <>
            <DialogTitle fontWeight={700}>Message from {viewing.name}</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={1.5}>
                <Typography variant="body2">
                  <strong>Phone:</strong> {viewing.phone || '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {viewing.email || '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Service:</strong> {viewing.service || '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Received:</strong> {formatDateTime(viewing.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  <strong>Message:</strong>
                  <br />
                  {viewing.message}
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewing(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete message?"
        message="This will permanently remove this contact submission."
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
