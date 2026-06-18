import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SettingsLayout from '../../../components/layout/SettingsLayout';

export default function ProfileImage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(
    user?.profile_image ? `http://localhost:5000/uploads/${user.profile_image}` : null
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('2MB 이하의 이미지만 업로드 가능합니다.');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_image', selectedFile);
      formData.append('username', user.username);

      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        updateUser(data.user);
        alert('프로필 이미지가 변경되었습니다.');
        navigate('/mypage');
      }
    } catch (err) {
      console.error(err);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="space-y-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/mypage')} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full"></span>
          <h2 className="text-2xl font-bold text-white">프로필 사진 변경</h2>
        </div>
        <p className="text-slate-500 text-sm font-medium ml-8">JPG, PNG / Max 2MB</p>

      <div className="flex flex-col items-center space-y-8 py-8">
        <div 
          className="w-48 h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border-4 border-emerald-500/20 flex items-center justify-center overflow-hidden shadow-2xl cursor-pointer hover:border-emerald-500/40 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-20 h-20 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
        </div>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleFileSelect} 
          className="hidden" 
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-all text-slate-300 border border-slate-700/50"
        >
          이미지 선택
        </button>

        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/mypage')}
            className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-all text-slate-400 border border-slate-700/50"
          >
            취소
          </button>
          <button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 px-8 py-3 rounded-xl text-sm font-bold transition-all text-white shadow-lg shadow-emerald-900/30"
          >
            {isUploading ? '업로드 중...' : '변경하기'}
          </button>
        </div>
      </div>
    </div>
    </SettingsLayout>
  );
}