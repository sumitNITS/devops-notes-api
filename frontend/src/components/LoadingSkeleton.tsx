import { motion } from 'framer-motion'

export function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 animate-pulse"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-800 rounded w-2/3" />
              <div className="h-3 bg-gray-800 rounded w-1/4" />
            </div>
            <div className="flex gap-1">
              <div className="w-8 h-8 bg-gray-800 rounded-lg" />
              <div className="w-8 h-8 bg-gray-800 rounded-lg" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-800 rounded w-full" />
            <div className="h-3 bg-gray-800 rounded w-5/6" />
            <div className="h-3 bg-gray-800 rounded w-4/6" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-6 bg-gray-800 rounded-full w-16" />
            <div className="h-6 bg-gray-800 rounded-full w-14" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
