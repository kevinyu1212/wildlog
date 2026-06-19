import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import useBoards from '../../hooks/useBoards';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [position, map]);
  return null;
}

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
  const [searchParams] = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const { boards, loading: boardsLoading } = useBoards();
  const requestedMissionId = searchParams.get('mission_id') || '';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [missions, setMissions] = useState([]);
  const [missionLinked, setMissionLinked] = useState(Boolean(requestedMissionId));
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: searchParams.get('category') || '',
    content: '',
    mission_id: requestedMissionId,
    lat: null,
    lng: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/write' }, replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetch('http://localhost:5000/api/missions')
      .then(res => res.json())
      .then(data => setMissions(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (boards.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: boards[0] }));
    }
    handleGetCurrentLocation();
  }, [boards]);

  const getMissionTags = (mission) => (
    String(mission.tags || '')
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean)
  );

  const getMissionMatchScore = (mission) => {
    const categoryMatch = mission.category && mission.category === formData.category ? 4 : 0;
    const haystack = `${formData.title} ${formData.content}`.toLowerCase();
    const missionTitle = String(mission.title || '').toLowerCase();
    const titleMatch = missionTitle && haystack.includes(missionTitle) ? 3 : 0;
    const tagMatchCount = getMissionTags(mission).filter(tag => haystack.includes(tag)).length;
    return categoryMatch + titleMatch + tagMatchCount;
  };

  // 자동 미션 연동 로직
  useEffect(() => {
    if (missions.length === 0) return;

    if (requestedMissionId) {
      const requestedMission = missions.find(m => String(m.id) === requestedMissionId);
      if (requestedMission) {
        setMissionLinked(true);
        setFormData(prev => {
          const nextCategory = requestedMission.category || prev.category;
          if (prev.mission_id === requestedMissionId && prev.category === nextCategory) return prev;
          return {
            ...prev,
            mission_id: requestedMissionId,
            category: nextCategory
          };
        });
      }
      return;
    }

    const matchedMission = missions
      .map(mission => ({ mission, score: getMissionMatchScore(mission) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)[0]?.mission;

    if (matchedMission && String(matchedMission.id) !== String(formData.mission_id)) {
      setMissionLinked(true);
      setFormData(prev => ({ ...prev, mission_id: matchedMission.id.toString() }));
    }
  }, [formData.category, formData.title, formData.content, formData.mission_id, missions, requestedMissionId]);

  const selectedMission = missions.find(m => String(m.id) === String(formData.mission_id));

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

  const addImageFiles = (files) => {
    const fileList = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileList.length + images.length > 5) {
      alert('최대 5장까지 업로드 가능합니다.');
      return;
    }
    setImages(prev => [...prev, ...fileList]);
    setPreviews(prev => [...prev, ...fileList.map(file => URL.createObjectURL(file))]);
  };

  const handleImageChange = (e) => {
    addImageFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addImageFiles(e.dataTransfer.files);
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

    setIsSubmitting(true);
    const data = new FormData();
    data.append('user_id', user.id);
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('content', formData.content);
    data.append('mission_id', missionLinked ? formData.mission_id : '');
    if (formData.lat) data.append('lat', formData.lat);
    if (formData.lng) data.append('lng', formData.lng);
    images.forEach(img => data.append('images', img));

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        body: data,
      });
      if (response.ok) {
        alert('🎉 탐사 기록이 등록되었습니다!');
        navigate(`/board/${formData.category}`);
      }
    } catch (err) {
      console.error(err);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="mb-10 text-center md:text-left">
          <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
            <span className="w-1.5 h-7 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full"></span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">새 탐사 기록 작성</h1>
          </div>
          <p className="text-slate-500 ml-5">당신이 발견한 소중한 생태 데이터를 공유해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 bg-slate-900/50 border border-slate-800/60 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">생물 이름</label>
              <input 
                type="text" 
                placeholder="예: 반달가슴곰" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm placeholder:text-slate-700" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">분류군 선택</label>
              <div className="relative">
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none text-sm text-slate-200"
                >
                  {boards.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">발견 위치</label>
              <button 
                type="button"
                onClick={handleGetCurrentLocation}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 transition-all"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                현재 위치
              </button>
            </div>
            <div className="h-56 md:h-64 w-full rounded-xl md:rounded-2xl overflow-hidden border border-slate-800/60 bg-slate-950 relative" style={{ zIndex: 0 }}>
              <MapContainer center={[36.5, 127.5]} zoom={7} style={{ width: '100%', height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RecenterMap position={formData.lat ? [formData.lat, formData.lng] : null} />
                <LocationMarker 
                  onLocationSelect={handleLocationSelect} 
                  position={formData.lat ? [formData.lat, formData.lng] : null} 
                />
              </MapContainer>
            </div>
            <p className="text-[10px] text-slate-600 px-1 font-medium">
              {formData.lat 
                ? `📍 선택된 좌표: ${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}` 
                : '💡 지도를 클릭하여 관찰 위치를 지정해 주세요.'}
            </p>
          </div>

          {/* Images */}
          <div
            className={`space-y-2 ${isDragging ? 'ring-2 ring-emerald-500/50 rounded-2xl' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
              <span>사진 첨부 ({images.length}/5)</span>
              <span className="text-[10px] text-slate-600 font-normal normal-case">드래그 앤 드롭 또는 클릭 · 첫 번째 사진이 대표</span>
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {previews.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700/60 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/80 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 bg-emerald-500/80 text-[8px] font-bold px-1.5 py-0.5 rounded">대표</span>
                  )}
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800/60 rounded-xl flex flex-col items-center justify-center text-slate-700 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all cursor-pointer group">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-[10px] text-slate-700 mt-1">Add Photo</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">탐사 내용</label>
            <textarea 
              rows="6" 
              required
              placeholder="발견 당시의 상황, 주변 환경 등을 자세히 적어주세요." 
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800/60 p-5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none text-sm leading-relaxed placeholder:text-slate-700"
            ></textarea>
          </div>

          {/* Mission Link */}
          <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="mission-link"
                checked={missionLinked}
                onChange={(e) => {
                  setMissionLinked(e.target.checked);
                  if (!e.target.checked) setFormData(prev => ({ ...prev, mission_id: '' }));
                }}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <label htmlFor="mission-link" className="font-bold text-sm text-slate-300">현재 진행 중인 미션과 연동하기</label>
            </div>
            {missionLinked && (
              <div className="space-y-3">
                <select
                  value={formData.mission_id}
                  onChange={(e) => setFormData({ ...formData, mission_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800/60 p-3 rounded-xl outline-none text-xs text-slate-400"
                  required={missionLinked}
                >
                  <option value="">참여할 미션을 선택하세요</option>
                  {missions.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
                {selectedMission && (
                  <div className="rounded-xl border border-emerald-500/10 bg-slate-950/70 p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-xs font-bold text-emerald-300 truncate">{selectedMission.title}</p>
                      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                        {selectedMission.current_count}/{selectedMission.target_count}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {getMissionTags(selectedMission).slice(0, 5).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-300 border border-emerald-500/20">
                          #{tag}
                        </span>
                      ))}
                      {getMissionTags(selectedMission).length === 0 && (
                        <span className="text-[10px] text-slate-600">분류군 또는 미션명 기준으로 자동 연결되었습니다.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="w-full md:flex-1 bg-slate-800 hover:bg-slate-700 py-3.5 rounded-xl font-bold text-slate-400 transition-all text-sm border border-slate-700/50"
            >
              취소
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:flex-[2] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all text-sm text-white flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  등록 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  탐사 기록 등록하기
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        boards={boards}
      />
      <Footer />
    </div>
  );
}
