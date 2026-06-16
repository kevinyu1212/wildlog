import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import useBoards from '../../hooks/useBoards';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { boards } = useBoards();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
        notificationCount={5} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isLoggedIn={isLoggedIn}
        boards={boards}
      />

      <main className="p-8 max-w-6xl mx-auto">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-4">자연을 기록하는 공간, WildLog</h1>
          <p className="text-slate-400">당신의 소중한 생물 관찰 기록을 공유하세요.</p>
        </div>
      </main>
    </div>
  );
}