import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchNotes, createNote, updateNote, deleteNote } from '../api'
import type { Note, CreateNotePayload, UpdateNotePayload } from '../types'
import toast from 'react-hot-toast'

export function useNotes() {
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const loadNotes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchNotes()
      setAllNotes(data)
    } catch (err) {
      toast.error('Failed to load notes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const notes = useMemo(() => {
    let result = allNotes

    if (activeTag) {
      result = result.filter((note) =>
        note.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase())
      )
    }

    const query = searchQuery.trim().toLowerCase()
    if (query) {
      result = result.filter((note) => {
        const inTitle = note.title.toLowerCase().includes(query)
        const inContent = note.content.toLowerCase().includes(query)
        const inTags = note.tags.some((tag) => tag.toLowerCase().includes(query))
        return inTitle || inContent || inTags
      })
    }

    return result
  }, [allNotes, searchQuery, activeTag])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleTagClick = useCallback((tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setActiveTag(null)
  }, [])

  const addNote = useCallback(async (payload: CreateNotePayload) => {
    try {
      await createNote(payload)
      toast.success('Note created successfully')
      await loadNotes()
      return true
    } catch (err) {
      toast.error('Failed to create note')
      console.error(err)
      return false
    }
  }, [loadNotes])

  const editNote = useCallback(async (id: string, payload: UpdateNotePayload) => {
    try {
      await updateNote(id, payload)
      toast.success('Note updated successfully')
      await loadNotes()
      return true
    } catch (err) {
      toast.error('Failed to update note')
      console.error(err)
      return false
    }
  }, [loadNotes])

  const removeNote = useCallback(async (id: string) => {
    try {
      await deleteNote(id)
      toast.success('Note deleted')
      setAllNotes((prev) => prev.filter((n) => n.id !== id))
      return true
    } catch (err) {
      toast.error('Failed to delete note')
      console.error(err)
      return false
    }
  }, [])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  return {
    notes,
    allNotes,
    loading,
    searchQuery,
    activeTag,
    setSearchQuery: handleSearchChange,
    setActiveTag: handleTagClick,
    clearFilters,
    refresh: loadNotes,
    addNote,
    editNote,
    removeNote,
  }
}
