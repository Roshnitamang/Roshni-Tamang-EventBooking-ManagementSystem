import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Helper to update map view when coordinates change
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 15);
        }
    }, [lat, lng, map]);
    return null;
};

const OpenSourceMap = ({ latitude, longitude, height = '300px', address = '' }) => {
    // Default to a central location if none provided
    const position = [latitude || 27.7172, longitude || 85.3240];

    return (
        <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }} className="border border-gray-100 dark:border-gray-800 shadow-inner">
            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    {address && (
                        <Popup>
                            <div className="font-bold text-sm">{address}</div>
                        </Popup>
                    )}
                </Marker>
                <RecenterMap lat={latitude} lng={longitude} />
            </MapContainer>
        </div>
    );
};

export default OpenSourceMap;
