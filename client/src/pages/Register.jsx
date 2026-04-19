import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const { register, googleLogin, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  // Validation helpers
  const validations = {
    name: formData.name.length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    password: formData.password.length >= 6,
    confirmPassword: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return { level: 0, text: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { level: 1, text: 'Weak', color: 'var(--color-error)' };
    if (score <= 3) return { level: 2, text: 'Medium', color: 'var(--color-warning)' };
    return { level: 3, text: 'Strong', color: 'var(--color-success)' };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!validations.name) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!validations.email) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validations.password) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!validations.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = formData;
      await register(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setError('');
      setLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const googleUser = await res.json();
        await googleLogin(tokenResponse.access_token, formData.role, googleUser);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-up failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-up was cancelled or failed.');
    }
  });

  const ValidationIcon = ({ valid, fieldTouched }) => {
    if (!fieldTouched) return null;
    return valid ? (
      <HiOutlineCheckCircle style={{ color: 'var(--color-success)', fontSize: '1.1rem' }} />
    ) : (
      <HiOutlineXCircle style={{ color: 'var(--color-error)', fontSize: '1.1rem' }} />
    );
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>

      <div className="auth-card auth-card-wide">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🌱</div>
          <div className="auth-logo-text">FarmConnect</div>
        </div>

        <h1 id="register-heading">Create Account</h1>
        <p className="auth-subtitle">Join FarmConnect and start your journey</p>

        {error && (
          <div className="auth-alert auth-alert-error" id="register-error">
            <span className="auth-alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className="role-selector">
          <div
            className={`role-option ${formData.role === 'farmer' ? 'selected' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'farmer' })}
            id="role-farmer"
          >
            <div className="role-icon">🧑‍🌾</div>
            <div className="role-name">Farmer</div>
            <div className="role-desc">Sell your crops directly</div>
          </div>
          <div
            className={`role-option ${formData.role === 'buyer' ? 'selected' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'buyer' })}
            id="role-buyer"
          >
            <div className="role-icon">🛒</div>
            <div className="role-name">Buyer</div>
            <div className="role-desc">Buy fresh produce</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} id="register-form">
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              <HiOutlineUser style={{verticalAlign: 'middle'}} /> Full Name
              <ValidationIcon valid={validations.name} fieldTouched={touched.name} />
            </label>
            <input
              type="text"
              name="name"
              className={`form-input ${touched.name ? (validations.name ? 'input-valid' : 'input-invalid') : ''}`}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              required
              id="register-name"
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              <HiOutlineEnvelope style={{verticalAlign: 'middle'}} /> Email Address
              <ValidationIcon valid={validations.email} fieldTouched={touched.email} />
            </label>
            <input
              type="email"
              name="email"
              className={`form-input ${touched.email ? (validations.email ? 'input-valid' : 'input-invalid') : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              required
              id="register-email"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              <HiOutlineLockClosed style={{verticalAlign: 'middle'}} /> Password
              <ValidationIcon valid={validations.password} fieldTouched={touched.password} />
            </label>
            <div className="auth-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`form-input ${touched.password ? (validations.password ? 'input-valid' : 'input-invalid') : ''}`}
                placeholder="Create a password (min 6 chars)"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                required
                id="register-password"
                autoComplete="new-password"
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
            {/* Password Strength Meter */}
            {formData.password && (
              <div className="password-strength">
                <div className="password-strength-bar">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: `${(strength.level / 3) * 100}%`,
                      background: strength.color
                    }}
                  ></div>
                </div>
                <span className="password-strength-text" style={{ color: strength.color }}>
                  {strength.text}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">
              <HiOutlineLockClosed style={{verticalAlign: 'middle'}} /> Confirm Password
              <ValidationIcon valid={validations.confirmPassword} fieldTouched={touched.confirmPassword} />
            </label>
            <div className="auth-input-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                className={`form-input ${touched.confirmPassword ? (validations.confirmPassword ? 'input-valid' : 'input-invalid') : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                required
                id="register-confirm-password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg auth-submit-btn"
            disabled={loading}
            id="register-submit"
          >
            {loading ? (
              <span className="auth-loading-spinner"></span>
            ) : (
              <>Create Account <HiOutlineArrowRight /></>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or sign up with</span>
        </div>

        {/* Google Sign-Up */}
        <button
          type="button"
          className="auth-google-btn"
          onClick={() => handleGoogleSignUp()}
          id="google-signup-btn"
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
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
