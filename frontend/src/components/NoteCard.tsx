import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Copy, Check, Clock, Hash, Eye } from 'lucide-react'
import { formatDate, timeAgo, copyToClipboard } from '../utils'
import type { Note } from '../types'
import toast from 'react-hot-toast'

interface NoteCardProps {
  note: Note
  onDelete: (id: string) => Promise<boolean>
  onTagClick: (tag: string) => void
  onOpen: (note: Note) => void
  index: number
}

export function NoteCard({ note, onDelete, onTagClick, onOpen, index }: NoteCardProps) {
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await copyToClipboard(`${note.title}\n\n${note.content}`)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this note?')) return
    setDeleting(true)
    await onDelete(note.id)
    setDeleting(false)
  }

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation()
    onTagClick(tag)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onOpen(note)}
      className="group bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 hover:border-gray-700 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-100 truncate">{note.title}</h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span title={formatDate(note.created_at)}>{timeAgo(note.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(note) }}
            className="p-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            aria-label="View note"
            title="View note"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            aria-label="Copy note"
            title="Copy note"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            aria-label="Delete note"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-300 leading-relaxed line-clamp-4">{note.content}</p>

      {note.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {note.tags.map((tag, i) => (
            <button
              key={i}
              onClick={(e) => handleTagClick(e, tag)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-950 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/10 hover:border-emerald-500/30 transition-colors"
            >
              <Hash className="w-3 h-3 text-emerald-500/60" />
              {tag}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}
