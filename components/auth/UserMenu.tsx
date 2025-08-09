'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // クリック外でメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!user) {
    return null
  }

  // アバター画像またはイニシャルを取得
  const getDisplayIcon = () => {
    // 表示名の最初の文字を取得（表示名がない場合はemailの最初の文字）
    const displayName = profile?.display_name || user.email || ''
    const initial = displayName.charAt(0).toUpperCase()
    
    // アバター画像がある場合
    if (profile?.avatar_url) {
      return (
        <div className="relative w-8 h-8">
          <img
            src={profile.avatar_url}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              // 画像の読み込みに失敗した場合は非表示にしてフォールバックを表示
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
            {initial}
          </div>
        </div>
      )
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
        {initial}
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
        title={profile?.display_name || user.email}
      >
        {getDisplayIcon()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <Link
              href="/profile/edit"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              プロフィール編集
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  )
}