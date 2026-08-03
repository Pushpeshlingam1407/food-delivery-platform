/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock child components
vi.mock('./routes/AppRoutes', () => ({
  AppRoutes: () => <div data-testid="AppRoutes" />
}));

vi.mock('sonner', () => ({
  Toaster: (props: any) => <div data-testid="Toaster" data-position={props.position} data-richcolors={props.richColors?.toString()} />
}));

vi.mock('../../shared/context/AppContext', () => ({
  AppContextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="AppContextProvider">{children}</div>
  )
}));

describe('App (admin-app)', () => {
  it('renders the layout providers, routes, and toaster', () => {
    render(<App />);
    
    // Verify provider wraps everything
    const provider = screen.getByTestId('AppContextProvider');
    expect(provider).toBeInTheDocument();
    
    // Verify children are rendered inside provider
    expect(screen.getByTestId('AppRoutes')).toBeInTheDocument();
    
    const toaster = screen.getByTestId('Toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveAttribute('data-position', 'top-right');
    expect(toaster).toHaveAttribute('data-richcolors', 'true');
  });
});
