"use client"
import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { findUserById } from '@/apis/user-api'
import { withAuth } from '@/components/withAuth'

function Profile() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = localStorage.getItem('access_token')
        if (accessToken) {
          const decodedToken = jwtDecode(JSON.parse(accessToken))
          const userId = decodedToken.sub
          const user = await findUserById(userId)
          setUser(user)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [])

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="flex justify-center items-center py-8 bg-gray-100">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
        <form>
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-4">Profile</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600 mb-8">
                This information will be displayed publicly so be careful what you share.
              </p>

              <div className="grid grid-cols-1 gap-y-8">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                    Username
                  </label>
                  <div className="mt-2">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={user.username}
                      readOnly
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={user.email}
                      readOnly
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                    Phone
                  </label>
                  <div className="mt-2">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={user.phone || ''}
                      readOnly
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
export default withAuth(Profile);

