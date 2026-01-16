import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';

interface ForbiddenContextType {
  isForbidden: boolean;
  setForbidden: (value: boolean) => void;
  clearForbidden: () => void;
  isChecking: boolean;
  setChecking: (value: boolean) => void;
}

const ForbiddenContext = createContext<ForbiddenContextType | undefined>(undefined);

// Global function để set forbidden state từ axios interceptor
let globalSetForbidden: ((value: boolean) => void) | null = null;
let globalSetChecking: ((value: boolean) => void) | null = null;

export const setGlobalForbidden = (value: boolean) => {
  if (globalSetForbidden) {
    globalSetForbidden(value);
  }
  // Khi set forbidden, cũng set checking = false vì đã biết kết quả
  if (globalSetChecking) {
    globalSetChecking(false);
  }
};

export const setGlobalChecking = (value: boolean) => {
  if (globalSetChecking) {
    globalSetChecking(value);
  }
};

export const ForbiddenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  // Mặc định isChecking = true để đảm bảo không render content trước khi check quyền
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const checkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    globalSetForbidden = setIsForbidden;
    globalSetChecking = setIsChecking;
    return () => {
      globalSetForbidden = null;
      globalSetChecking = null;
      if (checkingTimeoutRef.current) {
        clearTimeout(checkingTimeoutRef.current);
      }
    };
  }, []);

  const setForbidden = useCallback((value: boolean) => {
    setIsForbidden(value);
    if (value) {
      setIsChecking(false); // Khi forbidden, không còn checking nữa
    }
  }, []);

  const clearForbidden = useCallback(() => {
    setIsForbidden(false);
    // Khi clear forbidden (route change), set checking = true để đợi API call đầu tiên
    setIsChecking(true);
    // Auto clear checking sau 2 giây để tránh stuck ở checking state
    if (checkingTimeoutRef.current) {
      clearTimeout(checkingTimeoutRef.current);
    }
    checkingTimeoutRef.current = setTimeout(() => {
      setIsChecking(false);
    }, 2000);
  }, []);

  const setChecking = useCallback((value: boolean) => {
    setIsChecking(value);
    if (checkingTimeoutRef.current) {
      clearTimeout(checkingTimeoutRef.current);
      checkingTimeoutRef.current = null;
    }
  }, []);

  return (
    <ForbiddenContext.Provider value={{ isForbidden, setForbidden, clearForbidden, isChecking, setChecking }}>
      {children}
    </ForbiddenContext.Provider>
  );
};

export const useForbidden = (): ForbiddenContextType => {
  const context = useContext(ForbiddenContext);
  if (!context) {
    throw new Error('useForbidden must be used within a ForbiddenProvider');
  }
  return context;
};
