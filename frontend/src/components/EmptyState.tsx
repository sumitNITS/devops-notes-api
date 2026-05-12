import { FileText, Search } from 'lucide-react'

interface EmptyStateProps {
  searchActive?: boolean
}

export function EmptyState({ searchActive }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
        {searchActive ? (
          <Search className="w-7 h-7 text-gray-600" />
        ) : (
          <FileText className="w-7 h-7 text-gray-600" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-300 mb-1">
        {searchActive ? 'No matching notes' : 'No notes yet'}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        {searchActive
          ? 'Try adjusting your search terms or clear the filter to see all notes.'
          : 'Get started by adding your first DevOps tip, command, or learning above.'}
      </p>
    </div>
  )
}
