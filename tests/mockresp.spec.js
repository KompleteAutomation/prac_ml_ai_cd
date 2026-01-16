import { test, expect } from '@playwright/test';

test(
  'Mock API Integration Test',
  { tags: ['@api', '@mock', '@integration', '@medium'] },
  async ({ page, request }) => {
    // Intercept requests to a specific API endpoint
    await page.route('**/api/data', async (route) => {
      // You can modify the response
      const request = route.request();
      let body = {};
      try {
        body = await request.postDataJSON() || {};
      } 
      catch (e) {
          body = {};
        // Handle cases where there is no JSON body
      }   
      
      let responseBody = { message: 'Default response' };
      if (body.role === 'admin') {
        responseBody = {permission:['all'], message: 'Hello Admin!', name: 'Admin' };

      }
      else if (body.role === 'employee') {
        responseBody = { permission: ['read', 'write'], message: 'Hello Employee!', name: 'Employee' };
      } else if (body.role === 'guest') {
        responseBody = { permission: ['read'], message: 'Hello Guest!', name: 'Guest' };
      }
      const mockedResponse = {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseBody)
      };
      await route.fulfill(mockedResponse);
    });

    // Trigger the request in the page
    await page.goto('https://example.com');

    // Assume the page makes a fetch to /api/data
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/data',{
          method: 'POST',
          body: JSON.stringify({ role: 'admin' }),
          headers: {
              'Content-Type': 'application/json'
          }
      });
      return res.json();
    });

    console.log(response); // { message: 'Hello from mock!' }
    
  expect(response.message).toBe('Hello Admin!');
  expect(response.permission).toEqual(['all']);
  expect(response.name).toBe('Admin');
  }
);
