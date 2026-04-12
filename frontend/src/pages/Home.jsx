import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { Link, useLocation } from 'react-router-dom'
import { Music, Moon, Heart, Calendar, Briefcase, ShoppingCart, Palette, ArrowRight } from 'lucide-react'

function Home() {
  const { backendUrl, searchQuery, currency } = useContext(AppContent)
  const location = useLocation()
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
    if (location.pathname === '/all-events') {
      setSelectedCategory(null)
    }
  }, [location.pathname])

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
    <div className="w-full min-h-screen bg-transparent transition-colors duration-300 pt-6">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="relative w-full h-[450px] overflow-hidden rounded-[3rem] bg-zinc-50 dark:bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800 shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-900/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-zinc-800/50 rounded-full border border-zinc-200 dark:border-zinc-700/50 mb-8 backdrop-blur-md">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
               <span className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-600 dark:text-zinc-300 tracking-[0.2em]">New Experiences Available</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-zinc-900 dark:text-white tracking-tighter mb-8 leading-[0.9]">
              {heroData.heroTitle.split(' ').map((word, i) => (
                <span key={i} className={word.toLowerCase() === 'amazing' || word.toLowerCase() === 'events' ? 'text-emerald-500' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mb-12">
              {heroData.heroSubtitle}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-5">
               <button className="btn-primary !px-10 !py-4 shadow-2xl shadow-emerald-900/20">
                 Explore Now
               </button>
               <button className="btn-secondary !px-10 !py-4">
                 Our Mission
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-200 dark:border-zinc-800">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Browse by interest</h3>
           <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Live Now</span>
           </div>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((item, i) => {
            const IconComponent = item.icon
            const isActive = selectedCategory === item.name

            return (
              <button
                key={i}
                onClick={() => setSelectedCategory(isActive ? null : item.name)}
                className={`category-pill ${isActive ? 'active' : ''}`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Events section */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-900 dark:text-white tracking-tighter leading-none mb-4">
              {searchQuery ? `Searching for "${searchQuery}"` : (selectedCategory ? `${selectedCategory} Experiences` : 'Trending in Online Events')}
            </h2>
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-12 bg-emerald-500"></span>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">
                {searchQuery ? `Found ${filteredEvents.length} matches` : (selectedCategory ? `Hand-picked ${selectedCategory.toLowerCase()} events` : 'Curated experiences for you')}
              </p>
            </div>
          </div>
          <Link to="/all-events" className="group flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-[11px] hover:text-emerald-400 transition-all">
            <span>Browse all collections</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/9] bg-zinc-200 dark:bg-white dark:bg-zinc-900 rounded-2xl mb-4"></div>
                <div className="h-6 bg-zinc-200 dark:bg-white dark:bg-zinc-900 rounded-md w-3/4 mb-3"></div>
                <div className="h-4 bg-zinc-200 dark:bg-white dark:bg-zinc-900 rounded-md w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-32 bg-zinc-100 dark:bg-white dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-300 dark:border-zinc-200 dark:border-zinc-800 border-dashed">
            <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-sm">
              {searchQuery ? `No results for "${searchQuery}"` : 'No upcoming events found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredEvents.map((event) => (
              <Link
                to={`/event/${event._id}`}
                key={event._id}
                className="event-card group"
              >
                <div className="relative aspect-[16/9] overflow-hidden grayscale-[30%] group-hover:grayscale-0 transition-all duration-700">
                  {event.image ? (
                    <img src={event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} alt={event.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                       <Palette className="w-12 h-12 text-zinc-500 dark:text-zinc-400 dark:text-zinc-700" />
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                     <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-black text-emerald-400 uppercase tracking-widest shadow-2xl">
                        {event.price > 0 ? `${currency}${event.price}` : 'Complimentary'}
                     </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </span>
                     <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                     <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] truncate">
                        {event.location}
                     </span>
                  </div>

                  <h3 className="font-bold text-zinc-900 dark:text-zinc-900 dark:text-zinc-100 text-xl mb-4 leading-tight group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/50">
                     <div className="flex items-center gap-2 text-zinc-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-400 transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest">View Details</span>
                        <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
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

