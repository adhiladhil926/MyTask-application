import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { user, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setMessage('');
    if (isSignup && !name.trim()) return setError('Please enter your name.');
    if (isSignup && password.length < 8) return setError('Use at least 8 characters for your password.');
    if (isSignup && password !== confirmPassword) return setError('Passwords do not match.');
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin + '/' }
        });
        if (error) throw error;
        if (!data.session) {
          setMessage('Check your email for a confirmation link. If you already have an account, try logging in.');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  // if (loading) return <main className="auth-page"><p role="status">Loading...</p></main>;
  if (user) return <Navigate to="/dashboard" replace />;

  return <main className="auth-page"><section className="card auth-card">
    <p className="small-heading">MY TASKS</p>
    <h1>{isSignup ? 'Create an account' : 'Welcome back'}</h1>
    <p className="muted">A little planning for a more productive day.</p>
    <form onSubmit={handleSubmit}>
      <fieldset disabled={busy}>
        {isSignup && <label>Full name<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={100} required /></label>}
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} required />
          {isSignup && <small>At least 8 characters</small>}
        </label>
        {isSignup && <label>Confirm password<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" required /></label>}
        {error && <p className="error" role="alert">{error}</p>}
        {message && <p className="success" role="status">{message}</p>}
        <button className="full-width" type="submit">{busy ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}</button>
      </fieldset>
    </form>
    <p className="auth-footer">{isSignup ? 'Already have an account? ' : 'New here? '}
      <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create an account'}</Link>
    </p>
  </section></main>;
}
