import { test, expect } from '@playwright/test'

test.describe('Security', () => {
  test('admin API returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/admin/stats')
    expect(response.status()).toBe(401)
  })

  test('admin users API returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/admin/users')
    expect(response.status()).toBe(401)
  })

  test('admin verifications API returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/admin/verifications')
    expect(response.status()).toBe(401)
  })

  test('upload avatar returns 401 without auth', async ({ request }) => {
    const response = await request.post('/api/upload/avatar', {
      multipart: { file: { name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') }, userId: 'fake' }
    })
    expect(response.status()).toBe(401)
  })

  test('security headers are set', async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['strict-transport-security']).toBeDefined()
  })

  test('CORS restricted on API', async ({ request }) => {
    const response = await request.get('/api/admin/stats', {
      headers: { 'Origin': 'https://evil.com' }
    })
    const corsHeader = response.headers()['access-control-allow-origin']
    if (corsHeader) {
      expect(corsHeader).not.toBe('*')
    }
  })
})
