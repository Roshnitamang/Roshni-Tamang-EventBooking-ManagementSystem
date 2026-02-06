import React, { useContext, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent)
  axios.defaults.withCredentials = true

  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputRefs = useRef([])

  /* ---------- OTP INPUT HANDLERS ---------- */
  const handleInput = (e, index) => {
    if (e.target.value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    paste.split('').forEach((char, i) => {
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = char
      }
    })
    inputRefs.current[paste.length - 1]?.focus()
  }

  /* ---------- SUBMITS ---------- */
  const onSubmitEmail = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { data } = await axios.post(
        backendUrl + '/api/auth/send-reset-otp',
        { email }
      )
      data.success ? (toast.success(data.message), setIsEmailSent(true)) : toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const onSubmitOTP = async (e) => {
    e.preventDefault()
    const enteredOtp = inputRefs.current.map((i) => i.value).join('')
    setOtp(enteredOtp)
    setIsOtpSubmitted(true)
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { data } = await axios.post(
        backendUrl + '/api/auth/reset-password',
        { email, otp, newPassword }
      )
      if (data.success) {
        toast.success(data.message)
        navigate('/login')
      } else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentStep = !isEmailSent ? 1 : !isOtpSubmitted ? 2 : 3

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6efe7] dark:bg-gray-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#e6d3b1] flex items-center justify-center text-xl">
              🔐
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#5b3a29] dark:text-white transition-colors">
            Reset Password
          </h2>
          <p className="mt-2 text-[#7a5a45] dark:text-gray-400 transition-colors">
            Secure your account with a new password
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-7 h-7 rounded-full text-xs flex items-center justify-center transition-colors
                  ${s <= currentStep ? 'bg-[#7a4a2e] dark:bg-blue-600 text-white' : 'bg-[#e6d3b1] dark:bg-gray-800 text-[#5b3a29] dark:text-gray-400'}`}
              >
                {s}
              </div>
              {s < 3 && <div className="w-10 h-[2px] bg-[#d8c2ae] dark:bg-gray-700" />}
            </React.Fragment>
          ))}
        </div>

        {/* CARD */}
        <div className="bg-[#fffaf3] dark:bg-gray-900 border border-[#e5d3c1] dark:border-gray-800 rounded-lg p-6 shadow-sm transition-colors">

          {/* STEP 1 */}
          {currentStep === 1 && (
            <form onSubmit={onSubmitEmail} className="space-y-4">
              <label className="text-sm font-medium text-[#5b3a29] dark:text-gray-300">
                Email Address
              </label>
              <div className="mb-4 flex items-center gap-3 w-full px-3 py-2 border border-[#d8c2ae] dark:border-gray-700 rounded-md focus-within:ring-2 focus-within:ring-[#c49a6c] dark:focus-within:ring-blue-500">
                <img src={assets.mail_icon} alt="" className="w-4 h-4 opacity-50 dark:invert" />
                <input
                  type="email"
                  placeholder="Enter registered email"
                  className="bg-transparent outline-none flex-1 text-[#5b3a29] dark:text-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[#7a4a2e] dark:bg-blue-600 text-white rounded-md hover:bg-[#5b3a29] dark:hover:bg-blue-700 transition"
              >
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <form onSubmit={onSubmitOTP} className="space-y-4">
              <label className="text-sm font-medium text-[#5b3a29] dark:text-gray-300">
                Verification Code
              </label>

              <div className="flex justify-between" onPaste={handlePaste}>
                {Array(6).fill(0).map((_, i) => (
                  <input
                    key={i}
                    maxLength="1"
                    ref={(el) => (inputRefs.current[i] = el)}
                    onInput={(e) => handleInput(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-10 h-10 text-center border border-[#d8c2ae] dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c49a6c] dark:focus:ring-blue-500 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#7a4a2e] dark:bg-blue-600 text-white rounded-md hover:bg-[#5b3a29] dark:hover:bg-blue-700 transition"
              >
                Verify Code
              </button>
            </form>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <form onSubmit={onSubmitNewPassword} className="space-y-4">
              <label className="text-sm font-medium text-[#5b3a29] dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[#d8c2ae] dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c49a6c] dark:focus:ring-blue-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-[#7a4a2e] dark:bg-blue-600 text-white rounded-md hover:bg-[#5b3a29] dark:hover:bg-blue-700 transition"
              >
                {loading ? 'Updating…' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>

        {/* BACK */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-[#7a5a45] dark:text-gray-400 hover:text-[#5b3a29] dark:hover:text-blue-400 transition-colors"
          >
            ← Back to login
          </button>
        </div>

      </div>
    </div>
  )
}

export default ResetPassword
