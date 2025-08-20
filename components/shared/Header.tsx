'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import UserMenu from '@/components/auth/UserMenu'
import LoginForm from '@/components/auth/LoginForm'

export default function Header() {
  const { user } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLoginClick = () => {
    if (pathname !== '/') {
      router.push('/')
    }
    setShowLogin(!showLogin)
  }

  return (
    <>
      <header className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            href="/"
            className="text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            N-Board
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              ホーム
            </Link>
            
            {user && (
              <>
                <Link
                  href="/tickets"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  チケット
                </Link>
                <Link
                  href="/users"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  メンバー
                </Link>
              </>
            )}
            
            <div>
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {showLogin ? '閉じる' : 'ログイン'}
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>
      
      {/* ログインフォーム */}
      {showLogin && !user && (
        <div className="container mx-auto px-4 pb-8">
          <LoginForm />
        </div>
      )}
    </>
  )
}