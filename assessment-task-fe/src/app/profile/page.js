"use client"
import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { PhotoIcon, UserCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { findUserById, turnOn2FAApi, turnOff2FAApi, setup2FAApi } from '@/apis/user-api'
import { withAuth } from '@/components/withAuth'
import { toast } from 'react-toastify'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Profile() {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null)
  const [twoFACode, setTwoFACode] = useState('')

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

  const handle2FAToggle = async () => {
    if (!user.isTwoFAEnabled) {
      try {
        const response = await setup2FAApi(user.id)
        setQrCodeDataUrl(response.content.qrCodeDataUrl)
        setOpen(true)
      } catch (error) {
        toast.error('Failed to set up Two-Factor Authentication')
      }
    } else {
      setOpen(true)
    }
  }

  const confirmToggle2FA = async () => {
    try {
      if (user.isTwoFAEnabled) {
        await turnOff2FAApi()
        setUser({ ...user, isTwoFAEnabled: false })
        toast.success('Two-Factor Authentication disabled successfully')
      } else {
        await turnOn2FAApi(twoFACode)
        setUser({ ...user, isTwoFAEnabled: true })
        toast.success('Two-Factor Authentication enabled successfully')
      }
      setOpen(false)
      setQrCodeDataUrl(null)
      setTwoFACode('')
    } catch (error) {
      toast.error(error.data.message.message || 'Failed to toggle Two-Factor Authentication')
    }
  }

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

        <div className="mt-6">
          <button
            type="button"
            onClick={handle2FAToggle}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {user.isTwoFAEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
          </button>
        </div>

        <Dialog open={open} onClose={setOpen} className="relative z-10">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
              >
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon aria-hidden="true" className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {user.isTwoFAEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
                    </DialogTitle>
                    <div className="mt-2">
                      {!user.isTwoFAEnabled && qrCodeDataUrl && (
                        <div>
                          <img src={qrCodeDataUrl} alt="QR Code for 2FA" />
                          <input
                            type="text"
                            value={twoFACode}
                            onChange={(e) => setTwoFACode(e.target.value)}
                            placeholder="Enter 2FA code here"
                            className="text-2xl mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </div>
                      )}
                      <p className="text-sm mt-2 text-gray-500">
                        {user.isTwoFAEnabled
                          ? 'Are you sure you want to disable Two-Factor Authentication? This will remove an extra layer of security from your account.'
                          : 'Scan the QR code with your authenticator app and enter the code to enable Two-Factor Authentication. WARNING: If you have previously set up 2FA, make sure to delete any existing entries for this account in your authenticator app before proceeding.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmToggle2FA}
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
        <ToastContainer />
      </div>
    </div>
  )
}
export default withAuth(Profile)
