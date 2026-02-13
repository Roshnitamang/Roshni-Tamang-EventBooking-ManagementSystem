import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { Link } from 'react-router-dom'
import { Music, Moon, Heart, Calendar, Briefcase, ShoppingCart, Palette } from 'lucide-react'

function Home() {
  const { backendUrl, searchQuery, currency } = useContext(AppContent)
  const [heroData, setHeroData] = useState({
    heroTitle: 'Discover Amazing Events',
    heroSubtitle: 'Find and book the best local events happening around you.',
    heroImage: ''
  })
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [filteredEvents, setFilteredEvents] = useState([])

  useEffect(() => {
    fetchEvents()
    fetchSiteSettings()
  }, [backendUrl, selectedCategory])

  useEffect(() => {
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(lowerCaseQuery) ||
        event.location.toLowerCase().includes(lowerCaseQuery)
      )
      setFilteredEvents(filtered)
    } else {
      setFilteredEvents(events)
    }
  }, [searchQuery, events])

  const fetchSiteSettings = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/settings`)
      if (data.success && data.settings) {
        setHeroData({
          heroTitle: data.settings.heroTitle || 'Discover Amazing Events',
          heroSubtitle: data.settings.heroSubtitle || 'Find and book the best local events happening around you.',
          heroImage: data.settings.heroImage || ''
        })
      }
    } catch (error) {
      console.error("Error fetching site settings:", error)
    }
  }

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const url = selectedCategory
        ? `${backendUrl}/api/events/category/${selectedCategory}`
        : `${backendUrl}/api/events`

      const { data } = await axios.get(url)
      if (data.success) {
        setEvents(data.events)
        setFilteredEvents(data.events)
      }
    } catch (error) {
      console.error("Error fetching events:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { name: 'Music', icon: Music },
    { name: 'Nightlife', icon: Moon },
    { name: 'Health', icon: Heart },
    { name: 'Holidays', icon: Calendar },
    { name: 'Hobbies', icon: Palette },
    { name: 'Business', icon: Briefcase },
    { name: 'Food', icon: ShoppingCart }
  ]

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 pt-6">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="relative w-full h-[360px] overflow-hidden rounded-2xl">
          {/* Background Image */}
          {heroData.heroImage ? (
            <img
              src={heroData.heroImage.startsWith('/uploads') ? backendUrl + heroData.heroImage : heroData.heroImage}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
              {heroData.heroTitle}
            </h1>
            <p className="text-lg md:text-2xl text-gray-200 font-medium max-w-2xl drop-shadow-md">
              {heroData.heroSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap justify-between items-center gap-8 border-b border-gray-100 dark:border-gray-800 pb-10">
          {categories.map((item, i) => {
            const IconComponent = item.icon
            const isActive = selectedCategory === item.name

            return (
              <button
                key={i}
                onClick={() => setSelectedCategory(isActive ? null : item.name)}
                className={`flex items-center gap-2 group transition-all ${isActive ? 'text-blue-600' : ''
                  }`}
              >
                <div className={`transition ${isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 group-hover:text-blue-600'
                  }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <p className={`text-sm font-bold transition ${isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'
                  }`}>
                  {item.name}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Events section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : (selectedCategory ? `${selectedCategory} Events` : 'Popular in Online Events')}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              {searchQuery ? `Found ${filteredEvents.length} events` : (selectedCategory ? `Browse all ${selectedCategory.toLowerCase()} events` : 'Curated events picked just for you')}
            </p>
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
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 font-bold">
              {searchQuery ? `No events matching "${searchQuery}"` : (selectedCategory ? `No ${selectedCategory.toLowerCase()} events found` : 'No upcoming events yet')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {filteredEvents.map((event) => (
              <Link
                to={`/event/${event._id}`}
                key={event._id}
                className="group block"
              >
                <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                  {event.image ? (
                    <img src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} alt={event.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black text-blue-600 shadow-sm uppercase tracking-tighter">
                    {event.price > 0 ? `${currency}${event.price}` : 'Free'}
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
