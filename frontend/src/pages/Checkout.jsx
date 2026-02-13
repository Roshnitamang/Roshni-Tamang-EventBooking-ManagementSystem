import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Camera, ShieldCheck, CheckCircle, Smartphone, Loader2 } from 'lucide-react';
import * as faceapi from 'face-api.js';

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, isLoggedin, userData, currency } = useContext(AppContent);
    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState(1);
    const [loading, setLoading] = useState(false);

    // New Booking Flow State
    const [bookingType, setBookingType] = useState('single'); // 'single' | 'group'
    const [groupPhoto, setGroupPhoto] = useState(null);
    const [verificationStep, setVerificationStep] = useState('idle'); // 'idle' | 'loading_models' | 'camera' | 'captured' | 'scanning' | 'verified'
    const [scanningProgress, setScanningProgress] = useState(0);
    const [capturedImage, setCapturedImage] = useState(null);
    const [stream, setStream] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (!isLoggedin) {
            navigate('/login', { state: { from: 'checkout', message: "Please login to continue to checkout", mode: 'login' } });
            return;
        }

        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/events/${id}`);
                if (data.success) {
                    setEvent(data.event);
                }
            } catch (error) {
                toast.error("Error loading checkout details");
            }
        };
        fetchEvent();

        if (userData) {
            const names = userData.name.split(' ');
            setFirstName(names[0] || '');
            setLastName(names.slice(1).join(' ') || '');
            setEmail(userData.email || '');
        }
    }, [id, backendUrl, isLoggedin, navigate, userData]);

    // Handle ticket quantity based on type
    useEffect(() => {
        if (bookingType === 'single') {
            setTickets(1);
        } else {
            setTickets(2); // Default min for group
        }
    }, [bookingType]);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const loadModels = async () => {
        if (modelsLoaded) return;
        setVerificationStep('loading_models');
        try {
            // Using a reliable CDN for models
            const MODEL_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            setModelsLoaded(true);
            setVerificationStep('camera');
        } catch (err) {
            console.error("Error loading models:", err);
            toast.error("Failed to load AI models. Please check your connection.");
            setVerificationStep('idle');
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (!modelsLoaded) {
                await loadModels();
            } else {
                setVerificationStep('camera');
            }
        } catch (err) {
            toast.error("Camera access denied. Please enable camera for verification.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = async () => {
        const video = document.getElementById('webcam-feed');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        setVerificationStep('scanning');
        runRealFaceDetection(canvas);
    };

    const runRealFaceDetection = async (input) => {
        setScanningProgress(10);
        try {
            // Give UI a bit of time to show the image
            await new Promise(r => setTimeout(r, 500));
            setScanningProgress(30);

            const detections = await faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            setScanningProgress(70);
            await new Promise(r => setTimeout(r, 800));

            if (detections) {
                setScanningProgress(100);
                setTimeout(() => {
                    setVerificationStep('verified');
                    toast.success("Identity verified successfully!");
                }, 500);
            } else {
                setScanningProgress(0);
                setVerificationStep('camera');
                toast.error("No face detected. Please ensure your face is clear and visible.");
            }
        } catch (err) {
            console.error("Face detection error:", err);
            toast.error("Error during face verification. Please try again.");
            setVerificationStep('camera');
        }
    };

    const handleGroupPhotoUpload = async (file) => {
        if (!file) return;
        setGroupPhoto(file);

        if (!modelsLoaded) {
            await loadModels();
        }

        setVerificationStep('scanning');
        setScanningProgress(10);

        try {
            const img = await faceapi.bufferToImage(file);
            setScanningProgress(40);

            const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions());

            setScanningProgress(80);
            await new Promise(r => setTimeout(r, 800));

            if (detections.length > 0) {
                setScanningProgress(100);
                setTimeout(() => {
                    setVerificationStep('verified');
                    toast.success(`Verified! Detected ${detections.length} faces in group photo.`);
                }, 500);
            } else {
                setScanningProgress(0);
                setGroupPhoto(null);
                setVerificationStep('idle');
                toast.error("No clear faces found in your group photo. Please upload a clearer image.");
            }
        } catch (err) {
            toast.error("Analysis failed. Please upload a clear JPG/PNG image.");
            setVerificationStep('idle');
        }
    };

    const handleConfirmBooking = async (e) => {
        if (e) e.preventDefault();

        // Single Ticket logic: Require AI Verification
        if (bookingType === 'single' && verificationStep !== 'verified') {
            if (verificationStep === 'idle') {
                startCamera();
            } else {
                toast.warn("Please complete the face verification capture first.");
            }
            return;
        }

        // Group Ticket logic: Require photo
        if (bookingType === 'group' && !groupPhoto) {
            toast.warn("Please upload a group photo for verification");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('eventId', id);
            formData.append('tickets', tickets);
            formData.append('bookingType', bookingType);
            if (groupPhoto) formData.append('image', groupPhoto); // controller expects 'image' for photo

            const { data } = await axios.post(`${backendUrl}/api/bookings/book`,
                formData,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            if (data.success) {
                navigate('/my-bookings', { state: { message: "Booking successful! Your tickets have been sent to your email." } });
            } else {
                toast.error(data.message);
                if (bookingType === 'single') setVerificationStep('idle');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
            if (bookingType === 'single') setVerificationStep('idle');
        } finally {
            setLoading(false);
        }
    };

    if (!event) return <div className="p-20 text-center font-bold text-gray-400">Loading checkout...</div>;

    const total = (event.price * tickets).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] py-12">
            <div className="max-w-6xl mx-auto px-6">

                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">Purchase Experience</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT: Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Ticket Type Selection */}
                        <div className="bg-white dark:bg-[#1a1a1c] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
                                Select Ticket Type
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setBookingType('single')}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col gap-3 text-left ${bookingType === 'single'
                                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                                        : 'border-gray-100 dark:border-gray-800 hover:border-blue-200'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl w-fit ${bookingType === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white">Single Ticket</p>
                                        <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">Includes AI identity verification</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setBookingType('group')}
                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col gap-3 text-left ${bookingType === 'group'
                                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                                        : 'border-gray-100 dark:border-gray-800 hover:border-blue-200'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl w-fit ${bookingType === 'group' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white">Group Ticket</p>
                                        <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">2 to 6 people per group</p>
                                    </div>
                                </button>
                            </div>

                            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {bookingType === 'single' ? 'General Admission (Individual)' : 'General Admission (Group)'}
                                    </p>
                                    <p className="text-sm text-gray-500">{event.price > 0 ? `${currency}${event.price} per ticket` : 'Free'}</p>
                                </div>

                                {bookingType === 'group' && (
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setTickets(t => Math.max(2, t - 1))}
                                            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition"
                                        >-</button>
                                        <span className="font-black text-lg w-6 text-center">{tickets}</span>
                                        <button
                                            type="button"
                                            onClick={() => setTickets(t => Math.min(Math.min(6, event.ticketsAvailable), t + 1))}
                                            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition"
                                        >+</button>
                                    </div>
                                )}
                                {bookingType === 'single' && (
                                    <span className="font-black text-blue-600 uppercase tracking-widest text-xs">1 Ticket only</span>
                                )}
                            </div>
                        </div>

                        {/* 2. Verification / Group Photo */}
                        <AnimatePresence mode="wait">
                            {bookingType === 'group' && (
                                <motion.div
                                    key="group-verification"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white dark:bg-[#1a1a1c] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm"
                                >
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
                                        Group Verification
                                    </h2>
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {groupPhoto ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    {verificationStep === 'verified' ? (
                                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                                    ) : (
                                                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                    )}
                                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{groupPhoto.name}</p>
                                                    <p className="text-xs text-blue-600 font-black uppercase tracking-widest">{verificationStep === 'verified' ? 'verified' : 'Analyzing Faces...'}</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <Camera className="w-10 h-10 text-gray-400 mb-3" />
                                                    <p className="text-sm font-bold text-gray-500">Upload Group Photo</p>
                                                    <p className="text-xs text-gray-400 mt-1 uppercase font-black tracking-widest">Ensuring all faces are clear</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleGroupPhotoUpload(e.target.files[0])}
                                            disabled={verificationStep === 'scanning'}
                                        />
                                    </label>
                                </motion.div>
                            )}

                            {bookingType === 'single' && (
                                <motion.div
                                    key="ai-verification-camera"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`rounded-3xl p-8 border shadow-sm transition-all duration-500 ${verificationStep === 'verified'
                                        ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                                        : 'bg-white dark:bg-[#1a1a1c] border-gray-100 dark:border-gray-800'
                                        }`}
                                >
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">2</span>
                                        Live Identity Verification
                                    </h2>

                                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-4 border-gray-100 dark:border-gray-800 shadow-inner group">
                                        {verificationStep === 'idle' && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                                <Camera className="w-12 h-12 text-gray-500 mb-4" />
                                                <p className="text-gray-400 font-bold text-sm">Real-time Biometric Face Verification</p>
                                                <button
                                                    onClick={startCamera}
                                                    className="mt-4 px-6 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-blue-700 transition"
                                                >
                                                    Start Live Verification
                                                </button>
                                            </div>
                                        )}

                                        {verificationStep === 'loading_models' && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gray-900/50 backdrop-blur-sm">
                                                <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
                                                <p className="text-white font-bold text-sm tracking-widest uppercase">Initializing AI Models...</p>
                                                <p className="text-gray-400 text-[10px] mt-2 italic">Securing your identity with neural analysis</p>
                                            </div>
                                        )}

                                        {verificationStep === 'camera' && (
                                            <>
                                                <video
                                                    id="webcam-feed"
                                                    autoPlay
                                                    playsInline
                                                    ref={video => { if (video) video.srcObject = stream }}
                                                    className="w-full h-full object-cover scale-x-[-1]"
                                                />
                                                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                                                    <div className="w-full h-full border-2 border-blue-500/50 rounded-[50%] animate-pulse scale-90"></div>
                                                </div>
                                                <button
                                                    onClick={capturePhoto}
                                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-blue-600 shadow-2xl flex items-center justify-center group-active:scale-95 transition"
                                                >
                                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                                        <Camera className="w-6 h-6" />
                                                    </div>
                                                </button>
                                            </>
                                        )}

                                        {(verificationStep === 'scanning' || verificationStep === 'captured' || verificationStep === 'verified') && (
                                            <div className="relative w-full h-full">
                                                <img src={capturedImage} className="w-full h-full object-cover scale-x-[-1]" />
                                                {verificationStep === 'scanning' && (
                                                    <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                                        <div className="w-full h-1 bg-blue-400 absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="bg-white/90 dark:bg-black/80 px-4 py-2 rounded-xl flex items-center gap-3 shadow-2xl"
                                                        >
                                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                            <span className="text-xs font-black uppercase tracking-widest text-blue-600">Analyzing Biometrics... {Math.round(scanningProgress)}%</span>
                                                        </motion.div>
                                                    </div>
                                                )}
                                                {verificationStep === 'verified' && (
                                                    <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[1px] flex items-center justify-center">
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="bg-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
                                                        >
                                                            <CheckCircle className="w-8 h-8 text-green-500" />
                                                            <span className="text-sm font-black uppercase tracking-widest text-green-600">Identity Verified</span>
                                                        </motion.div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {verificationStep === 'verified' && (
                                        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-green-600" />
                                            <p className="text-xs font-bold text-green-700 dark:text-green-400">Your face identity has been verified successfully. You can now proceed to payment.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. Contact Information */}
                        <form onSubmit={handleConfirmBooking} className="bg-white dark:bg-[#1a1a1c] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">3</span>
                                Contact Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-400">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-gray-400">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <label className="text-xs font-black uppercase text-gray-400">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 transition outline-none dark:text-white"
                                />
                                <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wide">Tickets will be sent to this email address automatically.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || verificationStep === 'scanning'}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 ${verificationStep === 'verified' || bookingType === 'group'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                    : 'bg-black dark:bg-white dark:text-black text-white'
                                    }`}
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        {bookingType === 'single' && verificationStep !== 'verified' ? 'Verify & Buy Ticket' : `Buy Ticket • ${currency}${total}`}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="relative">
                        <div className="sticky top-24 bg-white dark:bg-[#1a1a1c] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
                            <div className="aspect-[2/1] relative">
                                <img src={event.image && event.image.startsWith('/uploads') ? backendUrl + event.image : event.image} alt={event.title} className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {bookingType}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="font-black text-gray-900 dark:text-white mb-2 leading-tight text-xl">{event.title}</h3>
                                <p className="text-sm font-bold text-gray-500 mb-6">
                                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>

                                <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-800">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-bold tracking-tight">{tickets} x {bookingType === 'single' ? 'Individual Access' : 'Group Pass'}</span>
                                        <span className="font-black text-gray-900 dark:text-white">{currency}{total}</span>
                                    </div>
                                    <div className="flex justify-between text-lg pt-4 border-t border-gray-50 dark:border-gray-800">
                                        <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Total Payable</span>
                                        <span className="font-black text-3xl text-gray-900 dark:text-white">{currency}{total}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Secure Checkout</span>
                                </div>
                                <p className="text-[10px] text-center font-bold text-gray-400 leading-relaxed uppercase tracking-tighter">
                                    Powered by Antigravity Events
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
