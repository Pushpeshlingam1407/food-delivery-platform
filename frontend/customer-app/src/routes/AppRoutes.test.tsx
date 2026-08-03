/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppRoutes } from './AppRoutes';
import { useAppContext } from '../../../shared/context/AppContext';
import api from '../../../shared/services/api';
import notify from '../../../shared/utils/toast';

vi.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="icon-ArrowRight" />,
  User: () => <div data-testid="icon-User" />,
  ShoppingBag: () => <div data-testid="icon-ShoppingBag" />,
  Clock: () => <div data-testid="icon-Clock" />,
  RotateCcw: () => <div data-testid="icon-RotateCcw" />,
  Home: () => <div data-testid="icon-Home" />,
  ClipboardList: () => <div data-testid="icon-ClipboardList" />,
  Truck: () => <div data-testid="icon-Truck" />,
  Wallet: () => <div data-testid="icon-Wallet" />,
  LogOut: () => <div data-testid="icon-LogOut" />,
  Store: () => <div data-testid="icon-Store" />,
  Users: () => <div data-testid="icon-Users" />,
  LayoutDashboard: () => <div data-testid="icon-LayoutDashboard" />,
}));

// Mock all imported components to isolate routing and Home component
vi.mock('../components/Navbar', () => ({ Navbar: () => <div data-testid="Navbar" /> }));
vi.mock('../../../shared/components/BitesNavbar', () => ({ BitesNavbar: () => <div data-testid="BitesNavbar" /> }));
vi.mock('../../../shared/components/AppSidebar', () => ({ AppSidebar: () => <div data-testid="AppSidebar" /> }));
vi.mock('../../../shared/components/MobileBottomNav', () => ({ MobileBottomNav: () => <div data-testid="MobileBottomNav" /> }));
vi.mock('../../../shared/components/ResponsiveFooter', () => ({ ResponsiveFooter: () => <div data-testid="ResponsiveFooter" /> }));
vi.mock('../pages/Login', () => ({ Login: () => <div data-testid="Login" /> }));
vi.mock('../pages/Register', () => ({ Register: () => <div data-testid="Register" /> }));
vi.mock('../pages/OtpLogin', () => ({ OtpLogin: () => <div data-testid="OtpLogin" /> }));
vi.mock('../pages/RestaurantDetails', () => ({ RestaurantDetails: () => <div data-testid="RestaurantDetails" /> }));
vi.mock('../components/CartDrawer', () => ({ CartDrawer: () => <div data-testid="CartDrawer" /> }));
vi.mock('../pages/Checkout', () => ({ Checkout: () => <div data-testid="Checkout" /> }));
vi.mock('../pages/OrderTracking', () => ({ OrderTracking: () => <div data-testid="OrderTracking" /> }));
vi.mock('../pages/CmsPage', () => ({ CmsPage: () => <div data-testid="CmsPage" /> }));
vi.mock('../pages/Orders', () => ({ Orders: () => <div data-testid="Orders" /> }));
vi.mock('../pages/AddressManager', () => ({ AddressManager: () => <div data-testid="AddressManager" /> }));
vi.mock('../pages/Profile', () => ({ Profile: () => <div data-testid="Profile" /> }));
vi.mock('../components/Shimmer', () => ({ ShimmerList: () => <div data-testid="ShimmerList" /> }));

// Admin Imports Mock
vi.mock('../../../admin-app/src/pages/Dashboard', () => ({ Dashboard: () => <div data-testid="AdminDashboard" /> }));
vi.mock('../../../admin-app/src/pages/RestaurantsManagement', () => ({ RestaurantsManagement: () => <div data-testid="AdminRestaurantsManagement" /> }));
vi.mock('../../../admin-app/src/pages/CustomersManagement', () => ({ CustomersManagement: () => <div data-testid="AdminCustomersManagement" /> }));
vi.mock('../../../admin-app/src/pages/OwnersManagement', () => ({ OwnersManagement: () => <div data-testid="AdminOwnersManagement" /> }));
vi.mock('../../../admin-app/src/pages/DriversManagement', () => ({ DriversManagement: () => <div data-testid="AdminDriversManagement" /> }));
vi.mock('../../../admin-app/src/pages/OrdersManagement', () => ({ OrdersManagement: () => <div data-testid="AdminOrdersManagement" /> }));
vi.mock('../../../admin-app/src/pages/ImagesManagement', () => ({ ImagesManagement: () => <div data-testid="AdminImagesManagement" /> }));
vi.mock('../../../admin-app/src/pages/Refunds', () => ({ Refunds: () => <div data-testid="AdminRefunds" /> }));
vi.mock('../../../admin-app/src/pages/Settings', () => ({ Settings: () => <div data-testid="AdminSettings" /> }));
vi.mock('../../../admin-app/src/pages/CMS', () => ({ CMS: () => <div data-testid="AdminCMS" /> }));
vi.mock('../../../admin-app/src/pages/VerificationCenter', () => ({ VerificationCenter: () => <div data-testid="AdminVerificationCenter" /> }));
vi.mock('../../../admin-app/src/pages/Campaigns', () => ({ Campaigns: () => <div data-testid="AdminCampaigns" /> }));

