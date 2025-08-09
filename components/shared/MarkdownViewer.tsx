'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownViewerProps {
  url: string
  className?: string
}

export default function MarkdownViewer({ url, className = '' }: MarkdownViewerProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/markdown?url=${encodeURIComponent(url)}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch markdown')
        }
        
        setContent(data.content)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      fetchMarkdown()
    }
  }, [url])

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">マークダウンを読み込み中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-red-700">
          <strong>エラー:</strong> {error}
        </div>
        <div className="text-sm text-red-600 mt-2">
          URL: {url}
        </div>
      </div>
    )
  }

  return (
    <div className={`prose prose-lg max-w-none w-full ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // リンクを新しいタブで開く
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              {...props}
            >
              {children}
            </a>
          ),
          // 段落のスタイリング
          p: ({ children, ...props }) => (
            <p className="text-gray-800 dark:text-gray-200 mb-0 leading-relaxed first:mt-0" {...props}>
              {children}
            </p>
          ),
          // 見出しのスタイリング
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-0 mt-0 first:mt-0 border-b border-gray-200 dark:border-gray-700 pb-0" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 
              className="text-2xl font-semibold mb-0 mt-0 first:mt-0" 
              style={{ color: 'var(--foreground)' }}
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-0 mt-0 first:mt-0" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-0 mt-0 first:mt-0" {...props}>
              {children}
            </h4>
          ),
          // リストのスタイリング
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside text-gray-800 dark:text-gray-200 mb-0 space-y-0" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside text-gray-800 dark:text-gray-200 mb-0 space-y-0" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-gray-800 dark:text-gray-200" {...props}>
              {children}
            </li>
          ),
          // 強調のスタイリング
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-gray-900 dark:text-white" {...props}>
              {children}
            </strong>
          ),
          // コードブロックのスタイリング
          code: ({ className, children, ...props }: any) => {
            const inline = !className?.includes('language-')
            return (
              <code
                className={`${className} ${
                  inline
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono'
                    : 'block bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm border border-gray-200 dark:border-gray-700'
                }`}
                {...props}
              >
                {children}
              </code>
            )
          },
          // テーブルのスタイリング
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-0">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300" {...props}>
              {children}
            </td>
          ),
          // ブロッククォートのスタイリング
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-4 py-0 my-0 italic text-gray-700 dark:text-gray-300" {...props}>
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
