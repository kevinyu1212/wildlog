import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
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

function LocationMarker({ onLocationSelect, position }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { boards } = useBoards();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '포유류',
    content: '',
    mission_id: '',
    lat: null,
    lng: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`);
      const data = await response.json();
      
      if (data.user_id !== user?.id) {
        alert('수정 권한이 없습니다.');
        navigate(-1);
        return;
      }

      setFormData({
        title: data.title,
        category: data.category,
        content: data.content,
        mission_id: data.mission_id || '',
        lat: data.lat,
        lng: data.lng
      });
      if (data.images) {
        const imgs = JSON.parse(data.images);
        setExistingImages(imgs);
        setPreviews(imgs.map(img => `http://localhost:5000/uploads/${img}`));
      }
    } catch (err) {
      console.error(err);
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
    setExistingImages([]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    if (newPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData({ ...formData, lat, lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('content', formData.content);
    data.append('mission_id', formData.mission_id);
    if (formData.lat) data.append('lat', formData.lat);
    if (formData.lng) data.append('lng', formData.lng);
    
    if (images.length > 0) {
      images.forEach(img => data.append('images', img));
    } else {
      data.append('existing_images', JSON.stringify(existingImages));
    }

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'PUT',
        body: data,
      });
      if (response.ok) {
        alert('수정되었습니다!');
        navigate(`/post/${id}`);
      }
    } catch (err) {
      console.error(err);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-7 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full"></span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">탐사 기록 수정</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium ml-5">관찰 기록을 업데이트하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 bg-slate-900/50 border border-slate-800/60 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">생물 이름</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm" 
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

          {/* Map */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">위치 수정 (지도 클릭)</label>
            <div className="h-56 md:h-64 w-full rounded-xl md:rounded-2xl overflow-hidden border border-slate-800/60 bg-slate-950 relative" style={{ zIndex: 0 }}>
              <MapContainer 
                center={formData.lat ? [formData.lat, formData.lng] : [36.5, 127.5]} 
                zoom={formData.lat ? 13 : 7} 
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker 
                  onLocationSelect={handleLocationSelect} 
                  position={formData.lat ? [formData.lat, formData.lng] : null} 
                />
              </MapContainer>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
              <span>사진 관리 ({previews.length}/5)</span>
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
                </div>
              ))}
              
              {previews.length < 5 && (
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

          {/* Content */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">탐사 내용</label>
            <textarea 
              rows="6" 
              required
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800/60 p-5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none text-sm leading-relaxed"
            ></textarea>
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
                  수정 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  수정 완료하기
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
    </div>
  );
}