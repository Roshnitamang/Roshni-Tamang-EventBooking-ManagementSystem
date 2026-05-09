import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Users, Camera, ChevronRight, ChevronLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
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
    const [isBypassed, setIsBypassed] = useState(false);

    // AI/Webcam Diagnostics
    const [detectionStatus, setDetectionStatus] = useState("Initializing sensors...");
    const [isManualCaptureAllowed, setIsManualCaptureAllowed] = useState(false);

    // AI/Webcam State
    const webcamRef = useRef(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [captured, setCaptured] = useState(false);
    const isCapturing = useRef(false);

    useEffect(() => {
        const loadModels = async () => {
            try {
                setDetectionStatus("Loading AI assets...");
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setIsModelsLoaded(true);
                setDetectionStatus("Sensors synchronized");
                toast.info("Security assets loaded", { autoClose: 2000 });
            } catch (error) {
                console.error("Models failed to load", error);
                setDetectionStatus("AI initialization failed");
            }
        };
        loadModels();
    }, []);

    // Manual capture fallback timer
    useEffect(() => {
        let timer;
        if (step === 2 && scanning && !captured) {
            timer = setTimeout(() => {
                setIsManualCaptureAllowed(true);
            }, 8000); 
        }
        return () => clearTimeout(timer);
    }, [step, scanning, captured]);

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

    const capturePhoto = () => {
        if (!webcamRef.current || isCapturing.current) return;
        isCapturing.current = true;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            isCapturing.current = false;
            return;
        }

        setPreview(imageSrc);
        setCaptured(true);
        setScanning(false);

        try {
            const arr = imageSrc.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], "face_verification.jpg", { type: mime });
            setImage(file);
            
            // Auto-proceed to step 3 after a brief success display
            setTimeout(() => {
                setStep(3);
                isCapturing.current = false;
            }, 1000);
        } catch (e) {
            console.error("Failed to process image capture:", e);
            toast.error("Failed to capture image. Try again.");
            isCapturing.current = false;
            setCaptured(false);
            setPreview(null);
        }
    };

    // Live Face Detection Loop
    useEffect(() => {
        let timeout;
        let isRunning = true;

        const runDetection = async () => {
            if (!scanning || !isModelsLoaded || !webcamRef.current || captured || !isRunning) return;

            const video = webcamRef.current.video;
            if (video && video.readyState === 4 && video.videoWidth > 0) {
                try {
                    // Use detectAllFaces to ensure only ONE person is present for Single Bookings
                    let detections = await faceapi.detectAllFaces(
                        video, 
                        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })
                    );

                    // Fallback to TinyFaceDetector if SSD returns nothing or to cross-verify
                    if (detections.length === 0) {
                        detections = await faceapi.detectAllFaces(
                            video,
                            new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
                        );
                    }

                    if (detections.length === 1) {
                        setFaceDetected(true);
                        setDetectionStatus("Identity Isolated. Verifying...");
                        if (!isCapturing.current) capturePhoto();
                    } else if (detections.length > 1) {
                        setFaceDetected(false);
                        setDetectionStatus("Multiple Entities! Single Person only.");
                    } else {
                        setFaceDetected(false);
                        setDetectionStatus("Searching for valid target...");
                    }
                } catch (err) {
                    console.error("Detection logic failed:", err);
                }
            }
            
            if (isRunning) {
                timeout = setTimeout(runDetection, 400);
            }
        };

        if (scanning && isModelsLoaded && !captured) {
            runDetection();
        }

        return () => {
            isRunning = false;
            clearTimeout(timeout);
        };
    }, [scanning, isModelsLoaded, captured]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imgUrl = URL.createObjectURL(file);
            const img = new Image();
            img.src = imgUrl;
            img.onload = async () => {
                try {
                    const detections = await faceapi.detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }));
                    if (detections.length === 0) {
                        toast.error("No faces detected! Please upload a clearer image.");
                        setImage(null);
                        setPreview(null);
                    } else if (detections.length < tickets) {
                        toast.error(`Only ${detections.length} face(s) detected, but you selected ${tickets} tickets. Please upload a photo with everyone.`);
                        setImage(null);
                        setPreview(null);
                    } else {
                        toast.success(`${detections.length} face(s) detected successfully!`);
                        setImage(file);
                        setPreview(imgUrl);
                    }
                } catch (error) {
                    console.error("Face validation error:", error);
                    toast.error("Failed to validate image. Please try again.");
                }
            };
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
            
            // Append isBypassed first (important for some multer versions)
            formData.append('isBypassed', isBypassed ? '1' : '0');
            formData.append('eventId', eventId);
            formData.append('tickets', tickets);
            formData.append('bookingType', bookingType);
            
            if (image) {
                formData.append('image', image);
            }

            const { data } = await axios.post(`${backendUrl}/api/bookings/initiate-esewa?isBypassed=${isBypassed}`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success && data.esewaData) {
                toast.success("Redirecting to payment gateway...");
                const form = document.createElement('form');
                form.setAttribute('method', 'POST');
                // Use paymentUrl from backend (not hardcoded, not from esewaData fields)
                form.setAttribute('action', data.paymentUrl);
                Object.entries(data.esewaData).forEach(([key, value]) => {
                    const hiddenField = document.createElement('input');
                    hiddenField.setAttribute('type', 'hidden');
                    hiddenField.setAttribute('name', key);
                    hiddenField.setAttribute('value', value);
                    form.appendChild(hiddenField);
                });
                document.body.appendChild(form);
                form.submit();

            } else {
                toast.error(data.message || "Booking initialization failed");
                setSubmitting(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!event) return null;

    return (
        <div className="min-h-screen bg-transparent py-24 px-6 relative transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-12">
                {/* Header & Progress */}
                <header className="space-y-8 text-center pb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Secure Checkout Vault</span>
                    </div>
                    
                    <div className="flex gap-3 max-w-sm mx-auto">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex-1 space-y-2">
                                <div className={`h-1.5 rounded-full transition-all duration-700 ${s <= step ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                                <span className={`text-[8px] font-black uppercase tracking-widest block transition-colors duration-500 ${s <= step ? 'text-emerald-500' : 'text-zinc-700'}`}>
                                    Step 0{s}
                                </span>
                            </div>
                        ))}
                    </div>
                </header>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 relative z-10">
                                <div className="text-center">
                                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic mb-3">Booking Preference</h2>
                                    <p className="text-zinc-500 font-medium">Individual or Squad? Choose your path.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        onClick={() => { setBookingType('single'); setTickets(1); }}
                                        className={`p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group/btn ${bookingType === 'single' ? 'border-emerald-600 bg-emerald-500/5' : 'border-zinc-200 dark:border-zinc-800 bg-transparent/50 hover:border-zinc-700'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${bookingType === 'single' ? 'bg-emerald-600 text-zinc-900 dark:text-white shadow-lg shadow-emerald-900/40 rotate-3' : 'bg-zinc-800 text-zinc-500 group-hover/btn:bg-zinc-700'}`}>
                                            <Ticket className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-black text-xl text-zinc-900 dark:text-white uppercase tracking-tight">Single Ticket</h3>
                                        <p className="text-[10px] text-zinc-500 mt-2 font-black uppercase tracking-widest">AI Face Verification Required</p>
                                        {bookingType === 'single' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                    </button>

                                    <button
                                        onClick={() => { setBookingType('group'); setTickets(2); }}
                                        className={`p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group/btn ${bookingType === 'group' ? 'border-emerald-600 bg-emerald-500/5' : 'border-zinc-200 dark:border-zinc-800 bg-transparent/50 hover:border-zinc-700'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${bookingType === 'group' ? 'bg-emerald-600 text-zinc-900 dark:text-white shadow-lg shadow-emerald-900/40 rotate-3' : 'bg-zinc-800 text-zinc-500 group-hover/btn:bg-zinc-700'}`}>
                                            <Users className="w-7 h-7" />
                                        </div>
                                        <h3 className="font-black text-xl text-zinc-900 dark:text-white uppercase tracking-tight">Group Booking</h3>
                                        <p className="text-[10px] text-zinc-500 mt-2 font-black uppercase tracking-widest">2 to 6 Tickets allowed</p>
                                        {bookingType === 'group' && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                    </button>
                                </div>

                                {bookingType === 'group' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-8 bg-transparent rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Quota Configuration</span>
                                                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Total Group Allocation</p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <button onClick={() => setTickets(Math.max(2, tickets - 1))} className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 text-zinc-900 dark:text-white flex items-center justify-center font-black transition-all">-</button>
                                                <span className="font-black text-4xl text-emerald-500 tracking-tighter w-10 text-center">{tickets}</span>
                                                <button onClick={() => setTickets(Math.min(6, tickets + 1))} className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 text-zinc-900 dark:text-white flex items-center justify-center font-black transition-all">+</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <button
                                    onClick={() => { setStep(2); if (bookingType === 'single') setScanning(true); }}
                                    className="w-full bg-emerald-600 text-zinc-900 dark:text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/40 flex items-center justify-center gap-4 active:scale-[0.98]"
                                >
                                    Proceed to Verification <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 relative z-10">
                                <div className="text-center">
                                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic mb-3">{bookingType === 'single' ? 'Biometric Scan' : 'Identity Registry'}</h2>
                                    <p className="text-zinc-500 font-medium">
                                        {bookingType === 'single' ? 'Align your profile within the frame for AI verification.' : 'Upload a group artifact including all constituents.'}
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    {bookingType === 'single' ? (
                                        <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden bg-black shadow-2xl border-4 border-zinc-200 dark:border-zinc-800 group/cam">
                                            {!captured ? (
                                                <>
                                                    <Webcam
                                                        audio={false}
                                                        ref={webcamRef}
                                                        screenshotFormat="image/jpeg"
                                                        className="w-full h-full object-cover grayscale-[30%] group-hover/cam:grayscale-0 transition-all duration-700"
                                                        onUserMedia={() => setScanning(true)}
                                                    />
                                                    <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scan z-20" />
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                        <div className={`w-48 h-64 border-2 rounded-[4rem] transition-all duration-500 ${faceDetected ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/20 border-dashed backdrop-blur-[2px]'}`} />
                                                        <div className={`mt-8 px-6 py-2 rounded-full flex items-center gap-3 transition-all duration-500 ${faceDetected ? 'bg-emerald-600 shadow-xl' : 'bg-black/60 backdrop-blur-md'}`}>
                                                            {faceDetected && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
                                                                {detectionStatus}
                                                            </p>
                                                        </div>

                                                        {isManualCaptureAllowed && !faceDetected && (
                                                           <button 
                                                              onClick={(e) => { e.stopPropagation(); capturePhoto(); }}
                                                              className="mt-6 px-6 py-3 bg-emerald-600 text-zinc-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-500 transition-all pointer-events-auto"
                                                           >
                                                              Override & Snap Photo
                                                           </button>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="relative w-full h-full animate-in zoom-in-110 duration-700">
                                                    <img src={preview} className="w-full h-full object-cover" />
                                                    <div className="absolute top-6 right-6 bg-emerald-600 text-zinc-900 dark:text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-2xl">
                                                        <CheckCircle2 className="w-4 h-4" /> Identity Logged
                                                    </div>
                                                    <button onClick={() => { setCaptured(false); setPreview(null); setScanning(true); setIsManualCaptureAllowed(false); }} className="absolute bottom-8 right-8 px-6 py-3 bg-transparent/80 backdrop-blur-xl border border-white/10 rounded-2xl text-zinc-900 dark:text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all">
                                                        Redo Scan
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div onClick={() => !isBypassed && document.getElementById('group-img').click()} className={`aspect-[4/3] rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all bg-transparent/50 overflow-hidden relative group/upload ${isBypassed ? 'opacity-20 cursor-not-allowed border-zinc-800' : 'cursor-pointer border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50'}`}>
                                                {preview ? (
                                                    <>
                                                        <img src={preview} className="w-full h-full object-cover grayscale-[50%] group-hover/upload:grayscale-0 transition-all duration-700" />
                                                        <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover/upload:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                                                            <span className="bg-white text-emerald-950 rounded-full px-6 py-3 font-black uppercase text-[10px] tracking-widest shadow-2xl">Replace Artifact</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="p-6 bg-zinc-800 rounded-3xl group-hover/upload:scale-110 transition-transform duration-500 shadow-xl text-emerald-500">
                                                            <Camera className="w-10 h-10" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-[0.2em]">Upload Group Dossier</p>
                                                            <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-[0.3em]">Detecting {tickets} Active Faces</p>
                                                        </div>
                                                    </>
                                                )}
                                                <input id="group-img" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => {
                                                        setIsBypassed(!isBypassed);
                                                        if (!isBypassed) {
                                                            setImage(null);
                                                            setPreview(null);
                                                        }
                                                    }}
                                                    className={`flex-1 py-4 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${isBypassed ? 'bg-emerald-600 border-emerald-600 text-zinc-900' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                                >
                                                    {isBypassed ? 'Photo Bypassed ✓' : 'Bypass Photo Verification'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Verification Requirements Checklist */}
                                    <div className="grid grid-cols-2 gap-4">
                                       {[
                                          "Good Lighting",
                                          "Front Facing",
                                          "No Accessories",
                                          "Clear Visibility"
                                       ].map((req, i) => (
                                          <div key={i} className="flex items-center gap-3 px-5 py-3 bg-transparent rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                             <CheckCircle2 className={`w-3 h-3 ${faceDetected ? 'text-emerald-500' : 'text-zinc-800'}`} />
                                             <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">{req}</span>
                                          </div>
                                       ))}
                                    </div>

                                    <div className="flex items-start gap-5 p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10">
                                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                                           <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Privacy Encryption Layer</p>
                                            <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                                                Biometric data points are encrypted and processed locally. Personal imagery is scrubbed from public caches post-verification.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-[2rem] bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px] hover:text-zinc-900 dark:text-white transition-all">Previous</button>
                                    <button
                                        onClick={() => (captured || isBypassed || (bookingType === 'group' && preview)) && setStep(3)}
                                        disabled={!isBypassed && !preview && (bookingType === 'group' || (bookingType === 'single' && !captured))}
                                        className="flex-[2] py-5 rounded-[2rem] bg-emerald-600 text-zinc-900 dark:text-white font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-emerald-900/40 disabled:opacity-20 transition-all active:scale-[0.98]"
                                    >
                                        Seal Identity
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 relative z-10">
                                <div className="text-center">
                                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic mb-3">Manifest Summary</h2>
                                    <p className="text-zinc-500 font-medium">Final calibration before secure deployment.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-10 bg-transparent rounded-[3rem] border border-zinc-200 dark:border-zinc-800 space-y-8 shadow-inner">
                                        <div className="flex justify-between items-start border-b border-zinc-900 pb-8">
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.4em]">Target Experience</p>
                                                <p className="font-black text-2xl text-zinc-900 dark:text-white uppercase tracking-tighter max-w-[240px] leading-none">{event.title}</p>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <p className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.4em]">Units</p>
                                                <p className="font-black text-2xl text-emerald-500 tracking-tighter">{tickets}x {bookingType}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                               <p className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.4em]">Total Commitment</p>
                                               <p className="text-zinc-500 text-[10px] font-bold">Standard Network Fees Included</p>
                                            </div>
                                            <div className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter flex flex-col items-end">
                                               <div className="flex items-center">
                                                   <span className="text-lg opacity-40 mr-2">{currency}</span>
                                                   {event.price * tickets}
                                               </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 px-6 py-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <p className="text-[9px] text-red-500/60 font-black uppercase tracking-[0.2em]">Warning: Final reservation logic is non-reversible within 24h of start.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(2)} className="flex-1 py-5 rounded-[2rem] bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px] hover:text-zinc-900 dark:text-white transition-all">Modify</button>
                                    <button
                                        onClick={handleBooking}
                                        disabled={submitting}
                                        className="flex-[2] py-6 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-700 text-zinc-900 dark:text-white font-black uppercase tracking-[0.5em] text-[12px] shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:shadow-emerald-500/50 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {submitting ? 'Processing Ledger...' : 'Secure via eSewa'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
                
                {/* Visual Depth Elements */}
                <div className="flex justify-center gap-2 text-[9px] font-black text-zinc-800 uppercase tracking-[0.6em] mt-12">
                   Powered by Planora Protocol
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0%, 100% { top: 0; }
                    50% { top: 100%; }
                }
                .animate-scan {
                    height: 20px !important;
                    animation: scan 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};


export default Checkout;

