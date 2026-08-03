/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { useAppContext } from '../../../shared/context/AppContext';
import { useDelivery } from '../hooks/useDelivery';

// Mock components
vi.mock('../components/Navbar', () => ({ Navbar: () => <div data-testid="Navbar" /> }));
vi.mock('../components/DeliverySidebar', () => ({ DeliverySidebar: () => <div data-testid="DeliverySidebar" /> }));
vi.mock('../../../shared/components/MobileBottomNav', () => ({ MobileBottomNav: () => <div data-testid="MobileBottomNav" /> }));
vi.mock('../../../shared/components/ResponsiveFooter', () => ({ ResponsiveFooter: ({ sections }: any) => (
  <div data-testid="ResponsiveFooter">
    <button data-testid="logout-btn" onClick={sections.find((s: any) => s.title === 'Support').links.find((l: any) => l.label === 'Logout').onClick}>Logout</button>
  </div>
)}));
vi.mock('../../../shared/components/VerificationGate', () => ({ VerificationGate: ({ children }: any) => <div data-testid="VerificationGate">{children}</div> }));

// Mock Pages
vi.mock('../pages/Login', () => ({ Login: () => <div data-testid="Login" /> }));
vi.mock('../pages/Register', () => ({ Register: () => <div data-testid="Register" /> }));
vi.mock('../pages/Dashboard', () => ({ Dashboard: () => <div data-testid="Dashboard" /> }));
vi.mock('../pages/DeliveryRequestsPage', () => ({ DeliveryRequestsPage: () => <div data-testid="DeliveryRequestsPage" /> }));
vi.mock('../pages/ActiveOrdersPage', () => ({ ActiveOrdersPage: () => <div data-testid="ActiveOrdersPage" /> }));
vi.mock('../pages/DeliveriesPage', () => ({ DeliveriesPage: () => <div data-testid="DeliveriesPage" /> }));
vi.mock('../pages/Earnings', () => ({ Earnings: () => <div data-testid="Earnings" /> }));
vi.mock('../pages/Ledger', () => ({ Ledger: () => <div data-testid="Ledger" /> }));
vi.mock('../pages/WalletPage', () => ({ WalletPage: () => <div data-testid="WalletPage" /> }));
vi.mock('../pages/ProfilePage', () => ({ ProfilePage: () => <div data-testid="ProfilePage" /> }));

vi.mock('../../../shared/context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

vi.mock('../hooks/useDelivery', () => ({
  useDelivery: vi.fn(),
}));

describe('AppRoutes (delivery-app)', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppContext as any).mockReturnValue({ userEmail: null });
    (useDelivery as any).mockReturnValue({ sidebarCollapsed: false, logout: mockLogout });
    window.history.pushState({}, '', '/');
  });

  describe('Unauthenticated Routes', () => {
    it('renders Login by default or at /login', () => {
      window.history.pushState({}, '', '/login');
      render(<BrowserRouter><AppRoutes /></BrowserRouter>);
      expect(screen.getByTestId('Login')).toBeInTheDocument();
    });

    it('renders Register at /register', () => {
      window.history.pushState({}, '', '/register');
      render(<BrowserRouter><AppRoutes /></BrowserRouter>);
      expect(screen.getByTestId('Register')).toBeInTheDocument();
    });

    it('redirects unknown route to /login', () => {
      window.history.pushState({}, '', '/unknown');
      render(<BrowserRouter><AppRoutes /></BrowserRouter>);
      expect(screen.getByTestId('Login')).toBeInTheDocument();
    });
  });

  describe('Authenticated Routes', () => {
    beforeEach(() => {
      (useAppContext as any).mockReturnValue({ userEmail: 'driver@test.com' });
    });

    it('renders authenticated layout with sidebar, navbar, and footer', () => {
      render(<BrowserRouter><AppRoutes /></BrowserRouter>);
      expect(screen.getByTestId('VerificationGate')).toBeInTheDocument();
      expect(screen.getByTestId('Navbar')).toBeInTheDocument();
      expect(screen.getByTestId('DeliverySidebar')).toBeInTheDocument();
      expect(screen.getByTestId('ResponsiveFooter')).toBeInTheDocument();
      expect(screen.getByTestId('MobileBottomNav')).toBeInTheDocument();
    });

    it('applies collapsed class to sidebar when sidebarCollapsed is true', () => {
      (useDelivery as any).mockReturnValue({ sidebarCollapsed: true, logout: mockLogout });
      render(<BrowserRouter><AppRoutes /></BrowserRouter>);
      const shell = document.querySelector('.delivery-sidebar-shell');
      expect(shell).toHaveClass('is-collapsed');
    });

    it('handles footer logout click', () => {
      render(<BrowserRouter><AppRoutes /></BrowserRouter>);
      fireEvent.click(screen.getByTestId('logout-btn'));
      expect(mockLogout).toHaveBeenCalled();
    });

    const authRoutes = [
      { path: '/', component: 'Dashboard' },
      { path: '/requests', component: 'DeliveryRequestsPage' },
      { path: '/deliveries', component: 'DeliveriesPage' },
      { path: '/active-orders', component: 'ActiveOrdersPage' },
      { path: '/assigned-jobs', component: 'ActiveOrdersPage' },
      { path: '/route', component: 'ActiveOrdersPage' },
      { path: '/earnings', component: 'Earnings' },
      { path: '/performance', component: 'Earnings' },
      { path: '/ledger', component: 'Ledger' },
      { path: '/wallet', component: 'WalletPage' },
      { path: '/profile', component: 'ProfilePage' },
      { path: '/notifications', component: 'Dashboard' },
      { path: '/support', component: 'ProfilePage' },
      { path: '/settings', component: 'ProfilePage' },
    ];

    authRoutes.forEach(({ path, component }) => {
      it(`renders ${component} at ${path}`, () => {
        window.history.pushState({}, '', path);
        render(<BrowserRouter><AppRoutes /></BrowserRouter>);
        expect(screen.getByTestId(component)).toBeInTheDocument();
      });
    });

    it('redirects unknown authenticated route to /', () => {
      window.history.pushState({}, '', '/unknown-route');
      render(<BrowserRouter><AppRoutes /></BrowserRouter>);
      expect(screen.getByTestId('Dashboard')).toBeInTheDocument();
    });
  });
});
