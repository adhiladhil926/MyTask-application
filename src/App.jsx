import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { supabase } from './lib/supabase';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  if (!supabase) {
    return <main className="auth-page"><section className="card auth-card">
      <p className="small-heading">MY TASKS</p>
    
    </section></main>;
  }

  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/login" element={<AuthPage key="login" mode="login" />} />
    <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></AuthProvider></BrowserRouter>;
}
