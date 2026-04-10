import axios, { InternalAxiosRequestConfig } from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:9000',
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // small debug log for dev
    if (process.env.NODE_ENV === 'development') {
      try { console.debug('[axios] Request', config.method, config.url, { headers: config.headers }); } catch (e) { }
    }

    // Java LocalDateTime doesn't like 'Z' suffix from JS toISOString() in JSON
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      const stringify = JSON.stringify(config.data);
      // Clean date strings: replace both space and 'T' with 'T' and strip 'Z' suffix/offsets for LocalDateTime compatibility
      config.data = JSON.parse(stringify.replace(/(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2}(?:\.\d+)?)(?:Z|[+-][0-9:]{2,5})?/g, '$1T$2'));
    }

    return config;
  }
);

axiosInstance.interceptors.response.use(
  (resp) => resp,
  (error) => {
    try {
      const status = error?.response?.status
      if (status === 401) {
        // Prevent infinite redirect loops (e.g., if /login itself returns 401)
        if (window.location.pathname === '/login') return Promise.reject(error)

        console.warn('[axios] 401 Unauthorized — Token missing or expired. Clearing session and redirecting to login.')
        // Clear ALL auth-related keys, not just 'token', to avoid zombie Redux state
        try {
          localStorage.removeItem('token')
          localStorage.removeItem('userId')
          localStorage.removeItem('user')
          localStorage.removeItem('role')
          sessionStorage.clear()
        } catch (e) { }
        // Hard redirect so Redux store is fully reset on next page load
        try { window.location.href = '/login' } catch (e) { }
      }
    } catch (e) { }
    return Promise.reject(error)
  }
)

export default axiosInstance;