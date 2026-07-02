import axios from 'axios';
import config from '../../config';
import logout from '../logout';

// ─── Error ───────────────────────────────────────────────
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

// ─── HttpService ─────────────────────────────────────────
class HttpService {
  #client;

  constructor() {
    this.#client = axios.create({
      baseURL: config.api.baseURL,
      timeout: 15_000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.#setupInterceptors();
  }

  // ── Interceptors ─────────────────────────────────────
  #isAuthRequest(config) {
    const op = config?.params?.op;
    return op === 'm_login' || op === 'm_verify';
  }

  #handleAuthFailure() {
    logout();
  }

  #setupInterceptors() {
    // Request — attach auth token or finger when available
    this.#client.interceptors.request.use(req => {
      if (typeof window !== 'undefined') {
        const finger = localStorage.getItem('finger');
        if (finger) {
          req.params = { ...req.params, finger, name: 'Icms', file: 'json' };
        } else {
          req.params = { ...req.params, name: 'Icms', file: 'json' };
        }
      }
      return req;
    });

    // Response — unwrap { status, data, statusCode } envelope
    this.#client.interceptors.response.use(
      response => {
        const body = response.data;

        // API-level error inside a 2xx response (skip for endpoints that return raw data, e.g. m_version)
        if (!response.config?._skipStatusCheck && !(body?.status || body?.success)) {
          const statusCode = body?.statusCode || response.status;
          // LOGIN / AUTH FLOW DISABLED (temporary): do not force logout on auth failure.
          // if (typeof window !== 'undefined' && !this.#isAuthRequest(response.config) && (statusCode === 401 || statusCode === 403)) {
          //   this.#handleAuthFailure();
          // }
          return Promise.reject(
            new ApiError(
              body.message || 'درخواست با خطا مواجه شد',
              statusCode
            )
          );
        }

        // Allow opting out of unwrapping (e.g. to access meta for pagination)
        if (response.config?._returnFullBody) return body;

        // Return unwrapped data (or raw body for non-standard responses)
        return body?.data !== undefined ? body.data : body;
      },

      error => {
        // Already an ApiError (e.g. from success interceptor)
        if (error instanceof ApiError) return Promise.reject(error);

        // Cancelled by react-query unmount — let it propagate silently
        if (axios.isCancel(error)) return Promise.reject(error);

        // Server responded with error status (4xx / 5xx)
        if (error.response) {
          const status = error.response.status;
          // LOGIN / AUTH FLOW DISABLED (temporary): do not force logout on auth failure.
          // if (typeof window !== 'undefined' && !this.#isAuthRequest(error.config) && (status === 401 || status === 403)) {
          //   this.#handleAuthFailure();
          // }
          const msg = error.response.data?.message || `خطای سرور: ${status}`;
          return Promise.reject(new ApiError(msg, status));
        }

        // Timeout
        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new ApiError('زمان درخواست به پایان رسید', 408));
        }

        // Network / unknown
        return Promise.reject(new ApiError('خطا در برقراری ارتباط با سرور', 0));
      }
    );
  }

  // ── Public methods ───────────────────────────────────
  get(url, config) {
    return this.#client.get(url, config);
  }

  post(url, data, config) {
    return this.#client.post(url, data, config);
  }

  put(url, data, config) {
    return this.#client.put(url, data, config);
  }

  patch(url, data, config) {
    return this.#client.patch(url, data, config);
  }

  delete(url, config) {
    return this.#client.delete(url, config);
  }
}

// ─── Singleton ───────────────────────────────────────────
const http = new HttpService();

export default http;
export { http, ApiError };
