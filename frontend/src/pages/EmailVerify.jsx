import React, { useContext, useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'

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
            setVerificationStatus('idle') // Switch back to manual if auto fails
            toast.error(data.message)
          }
        } catch (error) {
          setVerificationStatus('idle')
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-transparent transition-colors duration-300 relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-900/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl transition-all">

        {/* Verification Status UI */}
        {verificationStatus === 'verifying' && (
          <div className="text-center py-10">
            <div className="w-20 h-20 mx-auto mb-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase mb-4">Verifying...</h2>
            <p className="text-zinc-500 font-bold text-sm tracking-tight px-4">Establishing secure connection to the authentication servers.</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-center py-10">
            <div className="w-24 h-24 mx-auto mb-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-900/20">
              <ShieldCheck className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase mb-4">Verified!</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-10">Access granted. Your identity has been authenticated.</p>
            <button onClick={() => navigate('/login')} className="btn-primary !w-full !py-4">
              Return to Sanctuary
            </button>
          </div>
        )}

        {/* Manual OTP Entry View */}
        {(verificationStatus === 'idle' || verificationStatus === 'error') && (
          <div>
            <div className="text-center mb-10">
               <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-3xl shadow-2xl shadow-emerald-900/20">
                  <Mail className="w-10 h-10 text-emerald-500" />
                </div>
              </div>
              <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-3 leading-none uppercase">
                 Identity Check
              </h2>
              <p className="text-zinc-500 font-bold text-sm tracking-tight px-4">
                Enter the secret passcode sent to your messaging environment
              </p>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] ml-1 block">Entity Identity</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="Your registered email address"
                      className="w-full pl-12 pr-4 py-3.5 bg-transparent/50 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 rounded-xl outline-none font-medium transition-all text-zinc-900 dark:text-white placeholder:text-zinc-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] ml-1 block">Security Key</label>
                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                  {Array(6).fill(0).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      required
                      ref={el => (inputRefs.current[index] = el)}
                      onInput={(e) => handleInput(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-12 h-14 text-center text-xl font-black border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary !w-full !py-4 flex items-center justify-center gap-3 mt-4 group"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm Identity</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <button
                onClick={async () => {
                  if (email) {
                    try {
                      await axios.post(backendUrl + '/api/auth/resend-verification-email', { email })
                      toast.success("Identity key resent!")
                    } catch (e) { toast.error("Failed to resend key") }
                  } else {
                    toast.info("Identification required to resend key")
                  }
                }}
                className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <span>Resend Security Key</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailVerify
