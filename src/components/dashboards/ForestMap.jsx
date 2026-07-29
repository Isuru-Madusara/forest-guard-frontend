import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon paths in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Default center to Sri Lanka
const defaultCenter = [7.8731, 80.7718];
const defaultZoom = 7;

const MapClickComponent = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const ForestMap = ({ markers = [], polygons = [], onMapClick = null, height = '400px' }) => {
  return (
    <div className="forest-map-container" style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ccc' }}>
      <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onMapClick && <MapClickComponent onMapClick={onMapClick} />}

        {/* Render Markers */}
        {markers
          .filter(
            (marker) =>
              Array.isArray(marker.position) &&
              marker.position.length === 2 &&
              marker.position[0] != null &&
              marker.position[1] != null
          )
          .map((marker, idx) => (
            <Marker key={idx} position={marker.position}>
              <Popup>
                <strong>{marker.title}</strong><br/>
                {marker.description}
              </Popup>
            </Marker>
          ))}

        {/* Render Polygons */}
        {polygons
          .filter(
            (polygon) =>
              Array.isArray(polygon.positions) &&
              polygon.positions.length >= 3 &&
              polygon.positions.every(
                (p) => Array.isArray(p) && p[0] != null && p[1] != null
              )
          )
          .map((polygon, idx) => (
            <Polygon
              key={idx}
              positions={polygon.positions}
              pathOptions={{ color: polygon.color || 'green', fillColor: polygon.fillColor || 'green' }}
            >
              <Popup>
                <strong>{polygon.title}</strong><br/>
                {polygon.description}
              </Popup>
            </Polygon>
          ))}
      </MapContainer>
    </div>
  );
};

export default ForestMap;