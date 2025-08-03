import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Resgister';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

// User Pages
import MusicBrowser from './pages/user/MusicBrowser';
import Playlists from './pages/user/Playlists';
import Favorites from './pages/user/Favorites';
import RecentPlays from './pages/user/RecentPlays';

// Admin Pages
import AdminSongs from './pages/admin/AdminSongs';
import AddSong from './pages/admin/AddSongs';
import EditSong from './pages/admin/EditSong';
import AdminUsers from './pages/admin/AdminUsers';
// import AdminAnalytics from './pages/admin/AdminAnalytics';
// import AdminSettings from './pages/admin/AdminSettings';

import './App.scss';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
        },
      }}
    >
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* User Dashboard */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute requiredRole="user">
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* User Pages */}
                <Route 
                  path="/music" 
                  element={
                    <ProtectedRoute requiredRole="user">
                      <MusicBrowser />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/playlists" 
                  element={
                    <ProtectedRoute requiredRole="user">
                      <Playlists />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/favorites" 
                  element={
                    <ProtectedRoute requiredRole="user">
                      <Favorites />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/recent" 
                  element={
                    <ProtectedRoute requiredRole="user">
                      <RecentPlays />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Panel */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Pages */}
                <Route 
                  path="/admin/songs" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminSongs />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/songs/add" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AddSong />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/songs/edit/:id" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <EditSong />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminUsers />
                    </ProtectedRoute>
                  } 
                />
                {/* <Route 
                  path="/admin/analytics" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminAnalytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminSettings />
                    </ProtectedRoute>
                  } 
                /> */}
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;