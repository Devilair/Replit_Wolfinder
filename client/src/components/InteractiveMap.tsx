import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix per le icone di Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  professionalName: string;
  address: string;
  city: string;
  height?: string;
}

export default function InteractiveMap({
  latitude,
  longitude,
  professionalName,
  address,
  city,
  height = "400px"
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Icona personalizzata per il professionista
  const professionalIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    // Cleanup function per evitare memory leaks
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Validazione coordinate
  if (!latitude || !longitude || 
      isNaN(latitude) || isNaN(longitude) ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180) {
    return (
      <div 
        className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="text-4xl mb-3">📍</div>
          <p className="text-gray-600 font-medium">Posizione non disponibile</p>
          <p className="text-sm text-gray-500 mt-2">
            Le coordinate geografiche non sono state trovate per questo professionista
          </p>
        </div>
      </div>
    );
  }

  const position: [number, number] = [latitude, longitude];

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={position}
        zoom={14}
        style={{ height, width: '100%' }}
        scrollWheelZoom={false}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={position} icon={professionalIcon}>
          <Popup className="custom-popup">
            <div className="p-2">
              <h3 className="font-bold text-base text-gray-800 mb-1">
                {professionalName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {address}
              </p>
              <p className="text-xs text-gray-500">
                {city}
              </p>
              <div className="mt-3 pt-2 border-t border-gray-200">
                <button 
                  onClick={() => {
                    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                    window.open(googleMapsUrl, '_blank');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                >
                  Apri in Google Maps
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Overlay con controlli personalizzati */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.zoomIn();
                }
              }}
              className="w-8 h-8 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-gray-700 text-sm font-bold"
              title="Zoom avanti"
            >
              +
            </button>
            <button
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.zoomOut();
                }
              }}
              className="w-8 h-8 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-gray-700 text-sm font-bold"
              title="Zoom indietro"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* Indicatore di posizione */}
      <div className="absolute bottom-3 left-3 z-10">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2">
          <p className="text-xs text-gray-600">
            📍 {city}
          </p>
        </div>
      </div>
    </div>
  );
}