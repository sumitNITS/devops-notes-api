import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Hash, Trash2, Copy, Check, Pencil, Loader2 } from 'lucide-react'
import { formatDate, timeAgo, copyToClipboard } from '../utils'
import { MarkdownRenderer } from './MarkdownRenderer'
import type { Note, UpdateNotePayload } from '../types'
import toast from 'react-hot-toast'

interface NoteModalProps {
  note: Note | null
  onClose: () => void
  onDelete: (id: string) => Promise<boolean>
  onTagClick: (tag: string) => void
  onUpdate: (id: string, payload: UpdateNotePayload) => Promise<boolean>
}

export function NoteModal({ note, onClose, onDelete, onTagClick, onUpdate }: NoteModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')

  const enterEditMode = () => {
    if (!note) return
    setEditTitle(note.title)
    setEditContent(note.content)
    setEditTags(note.tags.join(', '))
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!note) return
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('Title and content are required')
      return
    }

    setSaving(true)
    const tags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const success = await onUpdate(note.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      tags,
    })
    setSaving(false)

    if (success) {
      setIsEditing(false)
    }
  }

  const handleCopy = async () => {
    if (!note) return
    try {
      await copyToClipboard(`${note.title}\n\n${note.content}`)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleDelete = async () => {
    if (!note) return
    if (!confirm('Are you sure you want to delete this note?')) return
    setDeleting(true)
    const success = await onDelete(note.id)
    setDeleting(false)
    if (success) onClose()
  }

  if (!note) return null

  return (
    <AnimatePresence>
      {note && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[85vh] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-800">
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-lg font-bold text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50"
                    autoFocus
                  />
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-100">{note.title}</h2>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span title={formatDate(note.created_at)}>{timeAgo(note.created_at)}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving || !editTitle.trim() || !editContent.trim()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 disabled:cursor-not-allowed text-gray-950 text-xs font-semibold rounded-lg transition-colors"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={enterEditMode}
                      className="p-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      title="Edit note"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="Copy note"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-colors ml-1"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 overflow-y-auto flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Tags</label>
                    <input
                      type="text"
                      placeholder="comma separated tags"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Content</label>
                    <textarea
                      rows={12}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none font-mono"
                    />
                    <p className="mt-1.5 text-[11px] text-gray-600">
                      Supports Markdown: **bold**, `code`, ```code blocks```
                    </p>
                  </div>
                </div>
              ) : (
                <MarkdownRenderer content={note.content} />
              )}
            </div>

            {/* Footer Tags */}
            {!isEditing && note.tags.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-800 flex flex-wrap gap-2">
                {note.tags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => { onTagClick(tag); onClose() }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-950 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/10 hover:border-emerald-500/30 transition-colors"
                  >
                    <Hash className="w-3 h-3 text-emerald-500/60" />
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
