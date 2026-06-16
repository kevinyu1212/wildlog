import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`);
      const data = await response.json();
      
      // 작성자 확인
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
    setExistingImages([]); // 새 이미지가 들어오면 기존 이미지는 초기화 (전체 교체 방식)
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white mb-2">탐사 기록 수정</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">생물 이름</label>
              <input 
                type="text" 
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
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">위치 수정 (지도 클릭)</label>
            <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative" style={{ zIndex: 0 }}>
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

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
              <span>사진 관리 ({previews.length}/5)</span>
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
               
               {previews.length < 5 && (
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
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 p-6 rounded-[2rem] outline-none focus:border-emerald-500 transition-all resize-none text-sm leading-relaxed"
            ></textarea>
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
              수정 완료하기
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
