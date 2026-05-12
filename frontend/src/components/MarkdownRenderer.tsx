import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface MarkdownRendererProps {
  content: string
}

function CodeBlock({ inline, className, children, ...props }: any) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const code = String(children).replace(/\n$/, '')

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 bg-gray-800 text-emerald-300 text-sm rounded-md font-mono" {...props}>
        {children}
      </code>
    )
  }

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-950 border border-gray-800 border-b-0 rounded-t-lg">
        <span className="text-xs text-gray-500 font-mono">{language || 'text'}</span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 bg-gray-950 border border-gray-800 rounded-b-lg overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono leading-relaxed" {...props}>
          {children}
        </code>
      </pre>
    </div>
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: CodeBlock,
        p: ({ children }) => <p className="mb-4 text-gray-300 leading-relaxed last:mb-0">{children}</p>,
        h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-100 mt-6 mb-3">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-100 mt-5 mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-200 mt-4 mb-2">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-gray-300 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-emerald-500/30 pl-4 my-4 text-gray-400 italic">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-6 border-gray-800" />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm text-left text-gray-300 border border-gray-800 rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-gray-800 text-gray-100 uppercase text-xs">{children}</thead>,
        th: ({ children }) => <th className="px-4 py-3 border-b border-gray-700 font-semibold">{children}</th>,
        td: ({ children }) => <td className="px-4 py-3 border-b border-gray-800">{children}</td>,
        tr: ({ children }) => <tr className="hover:bg-gray-800/50 transition-colors">{children}</tr>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
