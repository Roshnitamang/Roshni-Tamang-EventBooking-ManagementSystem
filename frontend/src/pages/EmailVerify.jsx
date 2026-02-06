import React, { useContext, useEffect } from 'react'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const EmailVerify = () => {
  axios.defaults.withCredentials = true
  const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContent)
  const navigate = useNavigate()

  const inputRefs = React.useRef([])
  const [loading, setLoading] = React.useState(false)

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const pasteArray = paste.split('')
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char
        const event = new Event('input', { bubbles: true })
        inputRefs.current[index].dispatchEvent(event)
      }
    })
    if (pasteArray[5]) {
      inputRefs.current[5].focus()
    }
  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      setLoading(true)
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')
      const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { otp })

      if (data.success) {
        toast.success(data.message)
        getUserData()
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedin && userData && userData.isAccountVerified) {
      navigate('/')
    }
  }, [isLoggedin, userData, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <form onSubmit={onSubmitHandler} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                6-Digit Verification Code
              </label>
              <div className="flex justify-between space-x-2" onPaste={handlePaste}>
                {Array(6).fill(0).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    required
                    ref={el => (inputRefs.current[index] = el)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-xl font-medium border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Check your email for the verification code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend code */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={async () => {
                try {
                  setLoading(true)
                  const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp')
                  if (data.success) {
                    toast.success('Verification code resent!')
                  } else {
                    toast.error(data.message)
                  }
                } catch (error) {
                  toast.error(error.message)
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 transition-colors"
            >
              Resend verification code
            </button>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailVerify