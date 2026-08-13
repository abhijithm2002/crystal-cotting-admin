import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  TextField,
  Stack,
  Typography,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PageHeader from '../components/PageHeader.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import IconPicker from '../components/IconPicker.jsx';
import TagInput from '../components/TagInput.jsx';
import RepeatableList from '../components/RepeatableList.jsx';
import RichTextField from '../components/RichTextField.jsx';
import { getHomepage, updateHomepage } from '../services/homepageApi.js';

const EMPTY = {
  hero: {
    backgroundImage: '',
    sideImage: '',
    eyebrow: '',
    badgeText: '',
    title: '',
    subtitle: '',
    buttons: [],
    highlightTags: [],
    floatingBadgeText: '',
    sideCaption: { title: '', text: '' },
  },
  heroStats: [],
  stats: [],
  servicesIntro: { eyebrow: '', title: '', text: '', note: '' },
  whyChooseIntro: { eyebrow: '', title: '', text: '' },
  whyChoose: [],
  premiumPromise: { eyebrow: '', title: '', text: '' },
  projectsIntro: { eyebrow: '', title: '', text: '' },
  beforeAfter: [],
  testimonialsIntro: { eyebrow: '', title: '', text: '' },
  footer: { description: '', phone: '', whatsapp: '', email: '', address: '', hours: '', socials: [] },
};

function IntroFields({ value, onChange, withNote }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Eyebrow" value={value.eyebrow || ''} onChange={(e) => onChange({ ...value, eyebrow: e.target.value })} />
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField fullWidth label="Title" value={value.title || ''} onChange={(e) => onChange({ ...value, title: e.target.value })} />
      </Grid>
      <Grid item xs={12}>
        <RichTextField label="Text" value={value.text} onChange={(text) => onChange({ ...value, text })} minRows={2} />
      </Grid>
      {withNote && (
        <Grid item xs={12}>
          <TextField fullWidth label="Note" value={value.note || ''} onChange={(e) => onChange({ ...value, note: e.target.value })} />
        </Grid>
      )}
    </Grid>
  );
}

