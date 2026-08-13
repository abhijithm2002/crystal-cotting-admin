import { useCallback, useEffect, useState } from 'react';
import { Box, Paper, Grid, TextField, Divider, Alert, Button, Stack, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { getSettings, updateSettings } from '../services/settingsApi.js';

const EMPTY = {
  siteName: '',
  logo: '',
  logoWhite: '',
  favicon: '',
  footerText: '',
  themeColors: { primary: '#1e4d8b', secondary: '#e8a33d', accent: '#2e9e5b' },
  seo: { defaultTitle: '', defaultDescription: '', defaultKeywords: '', ogImage: '' },
};

function ColorField({ label, value, onChange }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          border: '1px solid rgba(28,37,54,0.15)',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          style={{
            position: 'absolute',
            top: -4,
            left: -4,
            width: 48,
            height: 48,
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        />
      </Box>
      <TextField fullWidth label={label} value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </Stack>
  );
}

export default function SiteSettings() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSettings();
      setData({
        ...EMPTY,
        ...res.data,
        themeColors: { ...EMPTY.themeColors, ...res.data?.themeColors },
        seo: { ...EMPTY.seo, ...res.data?.seo },
      });
    } catch (_err) {
      setError('Could not load site settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await updateSettings(data);
      setSaveMsg('Site settings saved.');
    } catch (_err) {
      setSaveMsg('error:Could not save site settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading site settings…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Site Settings"
        subtitle="Global site identity, theme colors and SEO defaults"
        action={
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        }
      />
      {saveMsg && (
        <Alert severity={saveMsg.startsWith('error:') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {saveMsg.replace('error:', '')}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Site name" value={data.siteName} onChange={(e) => setData((d) => ({ ...d, siteName: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Footer text" value={data.footerText} onChange={(e) => setData((d) => ({ ...d, footerText: e.target.value }))} />
            </Grid>
          </Grid>

          <Divider />
          <Typography variant="subtitle2" fontWeight={700}>
            Branding images
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <MediaPicker label="Logo" value={data.logo} onChange={(v) => setData((d) => ({ ...d, logo: v }))} category="settings" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MediaPicker label="Logo (white)" value={data.logoWhite} onChange={(v) => setData((d) => ({ ...d, logoWhite: v }))} category="settings" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MediaPicker label="Favicon" value={data.favicon} onChange={(v) => setData((d) => ({ ...d, favicon: v }))} category="settings" />
            </Grid>
          </Grid>

          <Divider />
          <Typography variant="subtitle2" fontWeight={700}>
            Theme colors
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <ColorField
                label="Primary"
                value={data.themeColors.primary}
                onChange={(v) => setData((d) => ({ ...d, themeColors: { ...d.themeColors, primary: v } }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ColorField
                label="Secondary"
                value={data.themeColors.secondary}
                onChange={(v) => setData((d) => ({ ...d, themeColors: { ...d.themeColors, secondary: v } }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ColorField
                label="Accent"
                value={data.themeColors.accent}
                onChange={(v) => setData((d) => ({ ...d, themeColors: { ...d.themeColors, accent: v } }))}
              />
            </Grid>
          </Grid>

          <Divider />
          <Typography variant="subtitle2" fontWeight={700}>
            SEO defaults
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Default title" value={data.seo.defaultTitle} onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, defaultTitle: e.target.value } }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Default description"
                value={data.seo.defaultDescription}
                onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, defaultDescription: e.target.value } }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Default keywords" value={data.seo.defaultKeywords} onChange={(e) => setData((d) => ({ ...d, seo: { ...d.seo, defaultKeywords: e.target.value } }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MediaPicker label="OG image" value={data.seo.ogImage} onChange={(v) => setData((d) => ({ ...d, seo: { ...d.seo, ogImage: v } }))} category="settings" />
            </Grid>
          </Grid>
        </Stack>
      </Paper>
    </Box>
  );
}
