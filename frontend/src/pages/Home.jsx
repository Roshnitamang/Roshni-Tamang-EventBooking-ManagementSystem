import React, { useEffect, useState, useContext } from 'react'
import Header from '../components/Header'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { Link } from 'react-router-dom'

function Home() {
  const { backendUrl } = useContext(AppContent)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/events`)
        if (data.success) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error("Error fetching events:", error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [backendUrl])

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-wrap justify-between items-center gap-8 border-b border-gray-100 dark:border-gray-800 pb-10">
          {[
            { name: 'Music', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg> },
            { name: 'Nightlife', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> },
            { name: 'Health', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
            { name: 'Holidays', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
            { name: 'Hobbies', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg> },
            { name: 'Business', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
            { name: 'Food', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> }
          ].map((item, i) => (
            <button
              key={i}
              className="flex items-center gap-2 group transition-all"
            >
              <div className="text-gray-400 group-hover:text-blue-600 transition">
                {item.icon}
              </div>
              <p className="text-sm font-bold text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition">
                {item.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Events section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Popular in Online Events
            </h2>
            <p className="text-gray-500 mt-2 font-medium">Curated events picked just for you</p>
          </div>
          <Link to="/all-events" className="text-blue-600 font-bold hover:text-blue-700 transition text-sm underline underline-offset-4">
            Browse all events
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-44 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4"></div>
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-md w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-1/2"></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 font-bold">No upcoming events yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {events.map((event) => (
              <Link
                to={`/event/${event._id}`}
                key={event._id}
                className="group block"
              >
                <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black text-blue-600 shadow-sm uppercase tracking-tighter">
                    {event.price > 0 ? `$${event.price}` : 'Free'}
                  </div>
                </div>

                <div className="flex gap-4">
                  {/* Date Block */}
                  <div className="flex-shrink-0 text-center">
                    <p className="text-[10px] uppercase font-black text-blue-600 tracking-tighter">
                      {new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white leading-none mt-1">
                      {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white leading-[1.3] text-lg mb-1 group-hover:text-blue-600 transition truncate">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium truncate mb-2">
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
