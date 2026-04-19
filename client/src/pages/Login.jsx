import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowRight } from 'react-icons/hi2';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const { login, googleLogin, user, api } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      try {
        // Get user info from Google with access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const googleUser = await res.json();
        
        // Send to our backend
        await googleLogin(tokenResponse.access_token, 'farmer', googleUser);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
    }
  });

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage(res.data.message);
    } catch (err) {
      setForgotMessage(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🌾</div>
          <div className="auth-logo-text">FarmConnect</div>
        </div>

        {!forgotMode ? (
          <>
            <h1 id="login-heading">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your FarmConnect account</p>

            {error && (
              <div className="auth-alert auth-alert-error" id="login-error">
                <span className="auth-alert-icon">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} id="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  <HiOutlineEnvelope style={{verticalAlign: 'middle'}} /> Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="login-email"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
                    <HiOutlineLockClosed style={{verticalAlign: 'middle'}} /> Password
                  </label>
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => { setForgotMode(true); setForgotEmail(email); }}
                    id="forgot-password-link"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="auth-input-wrapper" style={{ marginTop: '0.5rem' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    id="login-password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading} id="login-submit">
                {loading ? (
                  <span className="auth-loading-spinner"></span>
                ) : (
                  <>Sign In <HiOutlineArrowRight /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              className="auth-google-btn"
              onClick={() => handleGoogleLogin()}
              id="google-signin-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="auth-footer">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </>
        ) : (
          <>
            <h1 id="forgot-heading">Reset Password</h1>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>

            {forgotMessage && (
              <div className="auth-alert auth-alert-success" id="forgot-message">
                <span className="auth-alert-icon">✅</span>
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPassword} id="forgot-form">
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  <HiOutlineEnvelope style={{verticalAlign: 'middle'}} /> Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  id="forgot-email"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={forgotLoading} id="forgot-submit">
                {forgotLoading ? (
                  <span className="auth-loading-spinner"></span>
                ) : (
                  <>Send Reset Link <HiOutlineArrowRight /></>
                )}
              </button>
            </form>

            <p className="auth-footer">
              Remember your password?{' '}
              <button className="auth-link-btn" onClick={() => setForgotMode(false)} id="back-to-login">
                Back to Sign In
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
