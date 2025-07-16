const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  },
} as const;

export default config;

// 便捷函数用于构建API URL
export function buildApiUrl(endpoint: string): string {
  return `${config.api.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}
