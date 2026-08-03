/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('../../shared/utils/toast', () => ({
  ToastProvider: () => <div data-testid="ToastProvider" />
}));

vi.mock('./routes/AppRoutes', () => ({
  AppRoutes: () => <div data-testid="AppRoutes" />
}));

vi.mock('../../shared/context/AppContext', () => ({
  AppContextProvider: ({ children }: any) => <div data-testid="AppContextProvider">{children}</div>
}));

vi.mock('./contexts/DeliveryContext', () => ({
  DeliveryProvider: ({ children }: any) => <div data-testid="DeliveryProvider">{children}</div>
}));

describe('App (delivery-app)', () => {
  it('renders AppContextProvider, DeliveryProvider, AppRoutes, and ToastProvider', () => {
    render(<App />);
    expect(screen.getByTestId('AppContextProvider')).toBeInTheDocument();
    expect(screen.getByTestId('DeliveryProvider')).toBeInTheDocument();
    expect(screen.getByTestId('AppRoutes')).toBeInTheDocument();
    expect(screen.getByTestId('ToastProvider')).toBeInTheDocument();
  });
});
