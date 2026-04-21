import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { CheckCircle2, Download, Home, Ticket, Sparkles } from 'lucide-react';

const EsewaSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { backendUrl, isLoggedin, loading } = useContext(AppContent);
    const [status, setStatus] = useState('verifying'); // verifying, success, failed
    const [bookingDetails, setBookingDetails] = useState(null);
    const ticketRef = useRef(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const data = searchParams.get('data');
            if (!data) {
                setStatus('failed');
                return;
            }

            try {
                const response = await axios.get(`${backendUrl}/api/bookings/verify-esewa?data=${encodeURIComponent(data)}`, {
                    withCredentials: true
                });

                if (response.data.success) {
                    setStatus('success');
                    setBookingDetails(response.data.booking);
                    toast.success("Payment verified successfully!");
                } else {
                    setStatus('failed');
                    toast.error(response.data.message || "Payment verification failed");
                }
            } catch (error) {
                setStatus('failed');
                toast.error("Error verifying payment");
            }
        };

        if (loading) return; // Wait until auth state is confirmed

        if (isLoggedin) {
            verifyPayment();
        } else {
            toast.error("Please login to verify payment");
            navigate('/login');
        }
    }, [searchParams, backendUrl, isLoggedin, loading, navigate]);

    const handleDownloadTicket = () => {
        window.print();
    };

    if (loading || status === 'verifying') {
        return <div className="min-h-screen flex items-center justify-center font-bold text-zinc-500">Verifying payment with eSewa... Please wait.</div>;
    }

    if (status === 'failed') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-6 shadow-lg shadow-red-500/20">
                    <span className="text-5xl font-black">!</span>
                </div>
                <h1 className="text-4xl font-black mb-4 tracking-tight">Payment Failed</h1>
                <p className="text-zinc-500 mb-8 max-w-md font-medium">We couldn't verify your payment. If money was deducted, it will be refunded shortly by eSewa.</p>
                <button onClick={() => navigate('/')} className="bg-white dark:bg-zinc-900 dark:bg-transparent text-zinc-900 dark:text-white dark:text-zinc-900 dark:text-zinc-100 px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-500/20">
                    Return to Home
                </button>
            </div>
        );
    }

    const qrData = bookingDetails?._id || "invalid";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}&color=2563eb`;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-transparent flex items-center justify-center p-6 sm:p-12">
            <div className="max-w-md w-full" ref={ticketRef}>
                {/* --- Printable Ticket Area --- */}
                <div className="bg-transparent dark:bg-white dark:bg-zinc-900 rounded-[3rem] p-10 shadow-2xl border border-zinc-100 dark:border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden flex flex-col items-center ticket-container">

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-bl-[6rem] opacity-20 hidden-print"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-tr-[8rem] opacity-10 hidden-print"></div>

                    {/* Planora Branding */}
                    <div className="flex items-center gap-2 text-green-600 mb-6 relative z-10">
                        <Sparkles className="w-6 h-6" />
                        <span className="text-xl font-black tracking-tight">Planora</span>
                    </div>

                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20 ring-4 ring-green-100 dark:ring-green-900/30 relative z-10">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h2 className="text-3xl font-black mb-2 uppercase tracking-tight text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white relative z-10">Payment Successful</h2>
                    <p className="text-zinc-500 text-sm mb-8 font-medium relative z-10">Your spot is officially secured.</p>

                    <div className="w-full text-left bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-[2rem] mb-2 border border-dashed border-zinc-300 dark:border-zinc-700 relative z-10 ticket-details">
                        {/* Event Name */}
                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white tracking-tight">{bookingDetails?.eventId?.title || "Event Name Unavailable"}</h3>
                        </div>

                        <div className="flex justify-between items-center mb-5 border-b border-zinc-200 dark:border-zinc-800 dark:border-zinc-700 pb-4">
                            <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2"><Ticket className="w-3 h-3" /> Ticket ID</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white text-lg bg-zinc-200 dark:bg-zinc-700 px-3 py-1 rounded-lg">{bookingDetails?._id?.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Quantity</span>
                            <span className="font-black text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white text-lg">{bookingDetails?.tickets}x <span className="capitalize">{bookingDetails?.bookingType}</span></span>
                        </div>
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">Amount Paid</span>
                            <span className="font-black text-green-600 dark:text-green-400 text-xl">Rs. {bookingDetails?.totalAmount}</span>
                        </div>
                        <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                            <span className="text-[10px] font-black text-green-700 dark:text-green-500 uppercase tracking-[0.2em]">Payment Via</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="font-black text-green-700 dark:text-green-500 tracking-widest">eSewa</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* QR Code */}
                    <div className="mt-6 flex flex-col items-center justify-center relative z-10 w-full">
                        <div className="p-3 bg-transparent rounded-2xl border border-zinc-100 shadow-sm inline-block">
                            <img src={qrUrl} alt="Ticket QR Code" className="w-32 h-32 opacity-90" />
                        </div>
                    </div>

                    <div className="w-full border-t border-dashed border-zinc-300 dark:border-zinc-700 my-8 relative z-10 hidden-print">
                        <div className="absolute -left-12 -top-5 w-10 h-10 bg-zinc-50 dark:bg-transparent rounded-full shadow-inner border-r border-zinc-200 dark:border-zinc-800 dark:border-zinc-200 dark:border-zinc-800"></div>
                        <div className="absolute -right-12 -top-5 w-10 h-10 bg-zinc-50 dark:bg-transparent rounded-full shadow-inner border-l border-zinc-200 dark:border-zinc-800 dark:border-zinc-200 dark:border-zinc-800"></div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-8 z-10 hidden-print">
                        <Ticket className="w-4 h-4" /> Valid for Entry
                    </div>

                    {/* --- End Printable Area --- */}

                    <div className="w-full flex max-sm:flex-col gap-4 hidden-print z-10 mt-4">
                        <button onClick={handleDownloadTicket} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-zinc-900 dark:text-white px-6 py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest text-xs">
                            <Download className="w-5 h-5" /> Save Ticket
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="flex-1 bg-transparent dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white px-6 py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 border-2 border-zinc-100 dark:border-zinc-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">
                            <Home className="w-5 h-5" /> My Tickets
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: auto; margin: 0; }
                    html, body {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        overflow: hidden;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .ticket-container, .ticket-container * {
                        visibility: visible;
                    }
                    .hidden-print {
                        display: none !important;
                    }
                    .ticket-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        transform: none;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        margin: 0;
                        padding: 40px;
                        border: none !important;
                        box-shadow: none !important;
                        background: #fff !important;
                        color: #000 !important;
                        border-radius: 0 !important;
                        box-sizing: border-box !important;
                        page-break-after: avoid !important;
                        page-break-before: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    .ticket-details {
                        background: #fff !important;
                        border: 1px dashed #000 !important;
                        width: 100%;
                        max-width: 500px;
                    }
                    .ticket-details * {
                        color: #000 !important;
                        text-shadow: none !important;
                    }
                    .ticket-container h2 {
                        color: #000 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default EsewaSuccess;

