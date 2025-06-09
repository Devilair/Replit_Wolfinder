import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, Globe } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Professional {
  id: number;
  businessName: string;
  description: string;
  rating: string;
  reviewCount: number;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneFixed?: string;
  phoneMobile?: string;
  website?: string;
  category: {
    name: string;
    icon: string;
  };
}

interface MapViewProps {
  professionals: Professional[];
  center?: [number, number];
  zoom?: number;
  userLocation?: [number, number];
  onProfessionalSelect?: (professional: Professional) => void;
  className?: string;
}

// Component to handle map bounds
function MapBounds({ professionals }: { professionals: Professional[] }) {
  const map = useMap();

  useEffect(() => {
    if (professionals.length > 0) {
      const validProfessionals = professionals.filter(p => p.latitude && p.longitude);
      if (validProfessionals.length > 0) {
        const bounds = L.latLngBounds(
          validProfessionals.map(p => [p.latitude, p.longitude])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [professionals, map]);

  return null;
}

// Custom icon for different categories
const createCustomIcon = (category: string, isVerified = true) => {
  const color = isVerified ? '#10B981' : '#6B7280';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        font-size: 12px;
        color: white;
        font-weight: bold;
      ">
        ${category.charAt(0).toUpperCase()}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

export function MapView({
  professionals,
  center = [44.8356, 11.6197], // Default to Ferrara
  zoom = 12,
  userLocation,
  onProfessionalSelect,
  className = ""
}: MapViewProps) {
  const mapRef = useRef<L.Map>(null);

  // Filter professionals with valid coordinates
  const validProfessionals = professionals.filter(
    p => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
  );

  const handleMarkerClick = (professional: Professional) => {
    if (onProfessionalSelect) {
      onProfessionalSelect(professional);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="w-full h-full rounded-lg"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  background-color: #3B82F6;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
                "></div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="text-center">
                <strong>La tua posizione</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Professional markers */}
        {validProfessionals.map((professional) => (
          <Marker
            key={professional.id}
            position={[professional.latitude, professional.longitude]}
            icon={createCustomIcon(professional.category.name)}
            eventHandlers={{
              click: () => handleMarkerClick(professional),
            }}
          >
            <Popup maxWidth={300} className="professional-popup">
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {professional.category.icon} {professional.category.name}
                  </Badge>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <span className="text-xs font-medium">{professional.rating}</span>
                    <span className="text-xs text-gray-500 ml-1">({professional.reviewCount})</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-sm mb-1">{professional.businessName}</h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {professional.description}
                </p>
                
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{professional.address}, {professional.city}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {professional.phoneMobile && (
                    <div className="flex items-center text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      <span>{professional.phoneMobile}</span>
                    </div>
                  )}
                  {professional.website && (
                    <div className="flex items-center text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      <span className="truncate">Sito web</span>
                    </div>
                  )}
                </div>
                
                <Button size="sm" className="w-full text-xs h-7">
                  Visualizza Profilo
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapBounds professionals={validProfessionals} />
      </MapContainer>
    </div>
  );
}