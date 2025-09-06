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
    backgroundColor: '#fbbf24', // Yellow highlight
    color: '#1f2937', // Dark text for contrast
    padding: '1px 2px',
    borderRadius: '2px',
    fontWeight: '500',
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
        backgroundColor: theme.primary + '40',
        color: theme.text,
        padding: '1px 3px',
        borderRadius: '3px',
        fontWeight: '600'
      };
    } else {
      return {
        backgroundColor: theme.secondary + '30',
        color: theme.text,
        padding: '1px 2px',
        borderRadius: '2px',
        fontWeight: '500'
      };
    }
  };

  return { getHighlightStyle };
};
