export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  created_at: string
}

export interface CreateNotePayload {
  title: string
  content: string
  tags: string[]
}

export interface UpdateNotePayload {
  title?: string
  content?: string
  tags?: string[]
}
