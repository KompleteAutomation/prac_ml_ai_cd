// Use environment variables if defined, otherwise fallback to defaults
export const credentials = {
  username: process.env.TEST_USER || 'sumit@gmail.com',
  password: process.env.TEST_PASSWORD || 'sumit',
};