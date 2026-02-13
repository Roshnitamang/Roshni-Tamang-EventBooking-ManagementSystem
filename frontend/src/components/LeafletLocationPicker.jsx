import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            onLocationSelect({ latitude: lat, longitude: lng });
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

const LeafletLocationPicker = ({ onLocationSelect, initialLat, initialLng }) => {
    // Default to Kathmandu if no coords provided
    const [position, setPosition] = useState(
        initialLat && initialLng ? [initialLat, initialLng] : [27.7172, 85.3240]
    );

    // Sync state if initial props change
    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng]);
        }
    }, [initialLat, initialLng]);

    return (
        <div className="space-y-3">
            <div style={{ height: '400px', width: '100%', borderRadius: '1.5rem', overflow: 'hidden' }} className="border-2 border-gray-100 dark:border-gray-800 shadow-inner">
                <MapContainer
                    center={position}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
                </MapContainer>
            </div>
            <div className="flex items-center justify-between px-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Click Map to Pin Event Location
                </p>
                {position && (
                    <p className="text-[10px] text-gray-400 font-mono bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800">
                        {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LeafletLocationPicker;
