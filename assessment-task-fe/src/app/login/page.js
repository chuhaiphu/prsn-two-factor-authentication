"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginApi, authenticate2FAAndLoginApi } from '@/apis/user-api';
import Link from 'next/link';


export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [twoFAError, setTwoFAError] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      router.push('/profile');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginApi({ usernameOrEmail, password });
      console.log(response);
      if (response.requiresTwoFA) {
        setTempToken(response.tempToken);
        setShowTwoFAModal(true);
      } else {
        toast.success('Login successful!');
        window.location.href = '/profile';
      }
    } catch (error) {
      toast.error(`Login failed, ${error.data.message.message}`);
    }
  };

  const handleTwoFASubmit = async () => {
    try {
      await authenticate2FAAndLoginApi(tempToken, twoFACode);
      setShowTwoFAModal(false);
      toast.success('2FA authentication successful!');
      window.location.href = '/profile';
    } catch (error) {
      if (error.message === "Incorrect 2FA code. Please try again.") {
        setTwoFAError(error.message);
      } else if (error.message === "Your session has expired. Please log in again.") {
        toast.error(error.message);
        setShowTwoFAModal(false);
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Username or Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <Link href="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{' '}
            <Link href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              Sign up here
            </Link>
          </p>
        </div>
      </div>

      {showTwoFAModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Enter 2FA Code</h3>
            {twoFAError && (
              <p className="text-red-500 text-sm mb-2">{twoFAError}</p>
            )}
            <input
              type="text"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter your 2FA code"
            />
            <div className="mt-4">
              <button
                onClick={handleTwoFASubmit}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Submit
              </button>
              <button
                onClick={() => setShowTwoFAModal(false)}
                className="ml-3 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
}