// Restaurant Imports Mock
vi.mock('../../../restaurant-app/src/pages/Dashboard', () => ({ Dashboard: () => <div data-testid="RestaurantDashboard" /> }));
vi.mock('../../../restaurant-app/src/pages/MenuManager', () => ({ MenuManager: () => <div data-testid="RestaurantMenuManager" /> }));
vi.mock('../../../restaurant-app/src/pages/Earnings', () => ({ Earnings: () => <div data-testid="RestaurantEarnings" /> }));

// Delivery Imports Mock
vi.mock('../../../delivery-app/src/routes/AppRoutes', () => ({ AppRoutes: () => <div data-testid="DeliveryAppRoutes" /> }));
vi.mock('../../../delivery-app/src/contexts/DeliveryContext', () => ({ DeliveryProvider: ({ children }: any) => <div data-testid="DeliveryProvider">{children}</div> }));

vi.mock('../../../shared/context/AppContext', () => ({
  useAppContext: vi.fn(),
}));

vi.mock('../../../shared/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../../../shared/utils/toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('AppRoutes (customer-app)', () => {
  const mockAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppContext as any).mockReturnValue({
      userEmail: null,
      userRole: 'customer',
      searchQuery: '',
      addToCart: mockAddToCart,
    });
    
    // Default API mock implementation
    (api.get as any).mockResolvedValue({ data: { status: 'success', data: [] } });

    // Mock localStorage
    const store = new Map();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store.get(key) || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => store.set(key, val));
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => store.delete(key));

    window.history.pushState({}, '', '/');
  });

  const setRole = (role: string) => {
    (useAppContext as any).mockReturnValue({
      userEmail: 'test@example.com',
      userRole: role,
      searchQuery: '',
      addToCart: mockAddToCart,
    });
    Storage.prototype.setItem('accessToken', 'mock-token');
  };

  it('renders Admin layout for admin role', () => {
    setRole('admin');
    render(<AppRoutes />);
    expect(screen.getByTestId('BitesNavbar')).toBeInTheDocument();
    expect(screen.getByTestId('AdminDashboard')).toBeInTheDocument();
    expect(screen.getByTestId('ResponsiveFooter')).toBeInTheDocument();
  });

  it('renders Restaurant layout for restaurant_owner role', () => {
    setRole('restaurant_owner');
    render(<AppRoutes />);
    expect(screen.getByTestId('BitesNavbar')).toBeInTheDocument();
    expect(screen.getByTestId('RestaurantDashboard')).toBeInTheDocument();
    expect(screen.getByTestId('ResponsiveFooter')).toBeInTheDocument();
  });

  it('renders Delivery layout for delivery_partner role', () => {
    setRole('delivery_partner');
    render(<AppRoutes />);
    expect(screen.getByTestId('DeliveryProvider')).toBeInTheDocument();
    expect(screen.getByTestId('DeliveryAppRoutes')).toBeInTheDocument();
  });

  it('renders Customer layout and Home for customer role at /', async () => {
    render(<AppRoutes />);
    expect(screen.getByTestId('Navbar')).toBeInTheDocument();
    expect(screen.getByTestId('MobileBottomNav')).toBeInTheDocument();
    expect(screen.getByTestId('CartDrawer')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Good food/)).toBeInTheDocument();
    });
  });

  describe('Home Component Integration', () => {
    it('fetches restaurants and orders on mount and clicks track order', async () => {
      Storage.prototype.setItem('accessToken', 'token');
      (useAppContext as any).mockReturnValue({ userEmail: 'user@ex.com', userRole: 'customer', searchQuery: 'pizza' });
      
      (api.get as any).mockImplementation(async (url: string) => {
        if (url.includes('/restaurants')) {
          return { data: { status: 'success', data: [{ id: '1', name: 'Pizza Palace', description: 'best pizza', status: 'open' }] } };
        }
        if (url.includes('/orders')) {
          return { data: { status: 'success', data: [
            { id: 'o1', status: 'preparing', restaurant_name: 'Pizza Palace' },
            { id: 'o2', status: 'delivered', restaurant_name: 'Burger King', order_number: '123' }
          ] } };
        }
      });

      render(<AppRoutes />);
      
      await screen.findAllByText('Pizza Palace');
      const orderAgainBtns = await screen.findAllByText(/Order Again/i);
      expect(orderAgainBtns.length).toBeGreaterThan(0);
      
      // Click on track order banner
      const trackBanners = await screen.findAllByText(/Track/i);
      if (trackBanners.length > 0) {
        fireEvent.click(trackBanners[0]);
      }
    });

    it('filters restaurants by category clicks', async () => {
      (api.get as any).mockResolvedValue({ 
        data: { 
          status: 'success', 
          data: [
            { id: '1', name: 'Burger King', description: 'burger place' },
            { id: '2', name: 'Pizza Hut', description: 'pizza place' }
          ] 
        } 
      });
      render(<AppRoutes />);
      
      await waitFor(() => expect(screen.getByText('Burger King')).toBeInTheDocument());
      
      // Click Burgers category
      fireEvent.click(screen.getByText(/Burgers/));
      expect(screen.getByText('Burger King')).toBeInTheDocument();
      expect(screen.queryByText('Pizza Hut')).not.toBeInTheDocument();
    });

    it('handles Order Again with available and unavailable items', async () => {
      Storage.prototype.setItem('accessToken', 'token');
      
      (api.get as any).mockImplementation(async (url: string) => {
        if (url.includes('/restaurants?')) return { data: { status: 'success', data: [] } };
        if (url === '/orders') return { data: { status: 'success', data: [{ id: 'o1', status: 'delivered', restaurant_name: 'R1' }] } };
        if (url.includes('/orders/o1')) {
          return { data: { status: 'success', data: { restaurant_id: 'r1', items: [{ menu_id: 'm1', name: 'M1', quantity: 1 }, { menu_id: 'm2', name: 'M2', quantity: 1 }] } } };
        }
        if (url.includes('/restaurants/r1/items')) {
          return { data: { status: 'success', data: [{ id: 'm1', name: 'M1', is_available: true }, { id: 'm2', name: 'M2', is_available: false }] } };
        }
      });

      render(<AppRoutes />);
      
      const orderAgainBtns = await screen.findAllByText(/Order Again/i);
      expect(orderAgainBtns.length).toBeGreaterThan(0);
      fireEvent.click(orderAgainBtns[orderAgainBtns.length - 1]);

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalledTimes(1);
        expect(notify.warning).toHaveBeenCalled();
        expect(notify.success).toHaveBeenCalled();
      });
    });

    it('handles Order Again failure gracefully', async () => {
      Storage.prototype.setItem('accessToken', 'token');
      (api.get as any).mockImplementation(async (url: string) => {
        if (url === '/orders') return { data: { status: 'success', data: [{ id: 'o1', status: 'delivered' }] } };
        if (url.includes('/orders/o1')) throw new Error('API Error');
        return { data: { status: 'success', data: [] } };
      });

      render(<AppRoutes />);
      const orderAgainBtns = await screen.findAllByText(/Order Again/i);
      expect(orderAgainBtns.length).toBeGreaterThan(0);
      fireEvent.click(orderAgainBtns[orderAgainBtns.length - 1]);

      await waitFor(() => {
        expect(notify.error).toHaveBeenCalledWith('Could not reorder. Please try again.');
      });
    });
  });

  describe('Customer Routes', () => {
    const routes = [
      { path: '/restaurant/123', component: 'RestaurantDetails', auth: false },
      { path: '/login', component: 'Login', auth: false },
      { path: '/register', component: 'Register', auth: false },
      { path: '/otp-login', component: 'OtpLogin', auth: false },
      { path: '/page/about', component: 'CmsPage', auth: false },
      { path: '/checkout', component: 'Checkout', auth: true },
      { path: '/track/123', component: 'OrderTracking', auth: true },
      { path: '/orders', component: 'Orders', auth: true },
      { path: '/addresses', component: 'AddressManager', auth: true },
      { path: '/profile', component: 'Profile', auth: true },
    ];

    routes.forEach(({ path, component, auth }) => {
      it(`renders ${component} at ${path} (auth: ${auth})`, async () => {
        if (auth) setRole('customer');
        window.history.pushState({}, '', path);
        render(<AppRoutes />);
        await waitFor(() => {
          expect(screen.getByTestId(component)).toBeInTheDocument();
        });
      });
    });

    it('redirects authenticated user away from auth routes', async () => {
      setRole('customer');
      window.history.pushState({}, '', '/login');
      render(<AppRoutes />);
      await waitFor(() => {
        expect(screen.queryByTestId('Login')).not.toBeInTheDocument();
      });
    });

    it('redirects unauthenticated user away from protected routes', async () => {
      window.history.pushState({}, '', '/checkout');
      render(<AppRoutes />);
      await waitFor(() => {
        expect(screen.getByTestId('Login')).toBeInTheDocument();
      });
    });
  });
});
