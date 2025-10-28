import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage({ onAuthComplete }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((previous) => ({ ...previous, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        await register(formData.username, formData.password);
      }
      onAuthComplete?.();
    } catch (err) {
      const status = err.response?.status ? `(${err.response.status}) ` : '';
      const message = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      setError(`${status}${message}`);
    }
  };

  return (
    <section className="auth-hero">
      <div className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">Welcome to ExpoEvents</span>
          <h1>{isLogin ? 'Sign back in' : 'Create your account'}</h1>
          <p>Discover exhibitions, bookmark future plans, and stay in the loop with tailored reminders.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="form-alert">{error}</div>}
          <label className="input-field" htmlFor="username">
            <span>Username</span>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>
          <label className="input-field" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" className="primary-button">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <div className="auth-switch">
          <span>{isLogin ? "Don't have an account?" : 'Already registered?'}</span>
          <button type="button" className="link-button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create one' : 'Sign in instead'}
          </button>
        </div>
      </div>
    </section>
  );
}
