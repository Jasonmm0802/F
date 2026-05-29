let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// 如果在生產環境且 URL 不包含 /api，則自動補上
if (process.env.NODE_ENV === 'production' && !baseUrl.endsWith('/api') && !baseUrl.includes('localhost')) {
  baseUrl = baseUrl.replace(/\/$/, '') + '/api';
}
const BASE_URL = baseUrl.replace(/\/$/, '');

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(res.status, data.message || '請求失敗');
  }
  return data;
}

export const api = {
  async get<T>(endpoint: string, token?: string): Promise<T> {
    const url = `${BASE_URL}/${endpoint.replace(/^\//, '')}`;
    try {
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      return handleResponse<T>(res);
    } catch (error: any) {
      console.error(`API GET Error [${url}]:`, error);
      throw new Error('無法連線到伺服器，請檢查後端是否啟動');
    }
  },

  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    const url = `${BASE_URL}/${endpoint.replace(/^\//, '')}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return handleResponse<T>(res);
    } catch (error: any) {
      console.error(`API POST Error [${url}]:`, error);
      throw new Error('無法連線到伺服器，請檢查後端是否啟動');
    }
  },
};
