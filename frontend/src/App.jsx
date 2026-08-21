import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ResumeInput from './pages/ResumeInput';
import MatchResults from './pages/MatchResults';
import GapAnalysis from './pages/GapAnalysis';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ResumeInput />} />
        <Route path="/matches" element={<MatchResults />} />
        <Route path="/gap" element={<GapAnalysis />} />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
