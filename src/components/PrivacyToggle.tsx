import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePrivacy } from '../contexts/PrivacyContext';

const PrivacyToggle: React.FC = () => {
  const { theme } = useTheme();
  const { privacyModeEnabled, togglePrivacyMode } = usePrivacy();

  return (
    <button
      onClick={togglePrivacyMode}
      style={{
        position: 'fixed',
        top: '20px',
        right: '80px', // Position to the left of theme toggle
        zIndex: 1000,
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        backgroundColor: privacyModeEnabled ? theme.primary : theme.surface,
        color: privacyModeEnabled ? 'white' : theme.text,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        boxShadow: theme.shadow,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'scale(1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = privacyModeEnabled ? theme.primaryHover : theme.surfaceVariant;
        e.currentTarget.style.boxShadow = theme.shadowHover;
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = privacyModeEnabled ? theme.primary : theme.surface;
        e.currentTarget.style.boxShadow = theme.shadow;
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={privacyModeEnabled 
        ? 'Privacy mode ON - Content blurs on load (Ctrl+Shift+P)' 
        : 'Privacy mode OFF - Content always visible (Ctrl+Shift+P)'
      }
    >
      {privacyModeEnabled ? '🔒' : '👁️'}
    </button>
  );
};

export default PrivacyToggle;

