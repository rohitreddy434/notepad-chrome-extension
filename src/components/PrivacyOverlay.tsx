import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { usePrivacy } from '../contexts/PrivacyContext';

interface PrivacyOverlayProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

const PrivacyOverlay: React.FC<PrivacyOverlayProps> = ({ containerRef }) => {
  const { theme } = useTheme();
  const { isContentBlurred, revealContent } = usePrivacy();

  if (!isContentBlurred) return null;

  return (
    <div
      onClick={revealContent}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.background + 'E6', // Semi-transparent
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)', // Safari support
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderRadius: '0 12px 12px 0' // Match the note editor border radius
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: theme.text,
          maxWidth: '350px',
          padding: '32px 24px',
          borderRadius: '12px',
          backgroundColor: theme.surface + 'F5',
          boxShadow: theme.shadow,
          border: `1px solid ${theme.border}`,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div style={{
          fontSize: '40px',
          marginBottom: '16px',
          opacity: 0.8
        }}>
          🔒
        </div>
        
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '8px',
          color: theme.text
        }}>
          Notes Hidden
        </h3>
        
        <p style={{
          fontSize: '14px',
          color: theme.textSecondary,
          lineHeight: '1.4',
          marginBottom: '16px'
        }}>
          Privacy mode is protecting your note content
        </p>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: theme.primary + '20',
          border: `1px solid ${theme.primary}40`,
          borderRadius: '16px',
          fontSize: '12px',
          color: theme.primary,
          fontWeight: '500'
        }}>
          <span>👁️</span>
          Click to reveal
        </div>
      </div>
    </div>
  );
};

export default PrivacyOverlay;
