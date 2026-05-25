import type { CreateJournalEntryPayload, JournalEntry, WorkType } from './types'

const API_BASE =
  typeof import.meta.env.VITE_API_URL === 'string' &&
  import.meta.env.VITE_API_URL.length > 0
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
    : '/api'

function formatApiError(body: unknown, status: number): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    Array.isArray((body as { message: unknown }).message)
  ) {
    return (body as { message: string[] }).message.join(', ')
  }
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof (body as { message: unknown }).message === 'string'
  ) {
    return (body as { message: string }).message
  }
  return `Ошибка запроса (${status})`
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(formatApiError(body, status))
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : undefined
  if (!res.ok) {
    throw new ApiRequestError(res.status, data)
  }
  return data as T
}

export function getWorkTypes(): Promise<WorkType[]> {
  return requestJson<WorkType[]>('/work-types')
}

export function createWorkType(payload: { name: string }): Promise<WorkType> {
  return requestJson<WorkType>('/work-types', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getJournalEntries(params: {
  from?: string
  to?: string
  sortOrder?: 'ASC' | 'DESC'
}): Promise<JournalEntry[]> {
  const q = new URLSearchParams()
  if (params.from) q.set('from', params.from)
  if (params.to) q.set('to', params.to)
  if (params.sortOrder) q.set('sortOrder', params.sortOrder)
  const qs = q.toString()
  return requestJson<JournalEntry[]>(
    `/journal-entries${qs ? `?${qs}` : ''}`,
  )
}

export function createJournalEntry(
  payload: CreateJournalEntryPayload,
): Promise<JournalEntry> {
  return requestJson<JournalEntry>('/journal-entries', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateJournalEntry(
  id: string,
  payload: Partial<CreateJournalEntryPayload>,
): Promise<JournalEntry> {
  return requestJson<JournalEntry>(`/journal-entries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteJournalEntry(id: string): Promise<void> {
  return requestJson(`/journal-entries/${id}`, { method: 'DELETE' })
}

export function toDateInputValue(isoOrDate: string): string {
  if (isoOrDate.length >= 10) return isoOrDate.slice(0, 10)
  return isoOrDate
}
