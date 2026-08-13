import { useCallback, useEffect, useState } from 'react';
import { Box, Paper, Grid, TextField, Divider, Alert, Button, Stack } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import RepeatableList from '../components/RepeatableList.jsx';
import RichTextField from '../components/RichTextField.jsx';
import { getContactPage, updateContactPage } from '../services/contactApi.js';

const EMPTY = {
  banner: '',
  intro: { eyebrow: '', title: '', text: '' },
  phone: '',
  phoneHref: '',
  whatsapp: '',
  whatsappHref: '',
  email: '',
  address: '',
  hours: '',
  mapQuery: '',
  mapEmbedUrl: '',
  socials: [],
};

export default function ContactPage() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getContactPage();
      setData({ ...EMPTY, ...res.data, intro: { ...EMPTY.intro, ...res.data?.intro } });
    } catch (_err) {
      setError('Could not load contact page content.');
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
      await updateContactPage(data);
      setSaveMsg('Contact page saved.');
    } catch (_err) {
      setSaveMsg('error:Could not save contact page.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading contact page content…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="Contact Page"
        subtitle="Manage contact details shown on the public site"
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
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <MediaPicker label="Banner image" value={data.banner} onChange={(v) => setData((d) => ({ ...d, banner: v }))} category="contact" />
            </Grid>
          </Grid>

          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Eyebrow" value={data.intro.eyebrow} onChange={(e) => setData((d) => ({ ...d, intro: { ...d.intro, eyebrow: e.target.value } }))} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Title" value={data.intro.title} onChange={(e) => setData((d) => ({ ...d, intro: { ...d.intro, title: e.target.value } }))} />
            </Grid>
            <Grid item xs={12}>
              <RichTextField label="Text" value={data.intro.text} onChange={(text) => setData((d) => ({ ...d, intro: { ...d.intro, text } }))} minRows={2} />
            </Grid>
          </Grid>

          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" value={data.phone} onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone href (tel:...)" value={data.phoneHref} onChange={(e) => setData((d) => ({ ...d, phoneHref: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="WhatsApp" value={data.whatsapp} onChange={(e) => setData((d) => ({ ...d, whatsapp: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="WhatsApp href (https://wa.me/...)" value={data.whatsappHref} onChange={(e) => setData((d) => ({ ...d, whatsappHref: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" value={data.email} onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Hours" value={data.hours} onChange={(e) => setData((d) => ({ ...d, hours: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" value={data.address} onChange={(e) => setData((d) => ({ ...d, address: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Map query" value={data.mapQuery} onChange={(e) => setData((d) => ({ ...d, mapQuery: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Map embed URL" value={data.mapEmbedUrl} onChange={(e) => setData((d) => ({ ...d, mapEmbedUrl: e.target.value }))} />
            </Grid>
          </Grid>

          <Divider />
          <RepeatableList
            title="Social links"
            items={data.socials}
            onChange={(socials) => setData((d) => ({ ...d, socials }))}
            emptyItem={{ label: '', href: '' }}
            addLabel="Add social link"
            renderItem={(item, update) => (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Label" value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField fullWidth label="URL" value={item.href} onChange={(e) => update({ ...item, href: e.target.value })} />
                </Grid>
              </Grid>
            )}
          />
        </Stack>
      </Paper>
    </Box>
  );
}
