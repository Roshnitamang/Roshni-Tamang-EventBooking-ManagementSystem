import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle, Info, User, ShieldCheck, MapPin, Camera, ChevronRight, Check, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

const NEPAL_DISTRICTS = [
    "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke", "Bara", "Bardiya", "Bhaktapur", "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh", "Dang", "Darchula", "Dhading", "Dhankuta", "Dhanusa", "Dolakha", "Dolpa", "Doti", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla", "Kailali", "Kalikot", "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu", "Kavrepalanchok", "Khotang", "Lalitpur", "Lamjung", "Mahottari", "Makwanpur", "Manang", "Mustang", "Mugu", "Myagdi", "Nawalpur", "Nuwakot", "Okhaldhunga", "Parbat", "Parsa", "Parasi", "Panchthar", "Pyuthan", "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rukum East", "Rukum West", "Rupandehi", "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli", "Sindhupalchok", "Siraha", "Solukhumbu", "Sunsari", "Surkhet", "Syangja", "Tanahu", "Taplejung", "Terhathum", "Udayapur"
];

const OCCUPATIONS = [
    "Student", "Private Employee", "Government Employee", "Business", "Self-Employed", "Retired", "Unemployed", "Professional", "Farmer", "Other"
];

const ID_TYPES = [
    "Citizenship Certificate", "Passport", "Driving License", "Voter ID", "National ID Card"
];

