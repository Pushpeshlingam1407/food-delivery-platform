import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../../shared/services/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.status === 'success') {
        const { accessToken, refreshToken, user } = response.data.data;
        
        // Strict role validation
        if (user.role !== 'delivery_partner' && user.role !== 'admin') {
          toast.error('Access Denied: Only delivery partners can sign in here.');
          setLoading(false);
          return;
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', `${user.first_name} ${user.last_name}`);
        
        toast.success(`Welcome back, ${user.first_name}!`);
        navigate('/');
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-squircle)',
          padding: '48px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-anthropic)',
            fontSize: '2rem',
            color: 'var(--text-slate)',
            marginBottom: '8px',
            fontWeight: 600,
          }}
        >
          Delivery Sign In
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '32px' }}>
          Access your logistics shift and wallet earnings
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-slate)' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@delivery.com"
              required
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-standard)',
                border: '1px solid var(--glass-border)',
                fontFamily: 'var(--font-apple)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-slate)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-standard)',
                border: '1px solid var(--glass-border)',
                fontFamily: 'var(--font-apple)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-premium"
            style={{
              padding: '14px',
              fontSize: '1rem',
              marginTop: '12px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
