import { FileText, Hash, Clock } from 'lucide-react'
import type { Note } from '../types'

interface StatsBarProps {
  notes: Note[]
}

export function StatsBar({ notes }: StatsBarProps) {
  const totalTags = new Set(notes.flatMap(n => n.tags)).size
  const recentCount = notes.filter(n => {
    const date = new Date(n.created_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return date > weekAgo
  }).length

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="text-lg font-bold text-gray-100 leading-none">{notes.length}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Notes</div>
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Hash className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="text-lg font-bold text-gray-100 leading-none">{totalTags}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Tags</div>
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="text-lg font-bold text-gray-100 leading-none">{recentCount}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">This Week</div>
        </div>
      </div>
    </div>
  )
}
