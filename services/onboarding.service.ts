import * as FileSystem from 'expo-file-system';
import {
    ApiError,
    OnboardingData,
    OnboardingResponse,
    OnboardingSubmitRequest,
} from '../types/onboarding';
import { apiClient } from '../utils/api';

export class OnboardingService {
  private static readonly ENDPOINTS = {
    SUBMIT: '/api/onboard',
    GET_BY_ID: (id: string) => `/api/onboard/${id}`,
  };

  /**
   * Convert file URI to base64 string
   */
  private static async fileToBase64(uri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting file to base64:', error);
      throw new Error('Failed to process file');
    }
  }

  /**
   * Submit onboarding data
   */
  static async submitOnboarding(
    data: OnboardingSubmitRequest
  ): Promise<OnboardingResponse> {
    try {
      // Convert document files to base64
      const documentsWithBase64 = await Promise.all(
        data.documents.map(async (doc) => {
          try {
            const base64 = await this.fileToBase64(doc.uri);
            return {
              ...doc,
              base64,
            };
          } catch (error) {
            console.error(`Error processing file ${doc.name}:`, error);
            return doc; // Return without base64 if conversion fails
          }
        })
      );

      const payload = {
        ...data,
        documents: documentsWithBase64,
        submittedAt: new Date().toISOString(),
      };

      const response = await apiClient.post<OnboardingResponse>(
        this.ENDPOINTS.SUBMIT,
        payload
      );

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message,
      };
    }
  }

  /**
   * Get onboarding data by ID
   */
  static async getOnboardingById(id: string): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.get<OnboardingResponse>(
        this.ENDPOINTS.GET_BY_ID(id)
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      return {
        success: false,
        error: apiError.message,
      };
    }
  }

  /**
   * Mock submission for demo purposes (when backend is not available)
   */
  static async mockSubmitOnboarding(
    data: OnboardingSubmitRequest
  ): Promise<OnboardingResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData: OnboardingData = {
          id: `onboard_${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        resolve({
          success: true,
          data: mockData,
          message: 'Onboarding submitted successfully (MOCK)',
        });
      }, 1500); // Simulate network delay
    });
  }

  /**
   * Validate onboarding data before submission
   */
  static validateOnboardingData(data: OnboardingSubmitRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    if (!data.startDate || data.startDate.trim().length === 0) {
      errors.push('Start date is required');
    }

    if (!data.documents || data.documents.length === 0) {
      errors.push('At least one document is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

