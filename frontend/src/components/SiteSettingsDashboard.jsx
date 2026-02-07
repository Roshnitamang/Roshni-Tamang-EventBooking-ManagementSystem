import { useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'
import { AppContent } from '../context/AppContext'
import { toast } from 'react-toastify'
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react'
import ImageCropper from './ImageCropper'

const SiteSettingsDashboard = () => {
    const { backendUrl } = useContext(AppContent)
    const [settings, setSettings] = useState({
        heroTitle: '',
        heroSubtitle: '',
        heroImage: ''
    })
    const [file, setFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null) // For cropper
    const [croppedImageBlob, setCroppedImageBlob] = useState(null) // Final cropped blob to upload
    const [showCropper, setShowCropper] = useState(false)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchSettings()
    }, [backendUrl])

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/settings`)
            if (data.success) {
                setSettings(data.settings)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0]
            const url = URL.createObjectURL(selectedFile)
            setPreviewUrl(url)
            setShowCropper(true)
            // Reset input so same file selection works if cancelled
            e.target.value = null
        }
    }

    const onCropComplete = (croppedBlob) => {
        setCroppedImageBlob(croppedBlob)
        // Create a preview URL for the dashboard display
        const croppedUrl = URL.createObjectURL(croppedBlob)
        // Optimistically update the preview (not the settings.heroImage yet)
        // We track this separately or just rely on 'croppedImageBlob' presence
        setShowCropper(false)
    }

    const onCancelCrop = () => {
        setShowCropper(false)
        setPreviewUrl(null)
        setCroppedImageBlob(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('heroTitle', settings.heroTitle)
            formData.append('heroSubtitle', settings.heroSubtitle)

            if (croppedImageBlob) {
                // Determine extension/type (defaulting to jpeg as per cropper output)
                const fileType = 'image/jpeg';
                const fileName = 'hero-image.jpg';
                const file = new File([croppedImageBlob], fileName, { type: fileType });
                formData.append('heroImage', file)
            }

            const { data } = await axios.put(`${backendUrl}/api/settings/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            })

            if (data.success) {
                setSettings(data.settings)
                setCroppedImageBlob(null)
                setPreviewUrl(null)
                toast.success('Site settings updated!')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {showCropper && previewUrl && (
                <ImageCropper
                    image={previewUrl}
                    onCropComplete={onCropComplete}
                    onCancel={onCancelCrop}
                />
            )}

            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                    Site Appearance
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize the home page hero section</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* Image Preview & Upload */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hero Image
                    </label>

                    <div className="relative aspect-[16/9] w-full max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center group">
                        {(croppedImageBlob || settings.heroImage) ? (
                            <img
                                src={croppedImageBlob ? URL.createObjectURL(croppedImageBlob) : (settings.heroImage?.startsWith('/uploads') ? backendUrl + settings.heroImage : settings.heroImage)}
                                alt="Hero"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center p-6">
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No image set</p>
                            </div>
                        )}

                        {/* Upload Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                            >
                                <Upload className="w-4 h-4" />
                                Change Image
                            </button>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recommended size: 1920x1080 (16:9 ratio). You will be able to crop the image after selecting.
                    </p>
                </div>

                {/* Text Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Hero Title
                        </label>
                        <input
                            type="text"
                            value={settings.heroTitle}
                            onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Discover Amazing Events"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Hero Subtitle
                        </label>
                        <input
                            type="text"
                            value={settings.heroSubtitle}
                            onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Find and book..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    )
}

export default SiteSettingsDashboard
