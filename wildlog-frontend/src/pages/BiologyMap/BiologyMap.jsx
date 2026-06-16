import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import useBoards from '../../hooks/useBoards';

// Leaflet 기본 아이콘 수정 (Vite 환경에서 아이콘이 깨지는 문제 해결)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// 지도가 처음 로드될 때 크기를 올바르게 계산하도록 강제하는 컴포넌트
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
      const query = selectedCategory !== '전체' ? `?category=${selectedCategory}` : '';
      const response = await fetch(`http://localhost:5000/api/posts${query}`);
      const data = await response.json();
      setMarkers(data.filter(p => p.lat && p.lng));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, [selectedCategory]);

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <div className="flex-1 relative w-full h-full">
        <MapContainer 
          center={[36.5, 127.5]} 
          zoom={7} 
          style={{ width: '100%', height: '100%' }}
        >
          <ResizeMap />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker) => (
            <Marker key={marker.id} position={[marker.lat, marker.lng]}>
              <Popup>
                <div 
                  onClick={() => navigate(`/post/${marker.id}`)}
                  className="p-1 cursor-pointer max-w-[180px] text-slate-900"
                >
                  {marker.images && (
                    <img 
                      src={`http://localhost:5000/uploads/${JSON.parse(marker.images)[0]}`} 
                      alt="" 
                      className="w-full h-24 object-cover rounded-md mb-2" 
                    />
                  )}
                  <h4 className="font-bold text-sm mb-1">{marker.title}</h4>
                  <p className="text-[10px] text-slate-500">관찰자: {marker.author}</p>
                  <div className="mt-2 text-[10px] text-emerald-600 font-bold">자세히 보기 →</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 지도 컨트롤 UI */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 z-[1000]">
           <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-2xl">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 px-2">맵 레이어 필터</h3>
              <div className="grid grid-cols-2 gap-2">
                 {categories.map(cat => (
                   <button 
                     key={cat.name}
                     onClick={() => setSelectedCategory(cat.name)}
                     className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                       selectedCategory === cat.name ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                     }`}
                   >
                     <span>{cat.icon}</span>
                     {cat.name}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-full border border-slate-800 shadow-2xl z-[1000]">
           <div className="flex items-center gap-2 pr-4 border-r border-slate-800">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold">GPS ACTIVE</span>
           </div>
           <p className="text-xs text-slate-400 font-medium">실시간 탐사 데이터 동기화 중</p>
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
