import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Upload from './pages/Upload';
import CareerMap from './pages/CareerMap';
import Roadmap from './pages/Roadmap';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/map" element={<CareerMap />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
