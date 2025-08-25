export interface ErrorResponse {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorResponse['error'];
}
