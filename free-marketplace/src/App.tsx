import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import AnnouncementBanner from './components/AnnouncementBanner';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import GameDetailPage from './pages/GameDetailPage';
import ProgramsPage from './pages/ProgramsPage';
import ProgramDetailPage from './pages/ProgramDetailPage';
import BlogPage from './pages/BlogPage';
import UserProfilePage from './pages/UserProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import ProfileRedirect from './pages/ProfileRedirect';
import ForumsPage from './pages/ForumsPage';
import ForumCategoryPage from './pages/ForumCategoryPage';
import NewThreadPage from './pages/NewThreadPage';
import ThreadPage from './pages/ThreadPage';
import ForumLoginPage from './pages/ForumLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ThemeEffectsShowcase from './pages/ThemeEffectsShowcase';
import BlogDetailPage from './pages/BlogDetailPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes with Navigation */}
          <Route path="/" element={<><Navigation /><AnnouncementBanner /><HomePage /></>} />
          <Route path="/games" element={<><Navigation /><AnnouncementBanner /><GamesPage /></>} />
          <Route path="/games/:id" element={<><Navigation /><AnnouncementBanner /><GameDetailPage /></>} />
          <Route path="/programs" element={<><Navigation /><AnnouncementBanner /><ProgramsPage /></>} />
          <Route path="/programs/:id" element={<><Navigation /><AnnouncementBanner /><ProgramDetailPage /></>} />
          <Route path="/blog" element={<><Navigation /><AnnouncementBanner /><BlogPage /></>} />
          <Route path="/blog/:id" element={<><Navigation /><AnnouncementBanner /><BlogDetailPage /></>} />
          <Route path="/profile" element={<ProfileRedirect />} />
          <Route path="/profile/:userId" element={<><Navigation /><AnnouncementBanner /><UserProfilePage /></>} />
          <Route path="/profile/edit" element={<><Navigation /><AnnouncementBanner /><ProfileEditPage /></>} />
          
          {/* Forum Routes */}
          <Route path="/forums" element={<><Navigation /><AnnouncementBanner /><ForumsPage /></>} />
          <Route path="/forums/login" element={<ForumLoginPage />} />
          <Route path="/forums/category/:slug" element={<><Navigation /><AnnouncementBanner /><ForumCategoryPage /></>} />
          <Route path="/forums/category/:slug/new" element={<><Navigation /><AnnouncementBanner /><NewThreadPage /></>} />
          <Route path="/forums/thread/:id" element={<><Navigation /><AnnouncementBanner /><ThreadPage /></>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/effects-showcase" element={<><Navigation /><ThemeEffectsShowcase /></>} />
          
          {/* Catch all route for 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
