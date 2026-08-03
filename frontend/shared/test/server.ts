import { vi } from 'vitest';
import api from '../services/api';

export const mockApi = {
  get: vi.spyOn(api, 'get'),
  post: vi.spyOn(api, 'post'),
  put: vi.spyOn(api, 'put'),
  delete: vi.spyOn(api, 'delete'),
  patch: vi.spyOn(api, 'patch'),
};

export const resetApiMocks = () => {
  mockApi.get.mockReset();
  mockApi.post.mockReset();
  mockApi.put.mockReset();
  mockApi.delete.mockReset();
  mockApi.patch.mockReset();
};

export const setupApiSuccess = (urlPattern: RegExp | string, data: any) => {
  mockApi.get.mockImplementation(async (url: string) => {
    if (typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url)) {
      return { data: { status: 'success', data } };
    }
    return { data: { status: 'success', data: {} } };
  });
};

export const setupApiError = (urlPattern: RegExp | string, status = 400, message = 'Error') => {
  mockApi.get.mockImplementation(async (url: string) => {
    if (typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url)) {
      const error: any = new Error(message);
      error.response = { status, data: { message, status: 'error' } };
      return Promise.reject(error);
    }
    return { data: { status: 'success', data: {} } };
  });
};
