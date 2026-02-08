import { getAccessToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

type ApiBody =
  | Record<string, unknown>
  | string
  | FormData
  | URLSearchParams
  | Blob
  | ArrayBuffer
  | null
  | undefined

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  auth?: boolean
  body?: ApiBody
}

function parseErrorMessage(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof (payload as { error?: unknown }).error === 'string'
  ) {
    return (payload as { error: string }).error
  }

  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload
  }

  return fallback || 'Request failed'
}

export async function apiRequest<T = unknown>(
  path: string,
  { auth = true, headers, body, ...options }: ApiRequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers ?? {})
  let requestBody: BodyInit | undefined

  if (body !== undefined && body !== null) {
    const isRawBody =
      typeof body === 'string' ||
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof Blob ||
      body instanceof ArrayBuffer

    if (isRawBody) {
      requestBody = body as BodyInit
    } else {
      requestHeaders.set('Content-Type', 'application/json')
      requestBody = JSON.stringify(body)
    }
  }

  if (auth) {
    const token = getAccessToken()
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: requestHeaders,
    body: requestBody,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : await response.text()

  if (!response.ok) {
    throw new Error(parseErrorMessage(payload, response.statusText))
  }

  return payload as T
}
