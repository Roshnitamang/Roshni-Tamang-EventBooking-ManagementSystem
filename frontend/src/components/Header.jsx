import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'

const Header = () => {
  const navigate = useNavigate()
  const { userData } = useContext(AppContent)

  return (
    <section className="w-full px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-black h-[360px] flex items-center">

          {/* Background image overlay */}
          <img
            src="/hero-music.jpg"   // put image in public folder
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />

          {/* Content */}
          <div className="relative z-10 px-10 max-w-xl">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold bg-pink-300 text-black rounded">
              GET INTO IT
            </span>

            <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              FROM POP BALLADS <br /> TO EMO ENCORES
            </h1>

            <button
              onClick={() => navigate(userData ? '/dashboard' : '/all-events')}
              className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition"
            >
              Get Into Live Music
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Header
