import { describe, expect, it } from 'vitest'
import { getRouterBasename } from './routerBasename'

describe('getRouterBasename', () => {
  it.each([
    ['/', '/'],
    ['/specs/', '/specs'],
    ['/specs', '/specs'],
    ['/nested/path/', '/nested/path'],
  ])('normalizes %s to %s', (baseUrl, expected) => {
    expect(getRouterBasename(baseUrl)).toBe(expected)
  })
})
