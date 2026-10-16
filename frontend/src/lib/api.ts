const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = RAW_BASE_URL.endsWith('/') 
  ? RAW_BASE_URL.slice(0, -1) 
  : RAW_BASE_URL;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  
  // Attach auth token if available
  const token = localStorage.getItem('token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let bodyContent: BodyInit | undefined;

  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      bodyContent = options.body;
      // Do NOT set Content-Type header so browser automatically sets multipart boundary!
      headers.delete('Content-Type');
    } else if (typeof options.body === 'string') {
      bodyContent = options.body;
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    } else {
      bodyContent = JSON.stringify(options.body);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      body: bodyContent,
    });
  } catch (error) {
    throw new ApiError(
      'Network connection failed. Please ensure the backend server is running.',
      0,
      error
    );
  }

  if (response.status === 401) {
    // Session expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData: unknown = null;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null) {
          const typedData = errorData as Record<string, unknown>;
          if (typeof typedData.message === 'string') {
            errorMessage = typedData.message;
          } else if (typeof typedData.error === 'string') {
            errorMessage = typedData.error;
          }
        }
      } else {
        const text = await response.text();
        if (text) errorMessage = text;
      }
    } catch {
      // ignore json parse error on error response
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as unknown as T;
}

export async function requestBlob(endpoint: string, options: RequestOptions = {}): Promise<Blob> {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem('token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { body: _unused, ...fetchOptions } = options;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(`Failed to fetch file (${response.status})`, response.status);
  }

  return await response.blob();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'POST', body }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'PUT', body }),
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
  getBlob: (endpoint: string, options?: RequestOptions) =>
    requestBlob(endpoint, options),
};
