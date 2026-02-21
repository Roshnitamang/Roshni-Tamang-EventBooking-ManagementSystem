import React, { useContext, useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

const EmailVerify = () => {
  axios.defaults.withCredentials = true
  const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContent)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // URL Params
  const tokenFromUrl = searchParams.get('token')
  const userIdFromUrl = searchParams.get('userId')
  const emailFromUrl = searchParams.get('email')

  const [loading, setLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState('idle') // idle, verifying, success, error
  const [email, setEmail] = useState(userData?.email || emailFromUrl || '')

  useEffect(() => {
    if (userData?.email) setEmail(userData.email)
  }, [userData])

  // OTP Inputs
  const inputRefs = useRef([])

  // Auto-Verify if Token & UserID exist in URL
  useEffect(() => {
    const verifyAccount = async () => {
      if (tokenFromUrl && userIdFromUrl) {
        setVerificationStatus('verifying')
        try {
          // Note: Backend expects 'token' and 'userId' for link verification
          const { data } = await axios.post(backendUrl + '/api/auth/verify-account', {
            token: tokenFromUrl,
            userId: userIdFromUrl
          })
          if (data.success) {
            setVerificationStatus('success')
            toast.success(data.message)
            getUserData()
            setTimeout(() => navigate('/login'), 2000)
          } else {
            setVerificationStatus('error')
            toast.error(data.message)
          }
        } catch (error) {
          setVerificationStatus('error')
          toast.error(error.response?.data?.message || 'Verification failed')
        }
      }
    }

    if (tokenFromUrl && userIdFromUrl && verificationStatus === 'idle') {
      verifyAccount()
    }
  }, [tokenFromUrl, userIdFromUrl, backendUrl, navigate, getUserData, verificationStatus])

  // Handle Manual OTP Input
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
    if (pasteArray[5]) inputRefs.current[5].focus()
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')

      if (!email) {
        toast.error("Please enter your email.")
        setLoading(false)
        return
      }

      const { data } = await axios.post(backendUrl + '/api/auth/verify-account', {
        email: email,
        token: otp
      })

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

  // Redirect if already verified
  useEffect(() => {
    if (isLoggedin && userData && userData.isAccountVerified) {
      navigate('/')
    }
  }, [isLoggedin, userData, navigate])

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
            <button onClick={() => navigate('/login')} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
              Login Now
            </button>
          </div>
        )}

        {/* Manual OTP Entry View */}
        {(verificationStatus === 'idle' || verificationStatus === 'error') && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#5b3a29] dark:text-white">Verify Your Email</h2>
              <p className="mt-2 text-[#7a5a45] dark:text-gray-400">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-6">
              {/* Email Input for manual verification */}
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-widest ml-1 mb-2 block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-[#d8c2ae] dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#c49a6c] dark:focus:ring-blue-500 outline-none text-[#5b3a29] dark:text-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-widest ml-1 mb-2 block">Verification Code</label>
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
                      className="w-12 h-12 text-center text-xl font-bold border border-[#d8c2ae] dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-[#5b3a29] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c49a6c] dark:focus:ring-blue-500 transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 text-sm font-bold text-white bg-[#7a4a2e] dark:bg-blue-600 rounded-xl hover:bg-[#5b3a29] dark:hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={async () => {
                  // Needs email to resend. Since we don't have email input here, assume user is logged in
                  // OR we need to ask for email. 
                  // Simplification: Redirect to separate Resend page if needed, or just toast.
                  if (userData?.email) {
                    try {
                      await axios.post(backendUrl + '/api/auth/resend-verification-email', { email: userData.email })
                      toast.success("Code resent!")
                    } catch (e) { toast.error("Failed to resend") }
                  } else {
                    toast.info("Please login to resend code")
                  }
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
              >
                Resend Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailVerify