import React from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RotateCcw, Home } from 'lucide-react';

const PaymentFailure = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const params = useParams();
    const eventId = params.eventId || searchParams.get('eventId');

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-transparent flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="max-w-md w-full bg-transparent dark:bg-white dark:bg-zinc-900 rounded-[3rem] p-10 shadow-2xl border border-zinc-100 dark:border-zinc-200 dark:border-zinc-800 text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-100 dark:ring-red-900/30"
                >
                    <XCircle className="w-12 h-12 text-red-500" />
                </motion.div>

                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 dark:text-zinc-900 dark:text-white mb-3">
                    Payment Failed
                </h1>
                <p className="text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">
                    Your payment was not completed. No money has been deducted.
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 text-xs mb-10">
                    If you believe this is an error, please try again or contact support.
                </p>

                {/* Divider */}
                <div className="w-full border-t border-dashed border-zinc-200 dark:border-zinc-800 dark:border-zinc-700 mb-8" />

                {/* Info box */}
                <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20 text-left mb-8">
                    <span className="text-orange-500 mt-0.5 text-lg">⚠</span>
                    <p className="text-xs text-orange-700 dark:text-orange-400 font-medium leading-relaxed">
                        If any amount was deducted from your eSewa wallet, it will be automatically refunded within 3–5 business days.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {eventId && (
                        <button
                            onClick={() => navigate(`/checkout/${eventId}`)}
                            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-700 text-zinc-900 dark:text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Try Again
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-600 dark:text-zinc-300 font-black uppercase tracking-widest text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentFailure;

