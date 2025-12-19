export interface OnboardingData {
  id?: string;
  name: string;
  email: string;
  startDate: string;
  documents: DocumentFile[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentFile {
  name: string;
  size: number;
  mimeType?: string;
  uri: string;
  base64?: string;
}

export interface OnboardingSubmitRequest {
  name: string;
  email: string;
  startDate: string;
  documents: DocumentFile[];
}

export interface OnboardingResponse {
  success: boolean;
  data?: OnboardingData;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}



