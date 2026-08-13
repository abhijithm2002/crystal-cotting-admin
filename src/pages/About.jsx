import { useCallback, useEffect, useState } from 'react';
import { Box, Paper, Tabs, Tab, Grid, TextField, Divider, Alert, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import IconPicker from '../components/IconPicker.jsx';
import TagInput from '../components/TagInput.jsx';
import RepeatableList from '../components/RepeatableList.jsx';
import RichTextField from '../components/RichTextField.jsx';
import { getAbout, updateAbout } from '../services/aboutApi.js';

const EMPTY = {
  banner: '',
  companyImage: '',
  experienceCaption: { label: '', text: '' },
  intro: { eyebrow: '', title: '', description: '' },
  blocks: [],
  qualityChips: [],
  teamImages: [],
  certificates: [],
};

export default function About() {
  const [data, setData] = useState(EMPTY);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAbout();
      setData({
        ...EMPTY,
        ...res.data,
        experienceCaption: { ...EMPTY.experienceCaption, ...res.data?.experienceCaption },
        intro: { ...EMPTY.intro, ...res.data?.intro },
      });
    } catch (_err) {
      setError('Could not load about page content.');
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
      await updateAbout(data);
      setSaveMsg('About page saved.');
    } catch (_err) {
      setSaveMsg('error:Could not save about page.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading about page content…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <Box>
      <PageHeader
        title="About"
        subtitle="Manage the About page content"
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

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Intro & Images" />
          <Tab label="Blocks" />
          <Tab label="Quality Chips" />
          <Tab label="Team" />
          <Tab label="Certificates" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {tab === 0 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <MediaPicker label="Banner image" value={data.banner} onChange={(v) => setData((d) => ({ ...d, banner: v }))} category="about" />
            </Grid>
            <Grid item xs={12} md={6}>
              <MediaPicker label="Company image" value={data.companyImage} onChange={(v) => setData((d) => ({ ...d, companyImage: v }))} category="about" />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Experience label"
                value={data.experienceCaption.label}
                onChange={(e) => setData((d) => ({ ...d, experienceCaption: { ...d.experienceCaption, label: e.target.value } }))}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Experience text"
                value={data.experienceCaption.text}
                onChange={(e) => setData((d) => ({ ...d, experienceCaption: { ...d.experienceCaption, text: e.target.value } }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Eyebrow"
                value={data.intro.eyebrow}
                onChange={(e) => setData((d) => ({ ...d, intro: { ...d.intro, eyebrow: e.target.value } }))}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Title"
                value={data.intro.title}
                onChange={(e) => setData((d) => ({ ...d, intro: { ...d.intro, title: e.target.value } }))}
              />
            </Grid>
            <Grid item xs={12}>
              <RichTextField
                label="Description"
                value={data.intro.description}
                onChange={(description) => setData((d) => ({ ...d, intro: { ...d.intro, description } }))}
              />
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <RepeatableList
            title="Blocks (Company Story / Mission / Vision / Quality Commitment, etc.)"
            items={data.blocks}
            onChange={(blocks) => setData((d) => ({ ...d, blocks }))}
            emptyItem={{ title: '', text: '', icon: '' }}
            addLabel="Add block"
            renderItem={(item, update) => (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Title" value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Text" value={item.text} onChange={(e) => update({ ...item, text: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <IconPicker value={item.icon} onChange={(icon) => update({ ...item, icon })} />
                </Grid>
              </Grid>
            )}
          />
        )}

        {tab === 2 && (
          <TagInput
            label="Quality chips"
            value={data.qualityChips}
            onChange={(qualityChips) => setData((d) => ({ ...d, qualityChips }))}
          />
        )}

        {tab === 3 && (
          <RepeatableList
            title="Team images"
            items={data.teamImages}
            onChange={(teamImages) => setData((d) => ({ ...d, teamImages }))}
            emptyItem={{ image: '', name: '', role: '' }}
            addLabel="Add team member"
            renderItem={(item, update) => (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <MediaPicker label="Photo" value={item.image} onChange={(v) => update({ ...item, image: v })} category="team" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Name" value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Role" value={item.role} onChange={(e) => update({ ...item, role: e.target.value })} />
                </Grid>
              </Grid>
            )}
          />
        )}

        {tab === 4 && (
          <RepeatableList
            title="Certificates"
            items={data.certificates}
            onChange={(certificates) => setData((d) => ({ ...d, certificates }))}
            emptyItem={{ image: '', title: '' }}
            addLabel="Add certificate"
            renderItem={(item, update) => (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <MediaPicker label="Certificate image" value={item.image} onChange={(v) => update({ ...item, image: v })} category="certificates" />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField fullWidth label="Title" value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
                </Grid>
              </Grid>
            )}
          />
        )}
      </Paper>
    </Box>
  );
}
