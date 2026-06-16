import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import useBoards from '../../hooks/useBoards';

// Leaflet 기본 아이콘 수정
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// 지도를 특정 좌표로 이동시키는 컴포넌트
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [position, map]);
  return null;
}

// 클릭한 위치에 마커를 찍는 컴포넌트
function LocationMarker({ onLocationSelect, position }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function PostWrite() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { boards, loading: boardsLoading } = useBoards();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    mission_id: '',
    lat: null,
    lng: null
  });

  // 게시판 목록 로드 시 기본값 설정 및 현재 위치 자동 감지
  useEffect(() => {
    if (boards.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: boards[0] }));
    }
    handleGetCurrentLocation();
  }, [boards]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('최대 5장까지 업로드 가능합니다.');
      return;
    }
    setImages([...images, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData({ ...formData, lat, lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const data = new FormData();
    data.append('user_id', user.id);
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('content', formData.content);
    data.append('mission_id', formData.mission_id);
    if (formData.lat) data.append('lat', formData.lat);
    if (formData.lng) data.append('lng', formData.lng);
    images.forEach(img => data.append('images', img));

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        body: data,
      });
      if (response.ok) {
        alert('탐사 기록이 등록되었습니다!');
        navigate(`/board/${formData.category}`);
      }
    } catch (err) {
      console.error(err);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-white mb-2">새 탐사 기록 작성</h1>
          <p className="text-slate-500">당신이 발견한 소중한 생태 데이터를 공유해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/50 border border-slate-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">생물 이름</label>
              <input 
                type="text" 
                placeholder="예: 반달가슴곰" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">분류군 선택</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-emerald-500 transition-all appearance-none text-sm"
              >
                 {boards.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end mb-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">발견 위치 (지도 클릭 또는 현재 위치)</label>
              <button 
                type="button"
                onClick={handleGetCurrentLocation}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 transition-all"
              >
                🎯 내 현재 위치로 설정
              </button>
            </div>
            <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative" style={{ zIndex: 0 }}>
               <MapContainer center={[36.5, 127.5]} zoom={7} style={{ width: '100%', height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <RecenterMap position={formData.lat ? [formData.lat, formData.lng] : null} />
                  <LocationMarker 
                    onLocationSelect={handleLocationSelect} 
                    position={formData.lat ? [formData.lat, formData.lng] : null} 
                  />
               </MapContainer>
            </div>
            <p className="text-[10px] text-slate-500 px-2">
              {formData.lat ? `선택된 좌표: ${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}` : '지도를 클릭하여 관찰 위치를 지정해 주세요.'}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
              <span>사진 첨부 ({images.length}/5)</span>
              <span className="text-[10px] text-slate-600">첫 번째 사진이 대표 이미지로 지정됩니다.</span>
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
               {previews.map((src, idx) => (
                 <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                 </div>
               ))}
               
               {images.length < 5 && (
                 <label className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-700 hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">+</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                 </label>
               )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">탐사 내용</label>
            <textarea 
              rows="6" 
              required
              placeholder="발견 당시의 상황, 주변 환경 등을 자세히 적어주세요." 
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 p-6 rounded-[2rem] outline-none focus:border-emerald-500 transition-all resize-none text-sm leading-relaxed"
            ></textarea>
          </div>

          <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
             <div className="flex items-center gap-3 mb-4">
                <input type="checkbox" id="mission-link" className="w-5 h-5 accent-emerald-500" />
                <label htmlFor="mission-link" className="font-bold text-sm text-slate-300">현재 진행 중인 미션과 연동하기</label>
             </div>
             <select 
               value={formData.mission_id}
               onChange={(e) => setFormData({...formData, mission_id: e.target.value})}
               className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none text-xs text-slate-500"
             >
                <option value="">참여할 미션을 선택하세요 (선택 사항)</option>
                <option value="1">지리산 반달가슴곰 흔적 찾기</option>
                <option value="2">장수하늘소 분포 조사</option>
             </select>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="w-full md:flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black text-slate-400 transition-all text-sm"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="w-full md:flex-[2] bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black shadow-lg shadow-emerald-900/20 transition-all text-sm"
            >
              탐사 기록 등록하기
            </button>
          </div>
        </form>
      </main>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        boards={boards}
      />
    </div>
  );
}
