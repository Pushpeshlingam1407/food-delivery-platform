import { vi } from 'vitest';

export const mockStorage = () => {
  const store = new Map<string, string>();
  const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => store.get(key) || null);
  const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => store.set(key, value.toString()));
  const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => store.delete(key));
  const clear = vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => store.clear());
  
  return { store, getItem, setItem, removeItem, clear };
};

export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

export const mockResizeObserver = () => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
};

export const mockIntersectionObserver = () => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: () => [],
  }));
};

export const mockToast = () => {
  const toast = {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    custom: vi.fn(),
    promise: vi.fn(),
  };
  return toast;
};

// Centralized setup for standard browser mocks
export const setupBrowserMocks = () => {
  mockMatchMedia();
  mockResizeObserver();
  mockIntersectionObserver();
  const storage = mockStorage();
  return { storage };
};
