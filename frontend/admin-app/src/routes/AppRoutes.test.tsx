/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppRoutes } from './AppRoutes';

// Mock context
vi.mock('../../../shared/context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

// Mock shared components
vi.mock('../../../shared/components/AppSidebar', () => ({
  AppSidebar: ({ role, onLogout }: any) => (
    <div data-testid="AppSidebar">
      <button onClick={onLogout} data-testid="sidebar-logout">Logout</button>
    </div>
  ),
}));
vi.mock('../../../shared/components/BitesNavbar', () => ({
  BitesNavbar: ({ variant, onLogout }: any) => (
    <div data-testid="BitesNavbar">
      <button onClick={onLogout} data-testid="navbar-logout">Logout</button>
    </div>
  ),
}));

// Mock pages
vi.mock('../pages/Login', () => ({ Login: () => <div data-testid="Login" /> }));
vi.mock('../pages/Dashboard', () => ({ Dashboard: () => <div data-testid="Dashboard" /> }));
vi.mock('../pages/Refunds', () => ({ Refunds: () => <div data-testid="Refunds" /> }));
vi.mock('../pages/Settings', () => ({ Settings: () => <div data-testid="Settings" /> }));
vi.mock('../pages/CMS', () => ({ CMS: () => <div data-testid="CMS" /> }));
vi.mock('../pages/RestaurantsManagement', () => ({ RestaurantsManagement: () => <div data-testid="RestaurantsManagement" /> }));
vi.mock('../pages/CustomersManagement', () => ({ CustomersManagement: () => <div data-testid="CustomersManagement" /> }));
vi.mock('../pages/DriversManagement', () => ({ DriversManagement: () => <div data-testid="DriversManagement" /> }));
vi.mock('../pages/OrdersManagement', () => ({ OrdersManagement: () => <div data-testid="OrdersManagement" /> }));
vi.mock('../pages/ImagesManagement', () => ({ ImagesManagement: () => <div data-testid="ImagesManagement" /> }));
vi.mock('../pages/OwnersManagement', () => ({ OwnersManagement: () => <div data-testid="OwnersManagement" /> }));
vi.mock('../pages/VerificationCenter', () => ({ VerificationCenter: () => <div data-testid="VerificationCenter" /> }));
vi.mock('../pages/Campaigns', () => ({ Campaigns: () => <div data-testid="Campaigns" /> }));

import { useAppContext } from '../../../shared/context/AppContext';

describe('AppRoutes (admin-app)', () => {
  const mockHandleLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to unauthenticated
    (useAppContext as any).mockReturnValue({
      userEmail: null,
      handleLogout: mockHandleLogout,
    });
    // Clear history to start fresh
    window.history.pushState({}, '', '/');
  });

  const setAuthenticated = () => {
    (useAppContext as any).mockReturnValue({
      userEmail: 'admin@example.com',
      handleLogout: mockHandleLogout,
    });
    // Setting localStorage for adminName as used in component
    Storage.prototype.getItem = vi.fn((key) => {
      if (key === 'userName') return 'Admin Test';
      return null;
    });
  };

  it('renders Login page and no sidebars when unauthenticated at /', () => {
    render(<AppRoutes />);
    
    // It should redirect to /login and render Login
    expect(screen.getByTestId('Login')).toBeInTheDocument();
    expect(screen.queryByTestId('AppSidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('BitesNavbar')).not.toBeInTheDocument();
  });

  it('redirects to /login when unauthenticated at protected route', () => {
    window.history.pushState({}, '', '/restaurants');
    render(<AppRoutes />);
    expect(screen.getByTestId('Login')).toBeInTheDocument();
  });

  it('renders Dashboard and layout when authenticated at /', () => {
    setAuthenticated();
    render(<AppRoutes />);
    
    expect(screen.getByTestId('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('AppSidebar')).toBeInTheDocument();
    expect(screen.getByTestId('BitesNavbar')).toBeInTheDocument();
  });

  it('redirects from /login to / when authenticated', () => {
    setAuthenticated();
    window.history.pushState({}, '', '/login');
    render(<AppRoutes />);
    
    expect(screen.queryByTestId('Login')).not.toBeInTheDocument();
    expect(screen.getByTestId('Dashboard')).toBeInTheDocument();
  });

  // Test all protected routes
  const protectedRoutes = [
    { path: '/restaurants', testId: 'RestaurantsManagement' },
    { path: '/customers', testId: 'CustomersManagement' },
    { path: '/owners', testId: 'OwnersManagement' },
    { path: '/campaigns', testId: 'Campaigns' },
    { path: '/verification', testId: 'VerificationCenter' },
    { path: '/drivers', testId: 'DriversManagement' },
    { path: '/orders', testId: 'OrdersManagement' },
    { path: '/images', testId: 'ImagesManagement' },
    { path: '/refunds', testId: 'Refunds' },
    { path: '/settings', testId: 'Settings' },
    { path: '/cms', testId: 'CMS' },
  ];

  protectedRoutes.forEach(({ path, testId }) => {
    it(`renders ${testId} when authenticated at ${path}`, () => {
      setAuthenticated();
      window.history.pushState({}, '', path);
      render(<AppRoutes />);
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it(`redirects to login when unauthenticated at ${path}`, () => {
      window.history.pushState({}, '', path);
      render(<AppRoutes />);
      expect(screen.getByTestId('Login')).toBeInTheDocument();
    });
  });

  it('handles wildcard route by redirecting to /', () => {
    setAuthenticated();
    window.history.pushState({}, '', '/invalid-route-does-not-exist');
    render(<AppRoutes />);
    expect(screen.getByTestId('Dashboard')).toBeInTheDocument();
  });
});
