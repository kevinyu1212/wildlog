import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

export default function Observer() {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">최정예 관찰자</h1>
            <p className="text-slate-500 font-medium">활동 점수 및 데이터 누적 기여도가 높은 명단입니다.</p>
          </div>
          
          <div className="w-full md:w-96 relative">
            <input 
              type="text" 
              placeholder="닉네임으로 검색" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">🔍</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* TOP 3 랭킹 */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {filteredObservers.slice(0, 3).map((obs, idx) => (
                <div key={obs.id} className="relative group">
                   <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl z-10 ${
                     idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                     idx === 1 ? 'bg-slate-300 text-slate-700' : 'bg-orange-400 text-orange-900'
                   }`}>
                     {idx + 1}
                   </div>
                   <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center text-center group-hover:border-emerald-500/30 transition-all">
                      <div className="w-24 h-24 bg-slate-800 rounded-full mb-6 border-4 border-slate-800 group-hover:border-emerald-500/20 transition-all overflow-hidden">
                        {obs.profile_image ? (
                          <img src={`http://localhost:5000/uploads/${obs.profile_image}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                        )}
                      </div>
                      <h3 className="text-xl font-black mb-1">{obs.username}</h3>
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-6">{obs.records >= 30 ? 'Elite Observer' : 'Active Observer'}</p>
                      
                      <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-800 pt-6">
                        <div>
                          <p className="text-[10px] text-slate-500 font-black mb-1">기록</p>
                          <p className="font-bold">{obs.records}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 font-black mb-1">종수</p>
                          <p className="font-bold">{obs.species}</p>
                        </div>
                      </div>
                   </div>
                </div>
              ))}
            </section>

            {/* 랭킹 리스트 */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                   <tr>
                     <th className="px-8 py-4">순위</th>
                     <th className="px-8 py-4">관찰자</th>
                     <th className="px-8 py-4 text-center">기록수</th>
                     <th className="px-8 py-4 text-center">종수</th>
                     <th className="px-8 py-4 text-right">점수</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   {filteredObservers.map((obs, idx) => (
                     <tr key={obs.id} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors cursor-pointer group">
                       <td className="px-8 py-6 font-black text-slate-500 group-hover:text-emerald-400">{idx + 1}</td>
                       <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center text-xs">
                             {obs.profile_image ? (
                               <img src={`http://localhost:5000/uploads/${obs.profile_image}`} alt="" className="w-full h-full object-cover" />
                             ) : '👤'}
                           </div>
                           <span className="font-bold">{obs.username}</span>
                         </div>
                       </td>
                       <td className="px-8 py-6 text-center font-bold">{obs.records}</td>
                       <td className="px-8 py-6 text-center font-bold">{obs.species}</td>
                       <td className="px-8 py-6 text-right font-black text-emerald-400">{(obs.records * 100).toLocaleString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </section>
          </>
        )}
      </main>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        boards={boards}
      />
    </div>
  );
}
