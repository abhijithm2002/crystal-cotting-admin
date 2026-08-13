import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import PrivateRoute from './PrivateRoute.jsx';

import Login from '../pages/Login.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';

import Dashboard from '../pages/Dashboard.jsx';
import Homepage from '../pages/Homepage.jsx';
import About from '../pages/About.jsx';
import Services from '../pages/Services.jsx';
import Gallery from '../pages/Gallery.jsx';
import Portfolio from '../pages/Portfolio.jsx';
import Testimonials from '../pages/Testimonials.jsx';
import ContactPage from '../pages/ContactPage.jsx';
import ContactMessages from '../pages/ContactMessages.jsx';
import FAQ from '../pages/FAQ.jsx';
import SiteSettings from '../pages/SiteSettings.jsx';
import MediaLibrary from '../pages/MediaLibrary.jsx';
import ChangePassword from '../pages/ChangePassword.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact-page" element={<ContactPage />} />
        <Route path="/contact-messages" element={<ContactMessages />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/settings" element={<SiteSettings />} />
        <Route path="/media-library" element={<MediaLibrary />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
