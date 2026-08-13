import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import ContactPageOutlinedIcon from '@mui/icons-material/ContactPageOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import useAuth from '../hooks/useAuth.js';

export const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon },
  { label: 'Homepage', path: '/homepage', icon: HomeOutlinedIcon },
  { label: 'About', path: '/about', icon: InfoOutlinedIcon },
  { label: 'Services', path: '/services', icon: DesignServicesOutlinedIcon },
  { label: 'Gallery', path: '/gallery', icon: CollectionsOutlinedIcon },
  { label: 'Portfolio', path: '/portfolio', icon: PhotoLibraryOutlinedIcon },
  { label: 'Testimonials', path: '/testimonials', icon: FormatQuoteOutlinedIcon },
  { label: 'Contact Page', path: '/contact-page', icon: ContactPageOutlinedIcon },
  { label: 'Contact Messages', path: '/contact-messages', icon: MarkEmailUnreadOutlinedIcon },
  { label: 'FAQ', path: '/faq', icon: QuizOutlinedIcon },
  { label: 'Site Settings', path: '/settings', icon: SettingsOutlinedIcon },
  { label: 'Media Library', path: '/media-library', icon: PermMediaOutlinedIcon },
  { label: 'Change Password', path: '/change-password', icon: LockResetOutlinedIcon },
];

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
    onNavigate?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
            <FormatPaintIcon fontSize="small" sx={{ color: 'primary.dark' }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
              Crystal Coat
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin Dashboard
            </Typography>
          </Box>
        </Stack>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 1.5 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const selected = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                onNavigate?.();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: selected ? 600 : 500 }}>
                {item.label}
              </ListItemText>
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 1.5 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 38 }}>
            <LogoutOutlinedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600, color: 'error.main' }}
          >
            Logout
          </ListItemText>
        </ListItemButton>
        {admin?.email && (
          <Typography variant="caption" color="text.secondary" sx={{ pl: 1.5, display: 'block', mt: 0.5 }}>
            {admin.email}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        <SidebarContent onNavigate={onClose} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid rgba(28,37,54,0.08)',
          },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
}
