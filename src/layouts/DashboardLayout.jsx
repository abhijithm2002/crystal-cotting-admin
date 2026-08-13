import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/homepage': 'Homepage',
  '/about': 'About Page',
  '/services': 'Services',
  '/gallery': 'Gallery',
  '/portfolio': 'Portfolio',
  '/testimonials': 'Testimonials',
  '/contact-page': 'Contact Page',
  '/contact-messages': 'Contact Messages',
  '/faq': 'FAQ',
  '/settings': 'Site Settings',
  '/media-library': 'Media Library',
  '/change-password': 'Change Password',
};

function getTitle(pathname) {
  const match = Object.keys(TITLES).find((p) => pathname.startsWith(p));
  return match ? TITLES[match] : 'Admin Dashboard';
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Topbar onMenuClick={() => setMobileOpen(true)} title={getTitle(location.pathname)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
