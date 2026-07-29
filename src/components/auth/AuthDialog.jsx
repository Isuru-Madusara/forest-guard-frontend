import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ForestMap from '../dashboards/ForestMap';
import '../../assets/CSS/auth.scss';

// Axios default config
axios.defaults.baseURL = 'http://localhost:8000/api';
axios.defaults.headers.common['Accept'] = 'application/json';

// --- Subcomponents ---

const RoleSelection = ({ onSelectRole }) => (
  <div className="role-selection">
    <div className="role-card" onClick={() => onSelectRole('admin')}>
      <div className="role-icon">👑</div>
      <div className="role-info">
        <h4>Administrator</h4>
        <p>Manage the forest system & approve officers.</p>
      </div>
    </div>
    <div className="role-card" onClick={() => onSelectRole('forest_officer')}>
      <div className="role-icon">🌿</div>
      <div className="role-info">
        <h4>Forest Officer</h4>
        <p>Review requests & monitor replantation.</p>
      </div>
    </div>
    <div className="role-card" onClick={() => onSelectRole('company')}>
      <div className="role-icon">🏢</div>
      <div className="role-info">
        <h4>Company / Vendor</h4>
        <p>Submit cutting requests & track approvals.</p>
      </div>
    </div>
  </div>
);

const SignInForm = ({ role, onSubmit, error, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  return (
    <form className="auth-form" onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ email, password });
    }}>
      {error && <div className="alert alert-danger" style={{fontSize: '0.9rem', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(231, 111, 81, 0.2)', border: '1px solid #e76f51', color: '#ffb3a7'}}>{error}</div>}
      <div className="form-group">
        <label>Email Address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" placeholder="Enter your email" required />
      </div>
      <div className="form-group password-input-wrap">
        <label>Password</label>
        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="form-control" placeholder="Enter password" required />
        <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <div
        onClick={() => setRemember(!remember)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '1rem',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            minWidth: '18px',
            borderRadius: '4px',
            border: `2px solid ${remember ? '#3B6D11' : '#888'}`,
            backgroundColor: remember ? '#3B6D11' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
        >
          {remember && <span style={{ color: '#fff', fontSize: '12px', lineHeight: 1 }}>✓</span>}
        </div>
        <span style={{ fontSize: '0.9rem' }}>Remember me</span>
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
      <div className="auth-links">
        <a href="#forgot" >Forgot Password?</a>

      </div>
    </form>
  );
};

const RegisterIndividualForm = ({ role, onSubmit, error, loading }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

  return (
    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, role }); }}>
      {error && <div className="alert alert-danger" style={{fontSize: '0.9rem', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(231, 111, 81, 0.2)', border: '1px solid #e76f51', color: '#ffb3a7'}}>{error}</div>}
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" className="form-control" placeholder="John Doe" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" className="form-control" placeholder="john@example.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input type="tel" className="form-control" placeholder="+94 7X XXX XXXX" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" className="form-control" placeholder="Create a password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} minLength="8" />
      </div>
      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Registering...' : `Register as ${role === 'admin' ? 'Administrator' : 'Forest Officer'}`}
      </button>
    </form>
  );
};

const RegisterCompanyForm = ({ onSubmit, error, loading }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', company_name: '', registration_number: '', contact_person: '', address: '', map_coordinates: ''
  });
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng);
    setFormData({ ...formData, map_coordinates: JSON.stringify([latlng.lat, latlng.lng]) });
  };

  return (
    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, role: 'company' }); }}>
      {error && <div className="alert alert-danger" style={{fontSize: '0.9rem', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(231, 111, 81, 0.2)', border: '1px solid #e76f51', color: '#ffb3a7'}}>{error}</div>}

      <div className="form-group">
        <label>Company Email (Login)</label>
        <input type="email" className="form-control" placeholder="contact@company.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" className="form-control" placeholder="Create a password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} minLength="8" />
      </div>

      <div className="form-group">
        <label>Company Name</label>
        <input type="text" className="form-control" placeholder="e.g. Green Timber Ltd." required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value, name: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Business Registration Number</label>
        <input type="text" className="form-control" placeholder="e.g. PV 123456" required value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Contact Person</label>
        <input type="text" className="form-control" placeholder="Full Name" required value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input type="tel" className="form-control" placeholder="+94 7X XXX XXXX" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Registered Address</label>
        <input type="text" className="form-control" placeholder="Full Address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
      </div>

      <div className="form-group">
        <label>Set Operating Location (Click on Map)</label>
        <ForestMap
          height="250px"
          onMapClick={handleMapClick}
          markers={selectedLocation ? [{ position: [selectedLocation.lat, selectedLocation.lng], title: 'Selected Location', description: 'Your operating base' }] : []}
        />
        {selectedLocation && (
          <small className="text-success d-block mt-2 mb-3">
            Location Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </small>
        )}
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Registering Company...' : 'Register Company'}
      </button>
    </form>
  );
};

const SuccessMessage = ({ mode, role, onClose }) => {
  let message = "You have successfully signed in.";
  if (mode === 'register') {
    if (role === 'company') {
      message = "Your company registration has been submitted and is pending verification. You will be notified once approved.";
    } else {
      message = "Your account has been created successfully. Welcome to Forest Guard!";
    }
  }

  return (
    <div className="auth-success">
      <div className="success-icon">✅</div>
      <h4>Success!</h4>
      <p>{message}</p>
      <button className="btn-submit" onClick={onClose}>Continue to Dashboard</button>
    </div>
  );
};


// --- Main Dialog Component ---

const AuthDialog = ({ isOpen, initialMode = 'signin', initialRole = null, onClose }) => {
  const [mode, setMode] = useState(initialMode); // 'signin' or 'register'
  const [role, setRole] = useState(initialRole); // 'admin', 'forest_officer', 'company', or null
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reset state when dialog is opened/closed
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRole(initialRole);
      setShowSuccess(false);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const handleRegister = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.post('/register', data);
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setShowSuccess(true);
    } catch (err) {
      if (err.response && err.response.data.errors) {
        // Grab the first error message
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        setError(err.response.data.errors[firstErrorKey][0]);
      } else {
        setError(err.response?.data?.message || 'An error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.post('/login', data);
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setShowSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    onClose();
    if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'forest_officer') navigate('/officer-dashboard');
    else navigate('/company-dashboard');
  };

  const getTitle = () => {
    if (showSuccess) return "";
    if (!role) return mode === 'signin' ? "Sign In to Forest Guard" : "Register for Forest Guard";

    let roleText = role === 'admin' ? 'Admin' : role === 'forest_officer' ? 'Forest Officer' : 'Company';
    return `${mode === 'signin' ? 'Sign In' : 'Register'} as ${roleText}`;
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-dialog-glass" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="auth-dialog-header">
          {role && !showSuccess ? (
            <button className="back-btn" onClick={() => { setRole(null); setError(null); }}>
              <span>←</span> Back
            </button>
          ) : <div></div>}

          <h3>{getTitle()}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div className="auth-dialog-body">
          {showSuccess ? (
            <SuccessMessage mode={mode} role={role} onClose={handleContinue} />
          ) : !role ? (
            <RoleSelection onSelectRole={(r) => { setRole(r); setError(null); }} />
          ) : mode === 'signin' ? (
            <SignInForm role={role} onSubmit={handleLogin} error={error} loading={loading} />
          ) : role === 'company' ? (
            <RegisterCompanyForm onSubmit={handleRegister} error={error} loading={loading} />
          ) : (
            <RegisterIndividualForm role={role} onSubmit={handleRegister} error={error} loading={loading} />
          )}
        </div>

        {/* Footer (Toggle Mode) */}
        {!showSuccess && (
          <div className="auth-footer">
            {mode === 'signin' ? (
              <>
                Don't have an account?
                <button className="mode-switch-btn" onClick={() => { setMode('register'); setError(null); }}>
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?
                <button className="mode-switch-btn" onClick={() => { setMode('signin'); setError(null); }}>
                  Sign In instead
                </button>
              </>
            )

            }
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthDialog;