export function getRouterBasename(baseUrl: string) {
  return baseUrl === '/' ? baseUrl : baseUrl.replace(/\/$/, '')
}
