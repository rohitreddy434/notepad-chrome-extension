import React, { createContext, useContext, useState, useEffect } from 'react';

interface PrivacyContextType {
  isPrivacyMode: boolean;
  isContentBlurred: boolean;
  togglePrivacyMode: () => void;
  revealContent: () => void;
  hideContent: () => void;
  privacyModeEnabled: boolean;
  setPrivacyModeEnabled: (enabled: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};

interface PrivacyProviderProps {
  children: React.ReactNode;
}

export const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  const [privacyModeEnabled, setPrivacyModeEnabled] = useState(true); // Privacy mode enabled by default
  const [isContentBlurred, setIsContentBlurred] = useState(true); // Start blurred
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    // Load privacy settings from localStorage
    const savedPrivacyMode = localStorage.getItem('notepad-privacy-mode');
    if (savedPrivacyMode !== null) {
      setPrivacyModeEnabled(savedPrivacyMode === 'true');
    }

    // If privacy mode is enabled, start blurred
    if (privacyModeEnabled) {
      setIsContentBlurred(true);
    } else {
      setIsContentBlurred(false);
    }

    setHasInitialLoad(true);
  }, []);

  useEffect(() => {
    // Save privacy mode preference
    if (hasInitialLoad) {
      localStorage.setItem('notepad-privacy-mode', privacyModeEnabled.toString());
    }

    // If privacy mode is disabled, always show content
    if (!privacyModeEnabled) {
      setIsContentBlurred(false);
    } else {
      // If enabling privacy mode, blur content
      setIsContentBlurred(true);
    }
  }, [privacyModeEnabled, hasInitialLoad]);

  useEffect(() => {
    // Keyboard shortcut: Ctrl/Cmd + Shift + P
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        togglePrivacyMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePrivacyMode = () => {
    setPrivacyModeEnabled(prev => !prev);
  };

  const revealContent = () => {
    setIsContentBlurred(false);
  };

  const hideContent = () => {
    if (privacyModeEnabled) {
      setIsContentBlurred(true);
    }
  };

  const updatePrivacyModeEnabled = (enabled: boolean) => {
    setPrivacyModeEnabled(enabled);
  };

  return (
    <PrivacyContext.Provider value={{
      isPrivacyMode: privacyModeEnabled,
      isContentBlurred,
      togglePrivacyMode,
      revealContent,
      hideContent,
      privacyModeEnabled,
      setPrivacyModeEnabled: updatePrivacyModeEnabled
    }}>
      {children}
    </PrivacyContext.Provider>
  );
};

