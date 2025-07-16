// Jest setup file for global test configuration

// Increase timeout for database operations
jest.setTimeout(10000);

// Mock console methods to reduce noise during testing
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Only show console outputs for failed tests
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Helper to create mock request object
  mockRequest: (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query,
    headers: {}
  }),
  
  // Helper to create mock response object
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },
  
  // Helper to create sample bug data
  sampleBugData: (overrides = {}) => ({
    title: 'Test Bug',
    description: 'Test bug description',
    reportedBy: 'John Doe',
    severity: 'Medium',
    status: 'Open',
    priority: 'Medium',
    assignedTo: 'Unassigned',
    tags: [],
    ...overrides
  })
};