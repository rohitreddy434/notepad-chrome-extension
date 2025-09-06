import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ResizablePanesProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  defaultLeftWidth?: number; // percentage
}

const ResizablePanes: React.FC<ResizablePanesProps> = ({ 
  leftPane, 
  rightPane, 
  defaultLeftWidth = 40 
}) => {
  const { theme } = useTheme();
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain between 20% and 80%
    const constrainedWidth = Math.max(20, Math.min(80, newLeftWidth));
    setLeftWidth(constrainedWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        position: 'relative'
      }}
    >
      {/* Left Pane */}
      <div
        style={{
          width: `${leftWidth}%`,
          height: '100%',
          overflow: 'hidden',
          backgroundColor: theme.surface
        }}
      >
        {leftPane}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: '4px',
          height: '100%',
          backgroundColor: isDragging ? theme.primary : theme.border,
          cursor: 'col-resize',
          transition: isDragging ? 'none' : 'background-color 0.2s ease',
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = theme.primary;
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = theme.border;
          }
        }}
      >
        {/* Resize Handle Dots */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          opacity: isDragging ? 1 : 0.6
        }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '2px',
                height: '2px',
                backgroundColor: theme.background,
                borderRadius: '50%'
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Pane */}
      <div
        style={{
          width: `${100 - leftWidth}%`,
          height: '100%',
          overflow: 'hidden',
          backgroundColor: theme.background
        }}
      >
        {rightPane}
      </div>
    </div>
  );
};

export default ResizablePanes;
