import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ApiError'
    this.status = status
  }

  static from(error: unknown, context?: string): ApiError {
    if (error instanceof ApiError) return error

    if (axios.isAxiosError<{ error?: string } | undefined>(error)) {
      const status = error.response?.status
      const serverMessage = error.response?.data?.error
      const message =
        serverMessage ??
        (status === 502 || status === 503 || status === 504
          ? 'Backend is not reachable — is the rust-backend container running?'
          : error.code === 'ECONNABORTED'
            ? 'The request timed out'
            : (context ?? error.message))
      return new ApiError(message, status, { cause: error })
    }

    const message = error instanceof Error ? error.message : String(error)
    return new ApiError(
      context ? `${context}: ${message}` : message,
      undefined,
      {
        cause: error,
      },
    )
  }
}

export class ApiClient {
  private readonly http: AxiosInstance

  constructor(baseURL: string, config: AxiosRequestConfig = {}) {
    this.http = axios.create({
      baseURL,
      timeout: 30_000,
      headers: { Accept: 'application/json' },
      ...config,
    })

    this.http.interceptors.request.use(
      (request) => this.onRequest(request),
      (error: unknown) => Promise.reject(ApiError.from(error)),
    )
    this.http.interceptors.response.use(
      (response) => this.onResponse(response),
      (error: unknown) => this.onResponseError(error),
    )
  }

  private onRequest(request: InternalAxiosRequestConfig) {
    request.headers.set('X-Requested-With', 'colima-manager')
    if (import.meta.env.DEV) {
      console.debug(
        `[api] → ${request.method?.toUpperCase()} ${request.baseURL ?? ''}${request.url ?? ''}`,
      )
    }
    return request
  }

  private onResponse(response: AxiosResponse) {
    if (import.meta.env.DEV) {
      console.debug(
        `[api] ← ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url ?? ''}`,
      )
    }
    return response
  }

  private onResponseError(error: unknown) {
    const apiError = ApiError.from(error)
    if (import.meta.env.DEV) {
      console.debug(`[api] ✕ ${apiError.status ?? '-'} ${apiError.message}`)
    }
    return Promise.reject(apiError)
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.get<T>(url, config)
    return response.data
  }

  async post<T = unknown>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.http.post<T>(url, body, config)
    return response.data
  }

  async put<T = unknown>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.http.put<T>(url, body, config)
    return response.data
  }

  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.http.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient('/api')
