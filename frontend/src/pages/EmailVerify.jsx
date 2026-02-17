import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const EmailVerify = () => {
  axios.defaults.withCredentials = true
  const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContent)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState('idle') // idle, verifying, success, error
  const [email, setEmail] = useState('') // For resending email

  // Get token and userId from URL
  const token = searchParams.get('token')
  const userId = searchParams.get('userId')

  useEffect(() => {
    const verifyAccount = async () => {
      if (token && userId) {
        setVerificationStatus('verifying')
        try {
          const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { token, userId })
          if (data.success) {
            setVerificationStatus('success')
            toast.success(data.message)
            getUserData() // Refresh user data if logged in
            setTimeout(() => {
              navigate('/login')
            }, 3000)
          } else {
            setVerificationStatus('error')
            toast.error(data.message)
          }
        } catch (error) {
          setVerificationStatus('error')
          toast.error(error.response?.data?.message || error.message)
        }
      }
    }

    if (token && userId && verificationStatus === 'idle') {
      verifyAccount()
    }
  }, [token, userId, backendUrl, navigate, getUserData, verificationStatus])

  // Redirect if already verified
  useEffect(() => {
    if (isLoggedin && userData && userData.isAccountVerified) {
      navigate('/')
    }
  }, [isLoggedin, userData, navigate])

  const handleResendEmail = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email address.")
      return;
    }
    try {
      setLoading(true)
      const { data } = await axios.post(backendUrl + '/api/auth/resend-verification-email', { email })
      if (data.success) {
        toast.success(data.message)
        setEmail('') // Clear input
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f6efe7] dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full max-w-md bg-[#fffaf3] dark:bg-gray-900 border border-[#e5d3c1] dark:border-gray-800 rounded-2xl p-8 shadow-sm">

        {/* Verification Logic UI */}
        {verificationStatus === 'verifying' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-[#5b3a29] dark:text-white">Verifying...</h2>
            <p className="mt-2 text-[#7a5a45] dark:text-gray-400">Please wait while we verify your account.</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-[#5b3a29] dark:text-white">Email Verified!</h2>
            <p className="mt-2 text-[#7a5a45] dark:text-gray-400">Your account has been successfully verified.</p>
            <p className="mt-1 text-sm text-gray-500">Redirecting to login...</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Login Now
            </button>
          </div>
        )}

        {/* Default View / Error View / Manual Resend View */}
        {(verificationStatus === 'idle' || verificationStatus === 'error') && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#e6d3b1] dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl">
                ✉️
              </div>
              <h2 className="text-2xl font-bold text-[#5b3a29] dark:text-white">
                {verificationStatus === 'error' ? 'Verification Failed' : 'Verify Your Email'}
              </h2>
              <p className="mt-2 text-[#7a5a45] dark:text-gray-400">
                {verificationStatus === 'error'
                  ? 'The link may be invalid or expired. You can request a new verification link below.'
                  : 'Check your email for the verification link. If you didn\'t receive it, we can send it again.'}
              </p>
            </div>

            <form onSubmit={handleResendEmail} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  className="w-full mt-1 px-4 py-3 bg-white dark:bg-gray-800 border border-[#d8c2ae] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#c49a6c] dark:focus:ring-blue-500 outline-none text-[#5b3a29] dark:text-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#7a4a2e] dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-[#5b3a29] dark:hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Resend Verification Link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-[#7a5a45] dark:text-gray-400 hover:text-[#5b3a29] dark:hover:text-white transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default EmailVerify