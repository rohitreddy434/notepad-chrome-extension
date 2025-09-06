import React from 'react';

export interface HighlightProps {
  text: string;
  query: string;
  highlightStyle?: React.CSSProperties;
}

export const highlightText = ({ text, query, highlightStyle }: HighlightProps): React.ReactNode => {
  if (!query.trim() || !text) {
    return text;
  }

  const defaultHighlightStyle: React.CSSProperties = {
    backgroundColor: '#fbbf24', // Bright yellow highlight
    color: '#1f2937', // Dark text for contrast
    padding: '2px 4px',
    borderRadius: '3px',
    fontWeight: '600',
    boxShadow: '0 1px 2px rgba(251, 191, 36, 0.3)',
    ...highlightStyle
  };

  try {
    // Create case-insensitive regex to find all matches
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isMatch = regex.test(part);
      // Reset regex for next iteration
      regex.lastIndex = 0;
      
      if (isMatch) {
        return (
          <mark key={index} style={defaultHighlightStyle}>
            {part}
          </mark>
        );
      }
      return part;
    });
  } catch (error) {
    // If regex fails, return original text
    console.warn('Text highlighting failed:', error);
    return text;
  }
};

// Hook for using highlight with theme colors
import { useTheme } from '../contexts/ThemeContext';

export const useHighlight = () => {
  const { theme } = useTheme();

  const getHighlightStyle = (variant: 'primary' | 'secondary' = 'primary'): React.CSSProperties => {
    if (variant === 'primary') {
      return {
        backgroundColor: '#fbbf24', // Bright yellow
        color: '#1f2937', // Dark text
        padding: '2px 4px',
        borderRadius: '3px',
        fontWeight: '600',
        boxShadow: '0 1px 2px rgba(251, 191, 36, 0.3)'
      };
    } else {
      return {
        backgroundColor: '#fcd34d', // Slightly lighter yellow
        color: '#1f2937', // Dark text
        padding: '1px 3px',
        borderRadius: '3px',
        fontWeight: '600',
        boxShadow: '0 1px 1px rgba(252, 211, 77, 0.3)'
      };
    }
  };

  return { getHighlightStyle };
};
