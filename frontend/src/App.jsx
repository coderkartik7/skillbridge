import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Upload from './pages/Upload';
import CareerMap from './pages/CareerMap';
import Roadmap from './pages/Roadmap';
import Dashboard from './pages/Dashboard';
import RoadmapTracker from './pages/RoadmapTracker';
import Jobs from './pages/Jobs';
import News from './pages/News';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Existing Core Screens */}
            <Route path="/" element={<Upload />} />
            <Route path="/map" element={<CareerMap />} />
            <Route path="/roadmap" element={<Roadmap />} />

            {/* Public News Screen */}
            <Route path="/news" element={<News />} />

            {/* Protected Screens */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:id"
              element={
                <ProtectedRoute>
                  <RoadmapTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
