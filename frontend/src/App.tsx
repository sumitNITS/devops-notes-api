import { useState, useEffect, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import { useNotes } from './hooks/useNotes'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { StatsBar } from './components/StatsBar'
import { NoteForm } from './components/NoteForm'
import { NoteCard } from './components/NoteCard'
import { NoteModal } from './components/NoteModal'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { EmptyState } from './components/EmptyState'
import { RefreshCw, X, Hash, Keyboard } from 'lucide-react'
import type { Note } from './types'

export default function App() {
  const {
    notes,
    allNotes,
    loading,
    searchQuery,
    activeTag,
    setSearchQuery,
    setActiveTag,
    clearFilters,
    refresh,
    addNote,
    editNote,
    removeNote,
  } = useNotes()

  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        const btn = document.querySelector<HTMLButtonElement>('button[data-new-note]')
        btn?.click()
      }
      if (e.key === 'Escape') {
        setSelectedNote(null)
        setShowShortcuts(false)
      }
      if (e.key === '?' && !e.shiftKey) {
        setShowShortcuts((s) => !s)
      }
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        refresh()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [refresh])

  const handleOpenNote = useCallback((note: Note) => {
    setSelectedNote(note)
  }, [])

  const handleCloseNote = useCallback(() => {
    setSelectedNote(null)
  }, [])

  const filtersActive = !!searchQuery || !!activeTag

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#e5e5e5',
            border: '1px solid #262626',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#171717' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#171717' } },
        }}
      />

      <NoteModal
        note={selectedNote}
        onClose={handleCloseNote}
        onDelete={removeNote}
        onTagClick={setActiveTag}
        onUpdate={editNote}
      />

      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <StatsBar notes={allNotes} />

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors disabled:opacity-50"
            aria-label="Refresh notes"
            title="Refresh notes (Ctrl/Cmd + R)"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowShortcuts((s) => !s)}
            className="hidden sm:flex p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>

        {/* Active filters */}
        {filtersActive && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500">Filtered by:</span>
            {activeTag && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-md border border-emerald-500/20">
                <Hash className="w-3 h-3" />
                {activeTag}
                <button onClick={() => setActiveTag(activeTag)} className="ml-1 hover:text-emerald-200">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-md border border-blue-500/20">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-blue-200">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        <div data-new-note>
          <NoteForm onSubmit={addNote} />
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : notes.length === 0 ? (
          <EmptyState searchActive={filtersActive} />
        ) : (
          <div className="space-y-4">
            {notes.map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={removeNote}
                onTagClick={setActiveTag}
                onOpen={handleOpenNote}
                index={index}
              />
            ))}
          </div>
        )}
      </main>

      {/* Keyboard shortcuts help */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowShortcuts(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Focus search</span><kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 text-xs font-mono">/</kbd></div>
              <div className="flex justify-between"><span className="text-gray-400">Focus search</span><kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 text-xs font-mono">Ctrl/Cmd + K</kbd></div>
              <div className="flex justify-between"><span className="text-gray-400">New note</span><kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 text-xs font-mono">N</kbd></div>
              <div className="flex justify-between"><span className="text-gray-400">Refresh</span><kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 text-xs font-mono">Ctrl/Cmd + R</kbd></div>
              <div className="flex justify-between"><span className="text-gray-400">Close modal</span><kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 text-xs font-mono">Esc</kbd></div>
              <div className="flex justify-between"><span className="text-gray-400">Shortcuts</span><kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 text-xs font-mono">?</kbd></div>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-5 w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-gray-900 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>DevOps Notes API &middot; Built for Cloud Run</p>
          <p>FastAPI + React + Firestore</p>
        </div>
      </footer>
    </div>
  )
}
