import { useState, useEffect } from 'react'
import { Plus, Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CreateNotePayload } from '../types'

const DRAFT_KEY = 'devops_notes_draft'

interface NoteFormProps {
  onSubmit: (payload: CreateNotePayload) => Promise<boolean>
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveDraft(draft: { title: string; content: string; tagsInput: string }) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

export function NoteForm({ onSubmit }: NoteFormProps) {
  const draft = loadDraft()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(draft?.title || '')
  const [content, setContent] = useState(draft?.content || '')
  const [tagsInput, setTagsInput] = useState(draft?.tagsInput || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      saveDraft({ title, content, tagsInput })
    }
  }, [title, content, tagsInput, isOpen])

  const reset = () => {
    setTitle('')
    setContent('')
    setTagsInput('')
    clearDraft()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSaving(true)
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const success = await onSubmit({ title: title.trim(), content: content.trim(), tags })
    setSaving(false)

    if (success) {
      reset()
      setIsOpen(false)
    }
  }

  return (
    <div className="mb-8">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setIsOpen(true)}
            className="w-full py-4 px-5 rounded-xl border border-dashed border-gray-700 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add a new note
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-lg font-semibold text-gray-100">New Note</h2>
              </div>
              <button
                type="button"
                onClick={() => { setIsOpen(false); reset() }}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="e.g., Kubernetes Pod Debugging"
                  className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Tags</label>
                <input
                  type="text"
                  placeholder="k8s, debugging, commands (comma separated)"
                  className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Content</label>
                <textarea
                  placeholder="Write your tip, command, or learning here...&#10;Supports markdown: **bold**, `code`, ```blocks```"
                  rows={6}
                  className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none font-mono"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                <p className="mt-1.5 text-[11px] text-gray-600">
                  Supports Markdown: **bold**, `code`, ```code blocks```, lists, links
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving || !title.trim() || !content.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 disabled:cursor-not-allowed text-gray-950 text-sm font-semibold rounded-lg transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
