// Simple authentication service
// In production, this should use proper hashing and server-side validation

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const validatePassword = (inputPassword: string): boolean => {
  // Simple comparison - in production, use proper hashing
  return inputPassword === ADMIN_PASSWORD;
};

export const isPasswordConfigured = (): boolean => {
  return !!ADMIN_PASSWORD && ADMIN_PASSWORD !== 'admin123';
};