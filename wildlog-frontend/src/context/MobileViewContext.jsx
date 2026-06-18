import React, { createContext, useContext, useEffect, useState } from 'react';

const MobileViewContext = createContext();

export const MobileViewProvider = ({ children }) => {
  const [isMobileView, setIsMobileView] = useState(() => {
    return localStorage.getItem('wildlog_mobile_view') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('mobile-view', isMobileView);
    localStorage.setItem('wildlog_mobile_view', String(isMobileView));
  }, [isMobileView]);

  const toggleMobileView = () => setIsMobileView(prev => !prev);

  return (
    <MobileViewContext.Provider value={{ isMobileView, toggleMobileView, setIsMobileView }}>
      {children}
    </MobileViewContext.Provider>
  );
};

export const useMobileView = () => useContext(MobileViewContext);
