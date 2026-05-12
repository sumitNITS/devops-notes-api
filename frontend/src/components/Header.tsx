import { Terminal, Cloud, ExternalLink } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-50 tracking-tight">DevOps Notes</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Personal knowledge base for Cloud & Infrastructure</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            <Cloud className="w-3 h-3" />
            Cloud Run
          </span>
          <a
            href="https://github.com/sumitNITS/devops-notes-api"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
            aria-label="GitHub"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  )
}
