import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapLocationPicker = ({ onLocationSelect, initialLat, initialLng }) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [markerPosition, setMarkerPosition] = useState({
        lat: initialLat || 40.7128,
        lng: initialLng || -74.0060
    });

    const mapContainerStyle = {
        width: '100%',
        height: '400px'
    };

    const handleMapClick = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setMarkerPosition({ lat, lng });

        // Call the callback with coordinates
        if (onLocationSelect) {
            onLocationSelect({ latitude: lat, longitude: lng });
        }
    }, [onLocationSelect]);

    // If no API key is set, show placeholder
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        return (
            <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="font-semibold text-center px-4">Map Location Picker</p>
                <p className="text-sm mt-2 text-center px-4">Add Google Maps API key to .env file to enable map-based location selection</p>
                <p className="text-xs mt-4 text-gray-400">Click on the map to set event location</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <LoadScript googleMapsApiKey={apiKey}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPosition}
                    zoom={13}
                    onClick={handleMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                    }}
                >
                    <Marker position={markerPosition} />
                </GoogleMap>
            </LoadScript>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                📍 Click anywhere on the map to set your event location
            </p>
            {markerPosition && (
                <p className="text-xs text-gray-400 font-mono">
                    Coordinates: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                </p>
            )}
        </div>
    );
};

export default MapLocationPicker;
