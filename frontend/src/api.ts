import type { Note, CreateNotePayload, UpdateNotePayload } from './types'

const rawUrl = import.meta.env.VITE_API_URL || 'https://devops-notes-434044738120.asia-south1.run.app'
const API_URL = rawUrl.replace(/\/$/, '')

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail || `Request failed with status ${res.status}`)
  }
  return res.json()
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${API_URL}/notes`)
  return handleResponse<Note[]>(res)
}

export async function searchNotes(q: string): Promise<Note[]> {
  const res = await fetch(`${API_URL}/notes/search?q=${encodeURIComponent(q)}`)
  return handleResponse<Note[]>(res)
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
  const res = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse<Note>(res)
}

export async function updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse<Note>(res)
}

export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' })
  await handleResponse<{ message: string }>(res)
}

export { API_URL }
