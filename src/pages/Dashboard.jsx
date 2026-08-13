import { useCallback, useEffect, useState } from 'react';
import { Grid, Paper, Typography, Stack, Box, Chip, Divider } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { getDashboardStats } from '../services/dashboardApi.js';
import { formatDateTime } from '../utils/formatters.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDashboardStats();
      setStats(res.data || {});
    } catch (_err) {
      setError('Could not load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const cards = [
    { label: 'Total Images', value: stats?.totalImages, icon: ImageOutlinedIcon, color: 'primary' },
    { label: 'Gallery Count', value: stats?.galleryCount, icon: CollectionsOutlinedIcon, color: 'secondary' },
    { label: 'Services Count', value: stats?.servicesCount, icon: DesignServicesOutlinedIcon, color: 'success' },
    { label: 'Portfolio Count', value: stats?.portfolioCount, icon: PhotoLibraryOutlinedIcon, color: 'warning' },
    { label: 'Testimonials Count', value: stats?.testimonialsCount, icon: FormatQuoteOutlinedIcon, color: 'primary' },
    { label: 'Contact Messages', value: stats?.contactMessagesCount, icon: MarkEmailUnreadOutlinedIcon, color: 'error' },
  ];

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Overview of your site content" />
      <Grid container spacing={2.5}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.label}>
            <StatCard {...c} />
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Recent Updates
        </Typography>
        {!stats?.recentUpdates || stats.recentUpdates.length === 0 ? (
          <Typography color="text.secondary">No recent activity yet.</Typography>
        ) : (
          <Stack divider={<Divider />} spacing={0}>
            {stats.recentUpdates.map((update, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 1.5 }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {update.summary}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Chip size="small" label={update.collection} />
                    <Chip size="small" label={update.action} variant="outlined" />
                  </Stack>
                </Box>
                <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">
                  {formatDateTime(update.at)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
