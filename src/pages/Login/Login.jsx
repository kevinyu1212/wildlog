import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Compass, User, Calendar, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Login() {
   const [viewState, setViewState] = useState('login');
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   // --- 회원가입 폼 데이터 상태 (State) ---
   const [formData, setFormData] = useState({
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      birthDate: '',
      securityQuestion: '',
      securityAnswer: ''
   });

   // --- 실시간 유효성 검사 에러/성공 상태 ---
   const [errors, setErrors] = useState({});
   const [isEmailChecked, setIsEmailChecked] = useState(false); // 이메일 중복확인 여부
   const [isNicknameChecked, setIsNicknameChecked] = useState(false); // 닉네임 중복확인 여부
   const [isFormValid, setIsFormValid] = useState(false); // 전체 폼 통과 여부

   const securityQuestions = [
      "초등학교때 별명은?",
      "첫 번째 반려동물 이름은?",
      "어머니의 고향은?",
      "가장 좋아하는 영화는?",
      "첫 직장 이름은?"
   ];

   // 입력 핸들러
   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));

      // 중복확인 대상 필드가 변경되면 중복확인 상태를 초기화
      if (name === 'email') setIsEmailChecked(false);
      if (name === 'nickname') setIsNicknameChecked(false);
   };

   // --- 실시간 유효성 검증 규칙 (useEffect) ---
   useEffect(() => {
      if (viewState !== 'register') return;

      const newErrors = {};

      // 1. 이메일 정규식 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
         newErrors.email = '올바른 이메일 형식이 아닙니다.';
      }

      // 2. 비밀번호 유효성 검사 (8자 이상, 영문/숫자/특수문자 포함)
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d,@$!%*#?&]{8,}$/;
      if (formData.password && !passwordRegex.test(formData.password)) {
         newErrors.password = '8자 이상, 영문, 숫자, 특수문자를 모두 포함해야 합니다.';
      }

      // 3. 비밀번호 확인 일치성 검사
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
         newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      }

      // 4. 닉네임 글자수 검사 (2~20자)
      if (formData.nickname && (formData.nickname.length < 2 || formData.nickname.length > 20)) {
         newErrors.nickname = '닉네임은 2자 이상 20자 이하여야 합니다.';
      }

      setErrors(newErrors);

      // 5. 전체 필수 조건 충족 여부 빌드 확인
      const allFieldsFilled =
         formData.email.trim() !== '' &&
         formData.password.trim() !== '' &&
         formData.confirmPassword.trim() !== '' &&
         formData.nickname.trim() !== '' &&
         formData.birthDate.trim() !== '' &&
         formData.securityQuestion.trim() !== '' &&
         formData.securityAnswer.trim() !== '';

      const noErrors = Object.keys(newErrors).length === 0;

      setIsFormValid(allFieldsFilled && noErrors && isEmailChecked && isNicknameChecked);
   }, [formData, isEmailChecked, isNicknameChecked, viewState]);

   // 가상 중복확인 처리 함수
   const handleCheckEmail = () => {
      if (!formData.email || errors.email) {
         alert('올바른 이메일을 입력한 후 중복확인을 진행해 주세요.');
         return;
      }
      alert('사용 가능한 이메일 주소입니다.');
      setIsEmailChecked(true);
   };

   const handleCheckNickname = () => {
      if (!formData.nickname || errors.nickname) {
         alert('올바른 닉네임을 입력한 후 중복확인을 진행해 주세요.');
         return;
      }
      alert('사용 가능한 대원 닉네임입니다.');
      setIsNicknameChecked(true);
   };

   const handleRegisterSubmit = (e) => {
      e.preventDefault();
      if (isFormValid) {
         alert('🎉 회원가입 성공! 탐사대원으로 등록되셨습니다. 로그인을 진행해 주세요.');
         setViewState('login');
      }
   };

   // 오류를 유발하던 className 문자열 연산을 깔끔한 변수로 격리
   const emailBtnClass = isEmailChecked
      ? "px-4 rounded-xl text-xs font-medium border whitespace-nowrap transition-colors bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
      : "px-4 rounded-xl text-xs font-medium border whitespace-nowrap transition-colors bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600 disabled:opacity-50";

   const nicknameBtnClass = isNicknameChecked
      ? "px-4 rounded-xl text-xs font-medium border whitespace-nowrap transition-colors bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
      : "px-4 rounded-xl text-xs font-medium border whitespace-nowrap transition-colors bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600 disabled:opacity-50";

   return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 antialiased selection:bg-emerald-500 selection:text-white">
         <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl transition-all duration-300">

            {/* 상단 로고 */}
            <div className="flex flex-col items-center mb-8">
               <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                  <Compass className="w-6 h-6 animate-pulse" />
               </div>
               <h2 className="text-2xl font-bold text-white tracking-tight">WildLog</h2>
               <p className="text-sm text-slate-400 mt-1">야생동물 관측 및 생태 탐사 기록 일지</p>
            </div>

            {/* [2-1] 로그인 영역 */}
            {viewState === 'login' && (
               <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white text-center">탐사대원 로그인</h3>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">이메일 주소</label>
                        <div className="relative">
                           <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                           <input type="email" placeholder="explorer@wildlog.com" className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 outline-none transition-all text-sm" />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">비밀번호</label>
                        <div className="relative">
                           <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                           <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-500 outline-none transition-all text-sm" />
                           <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                     </div>

                     <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl py-3 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all text-sm font-semibold mt-2">
                        로그인하기
                     </button>
                  </form>

                  <div className="flex flex-col space-y-3 pt-2 border-t border-slate-700/50 text-center">
                     <div className="flex justify-center space-x-4 text-xs text-slate-400">
                        <button onClick={() => setViewState('findId')} className="hover:text-emerald-400 transition-colors">아이디 찾기</button>
                        <span className="text-slate-600">|</span>
                        <button onClick={() => setViewState('findPw')} className="hover:text-emerald-400 transition-colors">비밀번호 찾기</button>
                     </div>
                     <button onClick={() => setViewState('register')} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4">
                        새로운 탐사대원으로 가입하기
                     </button>
                  </div>
               </div>
            )}

            {/* [2-2] 아이디 찾기 */}
            {viewState === 'findId' && (
               <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-white">아이디(이메일) 찾기</h3>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">닉네임</label>
                        <div className="relative">
                           <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                           <input type="text" placeholder="등록된 대원 닉네임 입력" className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 outline-none transition-all text-sm" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">생년월일</label>
                        <div className="relative">
                           <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                           <input type="date" className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-4 py-3 text-white outline-none transition-all text-sm text-slate-300" />
                        </div>
                     </div>
                     <div className="flex space-x-3 pt-2">
                        <button type="button" onClick={() => setViewState('login')} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl py-3 transition-all text-sm">취소</button>
                        <button type="submit" className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl py-3 transition-all text-sm font-semibold">아이디 찾기</button>
                     </div>
                  </form>
               </div>
            )}

            {/* [2-3] 비밀번호 찾기 */}
            {viewState === 'findPw' && (
               <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-white">비밀번호 찾기</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">가입 시 등록한 이메일 주소를 입력하시면 비밀번호 재설정 절차가 진행됩니다.</p>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">이메일 주소</label>
                        <div className="relative">
                           <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                           <input type="email" placeholder="explorer@wildlog.com" className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 outline-none transition-all text-sm" />
                        </div>
                     </div>
                     <div className="flex space-x-3 pt-2">
                        <button type="button" onClick={() => setViewState('login')} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl py-3 transition-all text-sm">취소</button>
                        <button type="submit" className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl py-3 transition-all text-sm font-semibold">인증 메일 발송</button>
                     </div>
                  </form>
               </div>
            )}

            {/* [2-4] 회원가입 양식 */}
            {viewState === 'register' && (
               <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  <h3 className="text-lg font-semibold text-white">신규 탐사대원 가입</h3>

                  <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                     {/* 이메일 주소 */}
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">이메일 주소</label>
                        <div className="flex space-x-2">
                           <div className="relative flex-1">
                              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 outline-none transition-all text-sm" required />
                           </div>
                           <button type="button" onClick={handleCheckEmail} disabled={!formData.email || errors.email} className={emailBtnClass}>
                              {isEmailChecked ? '확인 완료' : '중복확인'}
                           </button>
                        </div>
                        {errors.email && <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.email}</p>}
                     </div>

                     {/* 비밀번호 */}
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">비밀번호</label>
                        <div className="relative">
                           <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                           <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="영문/숫자/특수문자 조합" className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-500 outline-none transition-all text-sm" required />
                           <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                        {errors.password ? (
                           <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.password}</p>
                        ) : (
                           <p className="text-[11px] text-slate-500 mt-1 pl-1">※ 규칙: 8자 이상, 영문, 숫자, 특수문자 필수 포함</p>
                        )}
                     </div>

                     {/* 비밀번호 확인 */}
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">비밀번호 확인</label>
                        <div className="relative">
                           <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                           <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="비밀번호 재입력" className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-500 outline-none transition-all text-sm" required />
                           <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300">
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.confirmPassword}</p>}
                     </div>

                     {/* 대원 닉네임 */}
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">대원 닉네임</label>
                        <div className="flex space-x-2">
                           <div className="relative flex-1">
                              <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                              <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} placeholder="2자 ~ 20자 이내 입력" className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 outline-none transition-all text-sm" required />
                           </div>
                           <button type="button" onClick={handleCheckNickname} disabled={!formData.nickname || errors.nickname} className={nicknameBtnClass}>
                              {isNicknameChecked ? '확인 완료' : '중복확인'}
                           </button>
                        </div>
                        {errors.nickname && <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.nickname}</p>}
                     </div>

                     {/* 생년월일 */}
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">생년월일</label>
                        <div className="relative">
                           <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                           <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-4 py-3 text-white outline-none transition-all text-sm text-slate-300" required />
                        </div>
                     </div>

                     {/* 보안 질문 */}
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">보안 질문 선택</label>
                        <div className="relative">
                           <HelpCircle className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                           <select name="securityQuestion" value={formData.securityQuestion} onChange={handleInputChange} className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-4 py-3 text-white outline-none transition-all text-sm appearance-none cursor-pointer text-slate-300" required>
                              <option value="" disabled>계정 분실 시 확인할 보안 질문 선택</option>
                              {securityQuestions.map((question, idx) => (
                                 <option key={idx} value={question} className="bg-slate-800 text-white">{question}</option>
                              ))}
                           </select>
                        </div>
                     </div>

                     {/* 보안 질문 답변 */}
                     <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">보안 질문 답변</label>
                        <div className="relative">
                           <CheckCircle2 className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                           <input type="text" name="securityAnswer" value={formData.securityAnswer} onChange={handleInputChange} placeholder="보안 질문에 대한 답변을 입력하세요" className="w-full bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 outline-none transition-all text-sm" required />
                        </div>
                     </div>

                     {/* 하단 제어 구역 */}
                     <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setViewState('login')} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl py-3 transition-all text-sm">취소</button>
                        <button type="submit" disabled={!isFormValid} className="w-2/3 font-medium rounded-xl py-3 transition-all text-sm font-semibold shadow-lg">
                           대원 등록 완료
                        </button>
                     </div>
                  </form>
               </div>
            )}

         </div>
      </div>
   );
}

