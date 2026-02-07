import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapComponent = ({ latitude, longitude, height = '400px' }) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const mapContainerStyle = {
        width: '100%',
        height: height
    };

    const center = {
        lat: latitude || 40.7128, // Default to New York if no coordinates
        lng: longitude || -74.0060
    };

    // If no API key is set, show placeholder
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        return (
            <div
                className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
                style={{ height }}
            >
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="font-semibold">Map View</p>
                <p className="text-sm mt-1">Add Google Maps API key to display map</p>
                {latitude && longitude && (
                    <p className="text-xs mt-2">
                        Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                )}
            </div>
        );
    }

    return (
        <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
            >
                <Marker position={center} />
            </GoogleMap>
        </LoadScript>
    );
};

export default MapComponent;
