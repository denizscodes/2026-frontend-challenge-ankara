import '@testing-library/jest-dom';

// Mock Leaflet
jest.mock('leaflet', () => ({
  divIcon: jest.fn(),
  point: jest.fn(),
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: jest.fn(),
      },
    },
  },
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
