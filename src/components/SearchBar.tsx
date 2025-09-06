import React, { useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSearch } from '../contexts/SearchContext';

const SearchBar: React.FC = () => {
  const { theme } = useTheme();
  const { searchQuery, setSearchQuery, executeSearch, clearSearch, hasActiveSearch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeSearch();
    } else if (e.key === 'Escape') {
      clearSearch();
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1001,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Search notes and todos... (Press Enter)"
          style={{
            width: '400px',
            padding: '12px 16px 12px 44px', // Extra padding for search icon
            borderRadius: '12px',
            border: `1px solid ${hasActiveSearch ? theme.primary : theme.border}`,
            backgroundColor: theme.surface,
            color: theme.text,
            fontSize: '14px',
            fontFamily: 'inherit',
            outline: 'none',
            boxShadow: theme.shadow,
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.primary;
            e.currentTarget.style.boxShadow = theme.shadowHover;
          }}
          onBlur={(e) => {
            if (!hasActiveSearch) {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.boxShadow = theme.shadow;
            }
          }}
        />

        {/* Search Icon */}
        <div style={{
          position: 'absolute',
          left: '14px',
          color: hasActiveSearch ? theme.primary : theme.textMuted,
          fontSize: '16px',
          pointerEvents: 'none',
          transition: 'color 0.2s ease'
        }}>
          🔍
        </div>

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: theme.textMuted + '20',
              color: theme.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.textMuted + '40';
              e.currentTarget.style.color = theme.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.textMuted + '20';
              e.currentTarget.style.color = theme.textMuted;
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Status */}
      {hasActiveSearch && (
        <div style={{
          padding: '6px 12px',
          borderRadius: '16px',
          backgroundColor: theme.primary + '20',
          border: `1px solid ${theme.primary}40`,
          fontSize: '12px',
          color: theme.primary,
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>🎯</span>
          Searching
        </div>
      )}
    </div>
  );
};

export default SearchBar;
