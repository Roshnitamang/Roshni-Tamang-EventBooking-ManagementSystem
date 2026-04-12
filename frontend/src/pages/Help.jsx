import React, { useState } from 'react';
import { Search, Ticket, RefreshCw, User, Shield, FileText, MessageSquare, CreditCard, ExternalLink } from 'lucide-react';

const Help = () => {
    const [activeTab, setActiveTab] = useState('attending');

    const featuredArticles = {
        attending: [
            { id: 1, title: 'Find your tickets', icon: Ticket },
            { id: 2, title: 'Request a refund', icon: RefreshCw },
            { id: 3, title: 'Contact the event organizer', icon: MessageSquare },
            { id: 4, title: 'What is this charge from Planora?', icon: CreditCard },
            { id: 5, title: 'Transfer tickets to someone else', icon: ExternalLink },
            { id: 6, title: 'Edit your order information', icon: FileText },
        ],
        organizing: [
            { id: 1, title: 'Create and publish an event', icon: FileText },
            { id: 2, title: 'Manage ticket sales', icon: Ticket },
            { id: 3, title: 'Payouts and settings', icon: CreditCard },
            { id: 4, title: 'Promote your event', icon: ExternalLink },
            { id: 5, title: 'Email your attendees', icon: MessageSquare },
            { id: 6, title: 'Check-in attendees', icon: Shield },
        ]
    };

    const topics = [
        { title: 'Buy and register', icon: CreditCard },
        { title: 'Your tickets', icon: Ticket },
        { title: 'Your account', icon: User },
        { title: 'Terms and policies', icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-transparent dark:bg-transparent transition-colors duration-300">
            {/* Hero Section */}
            <section className="bg-zinc-50 dark:bg-white dark:bg-zinc-900 py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white tracking-tight mb-10">
                        How can we help?
                    </h1>
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search help articles"
                            className="w-full pl-14 pr-6 py-5 rounded-2xl bg-transparent dark:bg-zinc-800 border-none shadow-xl shadow-zinc-200/50 dark:shadow-black/20 outline-none focus:ring-2 ring-green-500 transition-all text-lg font-medium"
                        />
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex justify-center border-b border-zinc-100 dark:border-zinc-200 dark:border-zinc-800 mb-12">
                    <button
                        onClick={() => setActiveTab('attending')}
                        className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${activeTab === 'attending'
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-900 dark:text-white'
                            }`}
                    >
                        Attending an event
                    </button>
                    <button
                        onClick={() => setActiveTab('organizing')}
                        className={`px-8 py-4 font-bold text-sm uppercase tracking-widest transition-all border-b-2 ${activeTab === 'organizing'
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-900 dark:text-white'
                            }`}
                    >
                        Organizing an event
                    </button>
                </div>

                {/* Featured Articles Grid */}
                <div className="mb-20">
                    <h2 className="text-2xl font-black mb-8 text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white">Featured articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredArticles[activeTab].map((article) => (
                            <div
                                key={article.id}
                                className="group p-8 bg-transparent dark:bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer flex items-center gap-5"
                            >
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
                                    <article.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-green-600 transition-colors">
                                    {article.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Browse by Topic */}
                <div className="mb-20">
                    <h2 className="text-2xl font-black mb-8 text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white">Browse by topic</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {topics.map((topic, i) => (
                            <div
                                key={i}
                                className="group p-10 bg-transparent dark:bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-200 dark:border-zinc-800 hover:shadow-2xl text-center transition-all duration-300 cursor-pointer"
                            >
                                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <topic.icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-black text-zinc-800 dark:text-zinc-200">{topic.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Still have questions? */}
                <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 rounded-[3rem] p-16 text-center border border-zinc-100 dark:border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-3xl font-black mb-4 text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white">Still have questions?</h2>
                    <p className="text-zinc-500 mb-10 max-w-xl mx-auto">
                        Our support team is always here to help you with any issues you might be facing.
                    </p>
                    <button className="px-10 py-5 bg-green-600 hover:bg-orange-700 text-zinc-900 dark:text-white font-black rounded-2xl shadow-xl shadow-orange-600/30 transition-all hover:scale-105">
                        Contact us
                    </button>
                </div>
            </section>

        </div>
    );
};

export default Help;

