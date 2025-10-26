// Setup para Jest
// Aquí se pueden configurar mocks globales si es necesario

// Mock de Supabase si es necesario
global.supabase = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }))
};