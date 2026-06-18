import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import useBoards from '../../hooks/useBoards';

// Fix default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Category icons for map markers
const categoryColors = {
  '포유류': { icon: '🦁', color: '#f59e0b' },
  '파충류': { icon: '🦎', color: '#10b981' },
  '양서류': { icon: '🐸', color: '#3b82f6' },
  '절지류': { icon: '🕷️', color: '#8b5cf6' },
  '곤충': { icon: '🐞', color: '#ef4444' },
  '어류': { icon: '🐟', color: '#06b6d4' },
  '식물': { icon: '🌿', color: '#22c55e' },
  '균류': { icon: '🍄', color: '#ea580c' },
  '기타': { icon: '🔬', color: '#6b7280' },
};

function createCategoryIcon(category) {
  const cat = categoryColors[category] || categoryColors['기타'];
  const svg = `<div style="
    width: 36px; height: 36px;
    background: ${cat.color}22;
    border: 2px solid ${cat.color};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 2px 8px ${cat.color}44;
  ">${cat.icon}</div>`;
  return L.divIcon({ html: svg, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
}

// Component to handle marker clustering
function MarkerClusterGroup({ markers, onMarkerClick }) {
  const map = useMap();
  const mgrRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Import markercluster library dynamically
    const mcg = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            width: ${count < 10 ? '40px' : '48px'}; 
            height: ${count < 10 ? '40px' : '48px'};
            background: linear-gradient(135deg, #059669, #10b981);
            border: 3px solid rgba(16,185,129,0.4);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${count < 10 ? '13px' : '11px'};
            font-weight: 900;
            color: white;
            box-shadow: 0 4px 15px rgba(16,185,129,0.4);
          ">${count}</div>`,
          className: '',
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });
      },
    });

    markers.forEach((m) => {
      const customIcon = createCategoryIcon(m.category);
      const marker = L.marker([m.lat, m.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="
          font-family: system-ui, -apple-system, sans-serif;
          min-width: 160px;
          max-width: 220px;
          cursor: pointer;
          padding: 4px;
        ">
          ${m.images ? `<img 
            src="http://localhost:5000/uploads/${JSON.parse(m.images)[0]}" 
            style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;"
          />` : ''}
          <h4 style="
            margin: 0 0 4px 0;
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
          ">${m.title}</h4>
          <p style="
            margin: 0;
            font-size: 11px;
            color: #64748b;
          ">👤 ${m.author || '탐사대원'} · ${m.category}</p>
          <div style="
            margin-top: 8px;
            font-size: 10px;
            color: #059669;
            font-weight: 700;
          ">자세히 보기 →</div>
        </div>
      `);
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(m.id);
        else window.location.href = `/post/${m.id}`;
      });
      mcg.addLayer(marker);
    });

    map.addLayer(mcg);
    mgrRef.current = mcg;

    return () => {
      if (mgrRef.current) {
        map.removeLayer(mgrRef.current);
      }
    };
  }, [map, markers]);

  return null;
}

function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
}

export default function BiologyMap() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [markers, setMarkers] = useState([]);
  const { boards } = useBoards();

  const categories = [
    { name: '전체', icon: '🌐' },
    { name: '포유류', icon: '🦁' },
    { name: '파충류', icon: '🦎' },
    { name: '양서류', icon: '🐸' },
    { name: '절지류', icon: '🕷️' },
    { name: '곤충', icon: '🐞' },
    { name: '어류', icon: '🐟' },
    { name: '식물', icon: '🌿' },
    { name: '균류', icon: '🍄' },
    { name: '기타', icon: '❓' },
  ];

  const fetchMarkers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/map/posts');
      const data = await response.json();
      setMarkers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, []);

  const filteredMarkers = selectedCategory === '전체'
    ? markers
    : markers.filter(m => m.category === selectedCategory);

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <div className="flex-1 relative w-full h-full">
        <MapContainer 
          center={[36.5, 127.5]} 
          zoom={7} 
          style={{ width: '100%', height: '100%' }}
          className="z-0"
        >
          <ResizeMap />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup 
            markers={filteredMarkers} 
            onMarkerClick={(id) => navigate(`/post/${id}`)}
          />
        </MapContainer>

        {/* Map Filter UI - Floating on left */}
        <div className="absolute top-4 md:top-6 left-2 md:left-6 flex flex-col gap-2 z-[1000]">
          <div className="bg-slate-900/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-800/80 shadow-2xl">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              필터
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map(cat => (
                <button 
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat.name 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/50'
                  }`}
                >
                  <span className="text-xs">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Bottom Status Bar */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4 bg-slate-900/90 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 rounded-full border border-slate-800/80 shadow-2xl z-[1000]">
          <div className="flex items-center gap-2 pr-3 md:pr-4 border-r border-slate-800/60">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] md:text-xs font-bold text-emerald-400">GPS</span>
          </div>
          <p className="text-[10px] md:text-xs text-slate-400 font-medium">
            <span className="text-slate-500 font-bold">{filteredMarkers.length}</span>개의 탐사 데이터
            {filteredMarkers.length < markers.length && (
              <span className="text-slate-600"> (전체 {markers.length})</span>
            )}
          </p>
          <div className="flex items-center gap-2 pl-3 md:pl-4 border-l border-slate-800/60">
            <span className="text-[10px] md:text-xs text-slate-500">{selectedCategory}</span>
          </div>
        </div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        boards={boards}
      />
    </div>
  );
}