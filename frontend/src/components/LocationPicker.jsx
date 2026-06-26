import { useState } from 'react';
import { MapPin, LocateFixed } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const ClickableMarker = ({ position, onMove }) => {
  useMapEvents({
    click(e) { onMove([e.latlng.lat, e.latlng.lng]); },
  });
  return position ? <Marker position={position} icon={DefaultIcon} /> : null;
};

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    return data.display_name || '';
  } catch { return ''; }
};

const LocationPicker = ({ address, onAddressChange, coords, onCoordsChange }) => {
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(!!coords);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const point = [pos.coords.latitude, pos.coords.longitude];
        onCoordsChange(point);
        const addr = await reverseGeocode(point[0], point[1]);
        if (addr) onAddressChange(addr);
        setShowMap(true);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delivery Address</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-3 text-slate-500" size={16} />
        <textarea rows={2} value={address} onChange={(e) => onAddressChange(e.target.value)}
          placeholder="House/flat no, street, landmark, city, PIN code"
          className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-cyan-500 outline-none text-xs text-white resize-none placeholder:text-slate-600"
        />
      </div>
      <button type="button" onClick={handleUseCurrentLocation} disabled={locating}
        className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50">
        <LocateFixed size={14} /> {locating ? 'Locating...' : 'Use My Current Location'}
      </button>
      {showMap && coords && (
        <div className="rounded-xl overflow-hidden border border-slate-800">
          <MapContainer center={coords} zoom={16} style={{ height: '200px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            <ClickableMarker position={coords} onMove={onCoordsChange} />
          </MapContainer>
          <p className="text-[10px] text-slate-500 px-3 py-1.5 bg-slate-950/60">Tap the map to fine-tune the drop-off pin.</p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
