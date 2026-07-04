import { Response } from 'express';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  code?: number;
}

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any
): Response => {
  const response: ApiResponse = {
    success,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export const sendSuccess = (
  res: Response,
  message: string,
  data?: any,
  statusCode = 200
): Response => {
  return sendResponse(res, statusCode, true, message, data);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  error?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    code: statusCode,
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
};

export const sendPaginatedResponse = (
  res: Response,
  message: string,
  data: any[],
  total: number,
  page: number,
  limit: number,
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

// Custom Error Class
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
