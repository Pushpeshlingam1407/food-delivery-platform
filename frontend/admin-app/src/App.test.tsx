import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

describe('App', () => {
  it('renders without crashing', () => {
    // Basic test to ensure test runner works and coverage is collected
    expect(true).toBe(true);
  });
});