const KYCFormModal = ({ isOpen, onClose }) => {
    const { backendUrl, getUserData } = useContext(AppContent);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        fullName: '',
        fatherName: '',
        motherName: '',
        grandfatherName: '',
        dob: '',
        gender: 'Male',
        phoneNumber: '',
        occupation: 'Student',
        country: 'Nepal',
        permanentDistrict: 'Kathmandu',
        permanentMunicipality: '',
        permanentWard: '',
        permanentVillageStreet: '',
        currentDistrict: 'Kathmandu',
        currentMunicipality: '',
        currentWard: '',
        currentVillageStreet: '',
        idType: 'Citizenship Certificate',
        idNumber: '',
        issueDate: '',
        issueDistrict: 'Kathmandu'
    });

    const [files, setFiles] = useState({
        profilePhoto: null,
        idFront: null,
        idBack: null
    });

    const [previews, setPreviews] = useState({
        profilePhoto: null,
        idFront: null,
        idBack: null
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles[0]) {
            setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
            setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(selectedFiles[0]) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step < 4) {
            setStep(step + 1);
            return;
        }

        if (!files.idFront || !files.idBack || !files.profilePhoto) {
            return toast.error("Please upload Passport Photo, ID Front, and ID Back images");
        }

        try {
            setLoading(true);
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            data.append('profilePhoto', files.profilePhoto);
            data.append('idFront', files.idFront);
            data.append('idBack', files.idBack);

            const response = await axios.post(`${backendUrl}/api/user/submit-kyc`, data, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                getUserData();
                onClose();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit KYC");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const renderStepIndicators = () => (
        <div className="flex justify-between items-center mb-10 px-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= i ? 'bg-green-600 text-white shadow-lg shadow-green-500/30 scale-110' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                        {step > i ? <Check className="w-5 h-5" /> : i}
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${step >= i ? 'text-green-600' : 'text-zinc-400'}`}>
                        {i === 1 ? 'Personal' : i === 2 ? 'Address' : i === 3 ? 'ID Info' : 'Uploads'}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-zinc-950 dark:bg-zinc-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800"
            >
                {/* Header */}
                <div className="p-8 border-b border-zinc-50 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-green-600 to-emerald-800 text-white shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-950/10 rounded-2xl backdrop-blur-md">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">KYC Verification</h2>
                            <p className="text-green-100 text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">eSewa Standard Compliance</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-zinc-950/10 rounded-full transition-all active:scale-90">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10">
                    {renderStepIndicators()}

                    <form onSubmit={handleSubmit} className="space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <h3 className="text-xl font-black text-zinc-100 dark:text-white mb-6">Personal details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="As per ID" />
                                        <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />
                                        <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} />
                                        <InputField label="Grandfather's Name" name="grandfatherName" value={formData.grandfatherName} onChange={handleChange} />
                                        <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                                        <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
                                        <SelectField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} options={OCCUPATIONS} />
                                        <InputField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="98XXXXXXXX" />
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 text-green-600">
                                            <MapPin className="w-4 h-4" />
                                            <h3 className="text-sm font-black uppercase tracking-widest">Permanent Address</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <SelectField label="District" name="permanentDistrict" value={formData.permanentDistrict} onChange={handleChange} options={NEPAL_DISTRICTS} />
                                            <InputField label="Municipality" name="permanentMunicipality" value={formData.permanentMunicipality} onChange={handleChange} />
                                            <InputField label="Ward No" name="permanentWard" value={formData.permanentWard} onChange={handleChange} />
                                            <InputField label="Village / Street" name="permanentVillageStreet" value={formData.permanentVillageStreet} onChange={handleChange} />
                                        </div>
                                    </section>
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <MapPin className="w-4 h-4" />
                                            <h3 className="text-sm font-black uppercase tracking-widest">Current Address</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <SelectField label="District" name="currentDistrict" value={formData.currentDistrict} onChange={handleChange} options={NEPAL_DISTRICTS} />
                                            <InputField label="Municipality" name="currentMunicipality" value={formData.currentMunicipality} onChange={handleChange} />
                                            <InputField label="Ward No" name="currentWard" value={formData.currentWard} onChange={handleChange} />
                                            <InputField label="Village / Street" name="currentVillageStreet" value={formData.currentVillageStreet} onChange={handleChange} />
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <h3 className="text-xl font-black text-zinc-100 dark:text-white mb-6">Identity details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <SelectField label="ID Type" name="idType" value={formData.idType} onChange={handleChange} options={ID_TYPES} />
                                        <InputField label="ID Number" name="idNumber" value={formData.idNumber} onChange={handleChange} />
                                        <InputField label="Issue Date" name="issueDate" type="date" value={formData.issueDate} onChange={handleChange} />
                                        <SelectField label="Issue District" name="issueDistrict" value={formData.issueDistrict} onChange={handleChange} options={NEPAL_DISTRICTS} />
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black text-zinc-100 dark:text-white">Document Uploads</h3>
                                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full">Final Step</span>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="space-y-4 text-center lg:text-left">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">1. Profile Selfie</p>
                                            <div className="flex flex-col items-center gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-[2.5rem] border border-dashed border-zinc-800 dark:border-zinc-700">
                                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl relative group bg-zinc-200 dark:bg-zinc-700">
                                                    {previews.profilePhoto ? (
                                                        <img src={previews.profilePhoto} className="w-full h-full object-cover" alt="Profile Preview" />
                                                    ) : (
                                                        <User className="w-12 h-12 text-zinc-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                    )}
                                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px]">
                                                        <RefreshCw className="w-6 h-6 text-white mb-2 animate-spin-slow" />
                                                        <span className="text-[8px] font-black uppercase text-white tracking-widest">Change Photo</span>
                                                        <input type="file" name="profilePhoto" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Clear Background</p>
                                                    <p className="text-[10px] text-zinc-400 italic">No glasses or masks</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2 space-y-4">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">2. Identity Documents (Front & Back)</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <FileUpload label="ID Front Side" name="idFront" preview={previews.idFront} onChange={handleFileChange} />
                                                <FileUpload label="ID Back Side" name="idBack" preview={previews.idBack} onChange={handleFileChange} />
                                            </div>
                                            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30 flex gap-3">
                                                <Info className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                                <p className="text-[9px] text-green-800 dark:text-green-200 font-black uppercase leading-relaxed tracking-wider">
                                                    Scan original documents only. Avoid photocopies or blurry images to ensure fast approval.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer Actions */}
                        <div className="flex gap-4 pt-6 border-t border-zinc-50 dark:border-zinc-800 sticky bottom-0 bg-zinc-950 dark:bg-zinc-900 py-4">
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 transition-all active:scale-95">Back</button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-[2] py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all ${loading ? 'opacity-50' : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:shadow-green-500/20 active:scale-[0.98]'}`}
                            >
                                {loading ? 'Processing...' : step < 4 ? 'Next Stage' : 'Submit for Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

const InputField = ({ label, ...props }) => (
    <div className="space-y-2 group">
        <label className="text-[10px] font-black uppercase text-zinc-400 group-focus-within:text-green-600 tracking-widest ml-1 transition-colors">{label}</label>
        <input
            required
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-transparent rounded-2xl p-4 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-zinc-900 dark:text-white font-bold transition-all"
            {...props}
        />
    </div>
);

const SelectField = ({ label, options, ...props }) => (
    <div className="space-y-2 group">
        <label className="text-[10px] font-black uppercase text-zinc-400 group-focus-within:text-green-600 tracking-widest ml-1 transition-colors">{label}</label>
        <select
            required
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-transparent rounded-2xl p-4 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none text-zinc-900 dark:text-white font-bold transition-all appearance-none cursor-pointer"
            {...props}
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const FileUpload = ({ label, name, preview, onChange }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">{label}</label>
        <label className="relative group overflow-hidden bg-zinc-950 dark:bg-zinc-900 rounded-2xl aspect-video border-2 border-dashed border-zinc-100 dark:border-zinc-800 hover:border-green-500/50 transition-all flex items-center justify-center cursor-pointer">
            {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt={label} />
            ) : (
                <div className="text-center">
                    <Upload className="w-6 h-6 text-zinc-300 mx-auto mb-2 group-hover:text-green-500 transition-colors" />
                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Tap to Upload</p>
                </div>
            )}
            <input
                type="file"
                name={name}
                className="hidden"
                accept="image/*"
                onChange={onChange}
            />
            {preview && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-white/20 p-2 rounded-full mb-2">
                        <RefreshCw className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[10px] text-white font-black uppercase tracking-widest">Change Document</p>
                </div>
            )}
        </label>
    </div>
);

export default KYCFormModal;
