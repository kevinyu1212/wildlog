import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';

export default function Observer() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [observers, setObservers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  useEffect(() => {
    fetchObservers();
  }, []);

  const fetchObservers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/observers');
      const data = await response.json();
      setObservers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredObservers = observers.filter(obs => 
    obs.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-1.5 h-7 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full"></span>
              <h1 className="text-2xl md:text-4xl font-bold text-white">최정예 관찰자</h1>
            </div>
            <p className="text-slate-500 font-medium ml-5">활동 점수 및 데이터 누적 기여도가 높은 명단입니다.</p>
          </div>
          
          {/* Search */}
          <div className="w-full md:w-96 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              placeholder="닉네임으로 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800/60 p-3.5 pl-11 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm placeholder:text-slate-600"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-900/80 border border-slate-800/60 rounded-[2.5rem] h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* TOP 3 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
              {filteredObservers.slice(0, 3).map((obs, idx) => {
                const rankColors = [
                  { bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-900', label: '🏆 Top Explorer' },
                  { bg: 'from-slate-300 to-slate-500', text: 'text-slate-700', label: '🥈 Silver Scout' },
                  { bg: 'from-orange-400 to-orange-600', text: 'text-orange-900', label: '🥉 Bronze Tracker' },
                ];
                return (
                  <div key={obs.id} className="relative group">
                    {/* Rank Badge */}
                    <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl z-10 bg-gradient-to-br ${rankColors[idx].bg} ${rankColors[idx].text}`}>
                      {idx + 1}
                    </div>
                    <div 
                      className="bg-slate-900/80 border border-slate-800/60 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center text-center group-hover:border-emerald-500/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/profile/${obs.username}`)}
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full mb-5 border-4 border-slate-800 group-hover:border-emerald-500/20 transition-all overflow-hidden flex items-center justify-center">
                        {obs.profile_image ? (
                          <img src={`http://localhost:5000/uploads/${obs.profile_image}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mb-1">{obs.username}</h3>
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-6 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {obs.records >= 30 ? 'Elite Observer' : 'Active Observer'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-800/60 pt-5">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">기록</p>
                          <p className="font-bold text-lg">{obs.records}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">종수</p>
                          <p className="font-bold text-lg">{obs.species}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Ranking Table */}
            <section className="bg-slate-900/80 border border-slate-800/60 rounded-2xl md:rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/30 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                      <th className="px-6 md:px-8 py-4">순위</th>
                      <th className="px-6 md:px-8 py-4">관찰자</th>
                      <th className="px-6 md:px-8 py-4 text-center hidden sm:table-cell">기록수</th>
                      <th className="px-6 md:px-8 py-4 text-center hidden sm:table-cell">종수</th>
                      <th className="px-6 md:px-8 py-4 text-right">점수</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredObservers.map((obs, idx) => (
                      <tr 
                        key={obs.id} 
                        className="border-t border-slate-800/40 hover:bg-slate-800/20 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/profile/${obs.username}`)}
                      >
                        <td className="px-6 md:px-8 py-5 font-bold text-slate-500 group-hover:text-emerald-400">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                              idx < 3 ? `bg-gradient-to-br ${['from-yellow-400/20', 'from-slate-300/20', 'from-orange-400/20'][idx]} text-yellow-400` : 'text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center border border-slate-700">
                              {obs.profile_image ? (
                                <img src={`http://localhost:5000/uploads/${obs.profile_image}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                              )}
                            </div>
                            <span className="font-bold text-slate-200">{obs.username}</span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-5 text-center font-bold hidden sm:table-cell">{obs.records}</td>
                        <td className="px-6 md:px-8 py-5 text-center font-bold hidden sm:table-cell">{obs.species}</td>
                        <td className="px-6 md:px-8 py-5 text-right font-bold text-emerald-400">{(obs.records * 100).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
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