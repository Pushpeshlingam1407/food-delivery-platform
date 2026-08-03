import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContextProvider } from '../context/AppContext';

interface RenderWithRouterOptions extends RenderOptions {
  route?: string;
}

export const renderWithRouter = (
  ui: ReactElement,
  { route = '/', ...options }: RenderWithRouterOptions = {}
) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>,
    options
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', ...options }: RenderWithRouterOptions = {}
) => {
  return render(
    <AppContextProvider>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </AppContextProvider>,
    options
  );
};
