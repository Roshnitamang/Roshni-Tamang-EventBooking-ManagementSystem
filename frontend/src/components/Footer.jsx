import React from 'react';
import { MessageSquare } from 'lucide-react';

const Footer = () => {
    return (
        <>
            <footer className="bg-gray-900 dark:bg-black text-white py-20 mt-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div>
                        <h4 className="font-black mb-6 uppercase tracking-widest text-[10px] text-gray-500">Use Planora</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li>Create events</li>
                            <li>Community Guidelines</li>
                            <li>Pricing</li>
                            <li>Site status</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black mb-6 uppercase tracking-widest text-[10px] text-gray-500">Download apps</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li>Planora app for Android</li>
                            <li>Planora app for iOS</li>
                            <li>Planora Organizer app</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black mb-6 uppercase tracking-widest text-[10px] text-gray-500">Browse resources</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li>Organizer Resource Hub</li>
                            <li>Taxes</li>
                            <li>Webinars for new organizers</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black mb-6 uppercase tracking-widest text-[10px] text-gray-500">Connect with us</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li>Contact support</li>
                            <li>Facebook</li>
                            <li>Instagram</li>
                            <li>TikTok</li>
                        </ul>
                    </div>
                </div>
            </footer>

            {/* Floating Ask a Question Button */}
            <button className="fixed bottom-10 right-10 flex items-center gap-3 px-6 py-4 bg-orange-600 text-white font-bold rounded-full shadow-2xl hover:bg-orange-700 transition-all hover:scale-110 z-50">
                <MessageSquare className="w-5 h-5" />
                Ask a question
            </button>
        </>
    );
};

export default Footer;