export default function Homepage() {
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
      const res = await getHomepage();
      setData({ ...EMPTY, ...res.data, hero: { ...EMPTY.hero, ...res.data?.hero, sideCaption: { ...EMPTY.hero.sideCaption, ...res.data?.hero?.sideCaption } } });
    } catch (_err) {
      setError('Could not load homepage content.');
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
      await updateHomepage(data);
      setSaveMsg('Homepage content saved.');
    } catch (_err) {
      setSaveMsg('error:Could not save homepage content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading homepage content…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const setHero = (patch) => setData((d) => ({ ...d, hero: { ...d.hero, ...patch } }));

  return (
    <Box>
      <PageHeader
        title="Homepage"
        subtitle="Manage the homepage hero, stats, sections and footer content"
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
      <Alert severity="info" sx={{ mb: 2 }}>
        Featured services, portfolio projects, and testimonials shown on the homepage are controlled by the
        <strong> isFeatured</strong> switch on each item&apos;s own CRUD page (Services, Portfolio, Testimonials) — not here.
      </Alert>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Hero" />
          <Tab label="Hero Stats" />
          <Tab label="Stats Strip" />
          <Tab label="Services Intro" />
          <Tab label="Why Choose" />
          <Tab label="Premium Promise" />
          <Tab label="Projects & Before/After" />
          <Tab label="Testimonials Intro" />
          <Tab label="Footer" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {tab === 0 && (
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <MediaPicker label="Background image" value={data.hero.backgroundImage} onChange={(v) => setHero({ backgroundImage: v })} category="homepage" />
            </Grid>
            <Grid item xs={12} md={6}>
              <MediaPicker label="Side image" value={data.hero.sideImage} onChange={(v) => setHero({ sideImage: v })} category="homepage" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Eyebrow" value={data.hero.eyebrow} onChange={(e) => setHero({ eyebrow: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Badge text" value={data.hero.badgeText} onChange={(e) => setHero({ badgeText: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" value={data.hero.title} onChange={(e) => setHero({ title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <RichTextField label="Subtitle" value={data.hero.subtitle} onChange={(subtitle) => setHero({ subtitle })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Floating badge text" value={data.hero.floatingBadgeText} onChange={(e) => setHero({ floatingBadgeText: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TagInput label="Highlight tags" value={data.hero.highlightTags} onChange={(highlightTags) => setHero({ highlightTags })} />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Side caption
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={data.hero.sideCaption.title}
                    onChange={(e) => setHero({ sideCaption: { ...data.hero.sideCaption, title: e.target.value } })}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Text"
                    value={data.hero.sideCaption.text}
                    onChange={(e) => setHero({ sideCaption: { ...data.hero.sideCaption, text: e.target.value } })}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <RepeatableList
                title="Buttons"
                items={data.hero.buttons}
                onChange={(buttons) => setHero({ buttons })}
                emptyItem={{ text: '', link: '', type: 'primary' }}
                addLabel="Add button"
                renderItem={(item, update) => (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField fullWidth label="Text" value={item.text} onChange={(e) => update({ ...item, text: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField fullWidth label="Link" value={item.link} onChange={(e) => update({ ...item, link: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="Type" value={item.type} onChange={(e) => update({ ...item, type: e.target.value })} placeholder="primary / whatsapp / call" />
                    </Grid>
                  </Grid>
                )}
              />
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <RepeatableList
            title="Hero Stats"
            items={data.heroStats}
            onChange={(heroStats) => setData((d) => ({ ...d, heroStats }))}
            emptyItem={{ label: '', value: '', icon: '' }}
            addLabel="Add hero stat"
            renderItem={(item, update) => (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Label" value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Value" value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <IconPicker value={item.icon} onChange={(icon) => update({ ...item, icon })} />
                </Grid>
              </Grid>
            )}
          />
        )}

        {tab === 2 && (
          <RepeatableList
            title="Stats Strip"
            items={data.stats}
            onChange={(stats) => setData((d) => ({ ...d, stats }))}
            emptyItem={{ label: '', value: '', suffix: '' }}
            addLabel="Add stat"
            renderItem={(item, update) => (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Value" value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Suffix" value={item.suffix} onChange={(e) => update({ ...item, suffix: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Label" value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} />
                </Grid>
              </Grid>
            )}
          />
        )}

        {tab === 3 && (
          <IntroFields
            value={data.servicesIntro}
            withNote
            onChange={(servicesIntro) => setData((d) => ({ ...d, servicesIntro }))}
          />
        )}

        {tab === 4 && (
          <Stack spacing={3}>
            <IntroFields value={data.whyChooseIntro} onChange={(whyChooseIntro) => setData((d) => ({ ...d, whyChooseIntro }))} />
            <Divider />
            <RepeatableList
              title="Why Choose cards"
              items={data.whyChoose}
              onChange={(whyChoose) => setData((d) => ({ ...d, whyChoose }))}
              emptyItem={{ title: '', text: '', icon: '' }}
              addLabel="Add card"
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
          </Stack>
        )}

        {tab === 5 && (
          <IntroFields value={data.premiumPromise} onChange={(premiumPromise) => setData((d) => ({ ...d, premiumPromise }))} />
        )}

        {tab === 6 && (
          <Stack spacing={3}>
            <IntroFields value={data.projectsIntro} onChange={(projectsIntro) => setData((d) => ({ ...d, projectsIntro }))} />
            <Divider />
            <RepeatableList
              title="Before / After pairs"
              items={data.beforeAfter}
              onChange={(beforeAfter) => setData((d) => ({ ...d, beforeAfter }))}
              emptyItem={{ title: '', beforeLabel: 'Before', afterLabel: 'After', beforeImage: '', afterImage: '' }}
              addLabel="Add before/after pair"
              renderItem={(item, update) => (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Title" value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label="Before label" value={item.beforeLabel} onChange={(e) => update({ ...item, beforeLabel: e.target.value })} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField fullWidth label="After label" value={item.afterLabel} onChange={(e) => update({ ...item, afterLabel: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MediaPicker label="Before image" value={item.beforeImage} onChange={(v) => update({ ...item, beforeImage: v })} category="homepage" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MediaPicker label="After image" value={item.afterImage} onChange={(v) => update({ ...item, afterImage: v })} category="homepage" />
                  </Grid>
                </Grid>
              )}
            />
          </Stack>
        )}

        {tab === 7 && (
          <IntroFields value={data.testimonialsIntro} onChange={(testimonialsIntro) => setData((d) => ({ ...d, testimonialsIntro }))} />
        )}

        {tab === 8 && (
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <RichTextField label="Description" value={data.footer.description} onChange={(description) => setData((d) => ({ ...d, footer: { ...d.footer, description } }))} minRows={2} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" value={data.footer.phone} onChange={(e) => setData((d) => ({ ...d, footer: { ...d.footer, phone: e.target.value } }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="WhatsApp" value={data.footer.whatsapp} onChange={(e) => setData((d) => ({ ...d, footer: { ...d.footer, whatsapp: e.target.value } }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" value={data.footer.email} onChange={(e) => setData((d) => ({ ...d, footer: { ...d.footer, email: e.target.value } }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Address" value={data.footer.address} onChange={(e) => setData((d) => ({ ...d, footer: { ...d.footer, address: e.target.value } }))} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Hours" value={data.footer.hours} onChange={(e) => setData((d) => ({ ...d, footer: { ...d.footer, hours: e.target.value } }))} />
              </Grid>
            </Grid>
            <Divider />
            <RepeatableList
              title="Social links"
              items={data.footer.socials}
              onChange={(socials) => setData((d) => ({ ...d, footer: { ...d.footer, socials } }))}
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
        )}
      </Paper>
    </Box>
  );
}
