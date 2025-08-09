'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import ProfileEditForm from '@/components/profile/ProfileEditForm'
import { UserProfile } from '@/types/user'

export default function ProfileEditPage() {
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user && session) {
      fetchProfile()
    }
  }, [user, session, authLoading, router])

  const fetchProfile = async () => {
    if (!session?.access_token) return

    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const profileData = await response.json()
        setProfile(profileData)
      } else {
        console.error('Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!session?.access_token) throw new Error('No session')

    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(updatedProfile),
    })

    if (!response.ok) {
      throw new Error('Failed to update profile')
    }

    const updatedProfileData = await response.json()
    setProfile(updatedProfileData)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                プロフィール設定
              </h1>
              <button
                onClick={() => router.back()}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                戻る
              </button>
            </div>
          </div>
          
          <ProfileEditForm
            profile={profile}
            onSave={handleSaveProfile}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}
