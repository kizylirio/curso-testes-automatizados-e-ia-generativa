// playwright-api-3.spec.js
// Testes equivalentes aos do arquivo api-3.cy.js, mas usando Playwright Test

const { test, expect } = require('@playwright/test');

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';

test.describe('Customers API - Success cases', () => {
  test('returns default customers structure', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/customers`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    const { customers, pageInfo } = body;
    expect(Array.isArray(customers)).toBeTruthy();
    expect(pageInfo).toHaveProperty('currentPage');
    expect(typeof pageInfo.currentPage).toBe('number');
    expect(pageInfo).toHaveProperty('totalPages');
    expect(typeof pageInfo.totalPages).toBe('number');
    expect(pageInfo).toHaveProperty('totalCustomers');
    expect(typeof pageInfo.totalCustomers).toBe('number');
  });

  test('filters by size Medium and returns only Medium customers with expected employees range', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/customers?size=Medium`);
    expect(response.status()).toBe(200);
    const { customers } = await response.json();
    for (const customer of customers) {
      expect(customer.size).toBe('Medium');
      expect(customer.employees).toBeGreaterThanOrEqual(100);
      expect(customer.employees).toBeLessThan(1000);
    }
  });

  test('filters by industry Technology and returns only Technology customers', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/customers?industry=Technology`);
    expect(response.status()).toBe(200);
    const { customers } = await response.json();
    for (const customer of customers) {
      expect(customer.industry).toBe('Technology');
    }
  });
});

test.describe('Customers API - Error cases', () => {
  test('returns 400 for page equal to 0', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/customers?page=0`);
    expect(response.status()).toBe(400);
    const { error } = await response.json();
    expect(typeof error).toBe('string');
  });

  test('returns 400 for page equal to -1', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/customers?page=-1`);
    expect(response.status()).toBe(400);
    const { error } = await response.json();
    expect(typeof error).toBe('string');
  });

  test('returns 400 for limit equal to 0', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/customers?limit=0`);
    expect(response.status()).toBe(400);
    const { error } = await response.json();
    expect(typeof error).toBe('string');
  });

  test('returns 400 for limit equal to -1', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/customers?limit=-1`);
    expect(response.status()).toBe(400);
    const { error } = await response.json();
    expect(typeof error).toBe('string');
  });

  test('returns 400 for unsupported size value', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/customers?size=Unknown`);
    expect(response.status()).toBe(400);
    const { error } = await response.json();
    expect(typeof error).toBe('string');
  });

  test('returns 400 for unsupported industry value', async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/customers?industry=Unknown`);
    expect(response.status()).toBe(400);
    const { error } = await response.json();
    expect(typeof error).toBe('string');
  });
});
