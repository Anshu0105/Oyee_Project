import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { X, Users, MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// User should provide this in .env
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1Ijoic29tZS1tb2NrLXRva2VuIiwiYSI6ImNsMTIzNDU2Nzg5MGhpejRsdWx5enZ4In0.abc123def456';

const NearbyMap = ({ token, onClose, onJoinRoom }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(85.8245); // Default to Bhubaneswar (CGU Location)
  const [lat, setLat] = useState(20.2961);
  const [zoom, setZoom] = useState(13);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
    } else {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLng(pos.coords.longitude);
        setLat(pos.coords.latitude);
      });
    }
  }, []);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // OYEEE Dark aesthetic
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('load', () => {
      // Add pulsing dot for user location
      addUserLocationSource();
      fetchNearbyRooms();
    });

    return () => map.current.remove();
  }, []);

  const addUserLocationSource = () => {
    map.current.addSource('user-location', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] }
        }]
      }
    });

    map.current.addLayer({
      id: 'user-location-pulse',
      type: 'circle',
      source: 'user-location',
      paint: {
        'circle-radius': 10,
        'circle-color': '#2196f3',
        'circle-opacity': 0.4
      }
    });
  };

  const fetchNearbyRooms = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/nearby`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lat, lng, radiusKm: 10 })
      });
      const data = await res.json();
      if (res.ok) {
        setRooms(data.rooms);
        addHeatmapLayer(data.heatmapData);
        addRoomMarkers(data.rooms);
      }
    } catch (err) {
      console.error("Failed to fetch nearby rooms:", err);
    }
  };

  const addHeatmapLayer = (heatmapData) => {
    if (map.current.getSource('rooms-heatmap')) {
       map.current.getSource('rooms-heatmap').setData({
         type: 'FeatureCollection',
         features: heatmapData.map(d => ({
           type: 'Feature',
           properties: { weight: d.weight },
           geometry: { type: 'Point', coordinates: [d.lng, d.lat] }
         }))
       });
       return;
    }

    map.current.addSource('rooms-heatmap', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: heatmapData.map(d => ({
          type: 'Feature',
          properties: { weight: d.weight },
          geometry: { type: 'Point', coordinates: [d.lng, d.lat] }
        }))
      }
    });

    map.current.addLayer({
      id: 'rooms-heat',
      type: 'heatmap',
      source: 'rooms-heatmap',
      maxzoom: 15,
      paint: {
        'heatmap-weight': ['get', 'weight'],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(233, 30, 99, 0)',
          0.2, 'rgba(233, 30, 99, 0.2)',
          0.4, 'rgba(233, 30, 99, 0.4)',
          0.6, 'rgba(233, 30, 99, 0.6)',
          0.8, 'rgba(233, 30, 99, 0.8)',
          1, '#e91e63'
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 20],
        'heatmap-opacity': 0.6
      }
    });
  };

  const addRoomMarkers = (roomsData) => {
    roomsData.forEach(room => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#e91e63';
      el.style.border = '2px solid #fff';
      el.style.boxShadow = '0 0 10px #e91e63';
      el.style.cursor = 'pointer';

      el.addEventListener('click', () => {
        setSelectedRoom(room);
      });

      new mapboxgl.Marker(el)
        .setLngLat(room.location.coordinates)
        .addTo(map.current);
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#000' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* UI Overlays */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', letterSpacing: '2px', color: '#fff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>NEARBY VOIDS</h2>
        </div>
        <button 
          onClick={onClose}
          style={{ 
            pointerEvents: 'auto',
            background: 'rgba(0,0,0,0.5)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>
      </div>

      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '400px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedRoom.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.5 }}>{selectedRoom.description}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                <Users size={16} />
                {selectedRoom.userCount}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', opacity: 0.6 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {selectedRoom.distance?.toFixed(1) || '0.5'} km away</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Navigation size={12} /> Created by {selectedRoom.creator?.auraName || 'Anonymous'}</span>
            </div>

            <button
              onClick={() => onJoinRoom(selectedRoom._id)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontFamily: 'var(--font-bebas)',
                fontSize: '1.2rem',
                letterSpacing: '2px',
                cursor: 'pointer'
              }}
            >
              JOIN ROOM
            </button>
            <button 
              onClick={() => setSelectedRoom(null)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              DISMISS
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left { display: none !important; }
        .marker { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NearbyMap;
