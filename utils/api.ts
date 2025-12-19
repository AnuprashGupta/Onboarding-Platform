import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError } from '../types/onboarding';

// Backend configuration - Update this with your actual backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-backend-url.workers.dev';

class ApiClient {
  private client: AxiosInstance;
  private sessionId: string;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Generate ephemeral session ID
    this.sessionId = this.generateSessionId();

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add session ID to headers
        config.headers['X-Session-ID'] = this.sessionId;
        
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response:`, response.status, response.data);
        return response;
      },
      (error: AxiosError) => {
        console.error('[API] Response error:', error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error
      const data = error.response.data as any;
      return {
        message: data?.message || data?.error || 'Server error occurred',
        code: `HTTP_${error.response.status}`,
        details: data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        details: error.message,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        details: error,
      };
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();



