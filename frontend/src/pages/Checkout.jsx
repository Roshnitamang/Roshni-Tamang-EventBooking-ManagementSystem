import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Users, Camera, ChevronRight, ChevronLeft, ShieldCheck, Info, Scan, CheckCircle2, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const Checkout = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { backendUrl, isLoggedin, currency, getUserData } = useContext(AppContent);

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Booking State
    const [step, setStep] = useState(1);
    const [bookingType, setBookingType] = useState('single');
    const [tickets, setTickets] = useState(1);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    // AI/Webcam State
    const webcamRef = useRef(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [captured, setCaptured] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            try {
                // Loading models from a reliable CDN since local ones are missing
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelsLoaded(true);
            } catch (error) {
                console.error("Face-api models failed to load", error);
                // Fallback: still show the UI even if AI check fails
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/events/${eventId}`);
                if (data.success) {
                    setEvent(data.event);
                } else {
                    toast.error(data.message);
                    navigate('/');
                }
            } catch (error) {
                toast.error("Failed to load event details");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId, backendUrl, navigate]);

    // Live Face Detection
    useEffect(() => {
        let interval;
        if (scanning && isModelsLoaded && webcamRef.current && !captured) {
            interval = setInterval(async () => {
                const video = webcamRef.current.video;
                if (video && video.readyState === 4) {
                    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
                    if (detections) {
                        setFaceDetected(true);
                        // Auto-capture after detection
                        setTimeout(() => {
                            capturePhoto();
                        }, 500); // 500ms delay for stability
                    } else {
                        setFaceDetected(false);
                    }
                }
            }, 800);
        }
        return () => clearInterval(interval);
    }, [scanning, isModelsLoaded, captured]);

    const capturePhoto = () => {
        if (!webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setPreview(imageSrc);
        setCaptured(true);
        setScanning(false);

        // Convert base64 to File
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "face_verification.jpg", { type: "image/jpeg" });
                setImage(file);
                // Auto-proceed to step 3 after a brief success display
                setTimeout(() => {
                    setStep(3);
                }, 1500);
            });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleBooking = async () => {
        if (!isLoggedin) {
            toast.error("Please login to continue");
            return navigate('/login');
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('eventId', eventId);
            formData.append('tickets', tickets);
            formData.append('bookingType', bookingType);
            if (image) formData.append('image', image);

            const { data } = await axios.post(`${backendUrl}/api/bookings/book`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success("Booking successful!");
                getUserData();
                navigate('/my-bookings', { state: { message: "Your tickets are ready!" } });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!event) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
                    ))}
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="text-center">
                                    <h2 className="text-3xl font-black tracking-tight">Booking Preference</h2>
                                    <p className="text-gray-500 mt-2">Individual or Squad? Choose your path.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => { setBookingType('single'); setTickets(1); }}
                                        className={`p-6 rounded-[2rem] border-2 transition-all text-left group ${bookingType === 'single' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-800 hover:border-blue-300'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${bookingType === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                            <Ticket className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-lg">Single Ticket</h3>
                                        <p className="text-sm text-gray-500 mt-1">AI Face Verification Required</p>
                                    </button>

                                    <button
                                        onClick={() => { setBookingType('group'); setTickets(2); }}
                                        className={`p-6 rounded-[2rem] border-2 transition-all text-left group ${bookingType === 'group' ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-800 hover:border-blue-300'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${bookingType === 'group' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-lg">Group Booking</h3>
                                        <p className="text-sm text-gray-500 mt-1">2 to 6 Tickets allowed</p>
                                    </button>
                                </div>

                                {bookingType === 'group' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">Quantity</span>
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => setTickets(Math.max(2, tickets - 1))} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center font-black shadow-sm text-lg">-</button>
                                                <span className="font-black text-2xl w-8 text-center">{tickets}</span>
                                                <button onClick={() => setTickets(Math.min(6, tickets + 1))} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center font-black shadow-sm text-lg">+</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <button
                                    onClick={() => { setStep(2); if (bookingType === 'single') setScanning(true); }}
                                    className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-blue-700 transition flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
                                >
                                    Proceed to Verification <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="text-center">
                                    <h2 className="text-3xl font-black tracking-tight">{bookingType === 'single' ? 'AI Face Verification' : 'Identity Verification'}</h2>
                                    <p className="text-gray-500 mt-2">
                                        {bookingType === 'single' ? 'Look directly into camera' : 'Upload a group photo with everyone included'}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {bookingType === 'single' ? (
                                        <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-black shadow-inner border-4 border-gray-100 dark:border-gray-800">
                                            {!captured ? (
                                                <>
                                                    <Webcam
                                                        audio={false}
                                                        ref={webcamRef}
                                                        screenshotFormat="image/jpeg"
                                                        className="w-full h-full object-cover"
                                                        onUserMedia={() => setScanning(true)}
                                                    />
                                                    {/* Scanning Animation */}
                                                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500/50 animate-scan z-20" />

                                                    {/* UI Overlays */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                        <div className={`w-48 h-64 border-2 rounded-[3rem] transition-colors duration-500 ${faceDetected ? 'border-green-500' : 'border-white/30 border-dashed'}`} />
                                                        <p className={`mt-4 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${faceDetected ? 'bg-green-500 text-white' : 'bg-black/60 text-white animate-pulse'}`}>
                                                            {faceDetected ? 'Target Locked' : 'Searching for Face...'}
                                                        </p>
                                                    </div>

                                                    {/* No button needed for auto-capture */}
                                                </>
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    <img src={preview} className="w-full h-full object-cover" />
                                                    <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase">
                                                        <CheckCircle2 className="w-4 h-4" /> Verified
                                                    </div>
                                                    <button onClick={() => { setCaptured(false); setPreview(null); setScanning(true); }} className="absolute bottom-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white font-black uppercase text-[10px] tracking-widest border border-white/20">
                                                        Retake
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div onClick={() => document.getElementById('group-img').click()} className="aspect-[4/3] rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-300 transition-colors bg-gray-50 dark:bg-gray-800/30 overflow-hidden relative group">
                                            {preview ? (
                                                <>
                                                    <img src={preview} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="text-white font-black uppercase text-xs tracking-[0.2em]">Change Photo</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="p-5 bg-white dark:bg-gray-700 rounded-3xl shadow-lg text-blue-600">
                                                        <Camera className="w-10 h-10" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-black uppercase text-gray-900 dark:text-white">Upload Group Photo</p>
                                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Ensure all {tickets} faces are clear</p>
                                                    </div>
                                                </>
                                            )}
                                            <input id="group-img" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                                        <ShieldCheck className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-tight">Security Protocol</p>
                                            <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70 leading-relaxed font-medium">
                                                Images are processed locally for real-time verification and stored securely for entry confirmation. No third-party data sharing.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-[2rem] bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-sm hover:bg-gray-200 active:scale-95 transition-all">Back</button>
                                    <button
                                        onClick={() => (captured || (bookingType === 'group' && preview)) && setStep(3)}
                                        disabled={!preview && (bookingType === 'group' || (bookingType === 'single' && !captured))}
                                        className="flex-[2] py-5 rounded-3xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-blue-500/20 disabled:opacity-30 disabled:grayscale transition-all"
                                    >
                                        Confirm Identity
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="text-center">
                                    <h2 className="text-3xl font-black tracking-tight">Booking Summary</h2>
                                    <p className="text-gray-500 mt-2">Final review before liftoff.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border border-gray-100 dark:border-gray-800 space-y-6">
                                        <div className="flex justify-between items-center border-b dark:border-gray-700 pb-5">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Experience</p>
                                                <p className="font-black text-lg max-w-[200px] truncate">{event.title}</p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Tickets</p>
                                                <p className="font-black text-lg">{tickets}x {bookingType}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-2xl font-black">
                                            <span className="text-sm uppercase tracking-[0.3em]">Total Billing</span>
                                            <span className="text-blue-600">{currency}{event.price * tickets}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 px-4 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>Non-refundable within 24h of start</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(2)} className="flex-1 py-5 rounded-[2rem] bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-sm hover:bg-gray-200 active:scale-95 transition-all">Review Info</button>
                                    <button
                                        onClick={handleBooking}
                                        disabled={submitting}
                                        className="flex-[2] py-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {submitting ? 'Authenticating...' : 'Book My Spot Now'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <style>{`
                @keyframes scan {
                    0%, 100% { top: 0; }
                    50% { top: 100%; }
                }
                .animate-scan {
                    background: linear-gradient(to bottom, transparent, #3b82f6, transparent);
                    height: 50% !important;
                    animation: scan 3s infinite linear;
                    opacity: 0.4;
                }
            `}</style>
        </div>
    );
};

export default Checkout;
