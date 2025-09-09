import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken, getTenantId } from '@/hooks/auth-context';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    const tenantId = getTenantId();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers['X-ACCOUNT-ID'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const refreshToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
      {},
      { withCredentials: true }
    );
    
    if (response.data?.accessToken) {
      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken || ''
      };
    }
    
    throw new Error('Token de atualização inválido');
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    throw error;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/signin') || originalRequest.url?.includes('/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const { accessToken, refreshToken: newRefreshToken } = await refreshToken();
        
        Cookies.set('token', accessToken, { expires: 7 });
        if (newRefreshToken) {
          Cookies.set('refreshToken', newRefreshToken, { expires: 7 });
        }
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Falha ao renovar token:', refreshError);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Tratamento de outros erros
    if (error.response) {
      // Erros 4xx e 5xx
      console.error('Erro na resposta da API:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Sem resposta do servidor:', error.request);
    } else {
      // Erro ao configurar a requisição
      console.error('Erro na requisição:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
