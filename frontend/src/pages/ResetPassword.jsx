import React, { useContext, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { Mail, Lock, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4 transition-colors duration-300 relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-900/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>

      <div className="relative z-10 w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-3xl shadow-2xl shadow-emerald-900/20">
              🔐
            </div>
          </div>

          <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-3 leading-none uppercase">
            Reset Password
          </h2>
          <p className="text-zinc-500 font-bold text-sm tracking-tight">
            Secure your account with a multi-layered verification process
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center mb-10 gap-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-xl font-black flex items-center justify-center transition-all duration-500 border
                  ${s <= currentStep 
                    ? 'bg-emerald-600 text-zinc-900 dark:text-white border-emerald-500 shadow-lg shadow-emerald-900/40' 
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 border-zinc-200 dark:border-zinc-800'}`}
              >
                {s}
              </div>
              {s < 3 && <div className={`w-8 h-[2px] transition-colors duration-500 ${s < currentStep ? 'bg-emerald-600' : 'bg-zinc-800'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl transition-all">

          {/* STEP 1 */}
          {currentStep === 1 && (
            <form onSubmit={onSubmitEmail} className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] ml-1 mb-3 block">Registered Identity</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-3.5 bg-transparent/50 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 rounded-xl outline-none font-medium transition-all text-zinc-900 dark:text-white placeholder:text-zinc-600"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
               </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary !w-full !py-4 flex items-center justify-center gap-3 transition-all mt-4"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Request Passcode</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <form onSubmit={onSubmitOTP} className="space-y-4">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] ml-1 mb-3 block text-center">Security Verification Code</label>

              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {Array(6).fill(0).map((_, i) => (
                  <input
                    key={i}
                    maxLength="1"
                    ref={(el) => (inputRefs.current[i] = el)}
                    onInput={(e) => handleInput(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-12 h-14 text-center text-xl font-black border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent/50 text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn-primary !w-full !py-4 flex items-center justify-center gap-3 transition-all mt-6"
              >
                <span>Verify Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <form onSubmit={onSubmitNewPassword} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] ml-1 mb-3 block">Define New Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-12 pr-4 py-3.5 bg-transparent/50 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 rounded-xl outline-none font-medium transition-all text-zinc-900 dark:text-white placeholder:text-zinc-600"
                    />
                  </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary !w-full !py-4 flex items-center justify-center gap-3 transition-all mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm Reset</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* BACK */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-all flex items-center justify-center gap-2 mx-auto decoration-emerald-500/30 underline-offset-8"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Return to Sanctuary</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default ResetPassword

