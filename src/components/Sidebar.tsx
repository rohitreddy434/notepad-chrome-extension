import React from 'react';
import { Note } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useSearch } from '../contexts/SearchContext';
import { highlightText, useHighlight } from '../utils/textHighlight';

interface SidebarProps {
  notes: Note[];
  currentNote: Note | null;
  onCreateNote: () => void;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  notes, 
  currentNote, 
  onCreateNote, 
  onSelectNote,
  onDeleteNote
}) => {
  const { theme } = useTheme();
  const { activeSearchQuery, hasActiveSearch } = useSearch();
  const { getHighlightStyle } = useHighlight();
  const formatDate = (date: Date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - noteDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return noteDate.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  // Filter notes based on search query
  const filteredNotes = React.useMemo(() => {
    if (!hasActiveSearch) return notes;

    return notes.filter(note => {
      const searchLower = activeSearchQuery.toLowerCase();
      
      // Search in title
      if (note.title.toLowerCase().includes(searchLower)) return true;
      
      // Search in content
      if (note.content.toLowerCase().includes(searchLower)) return true;
      
      // Search in todos
      if (note.todos && note.todos.some(todo => 
        todo.text.toLowerCase().includes(searchLower)
      )) return true;
      
      return false;
    });
  }, [notes, activeSearchQuery, hasActiveSearch]);

  return (
    <div style={{
      width: '320px',
      height: '100vh',
      borderRight: `1px solid ${theme.border}`,
      backgroundColor: theme.surface,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: theme.shadow
    }}>
      {/* Header with title and plus button */}
      <div style={{
        padding: '24px 20px',
        borderBottom: `1px solid ${theme.borderLight}`,
        backgroundColor: theme.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '80px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: theme.text,
          margin: 0,
          letterSpacing: '-0.025em'
        }}>
          Notes
        </h1>
        <button
          onClick={onCreateNote}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: theme.primary,
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: theme.shadow,
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.primaryHover;
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = theme.shadowHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.primary;
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = theme.shadow;
          }}
        >
          +
        </button>
      </div>

      {/* Notes list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0'
      }}>
        {/* Search Results Info */}
        {hasActiveSearch && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: theme.primary + '10',
            border: `1px solid ${theme.primary}30`,
            borderRadius: '8px',
            margin: '8px 12px',
            fontSize: '13px',
            color: theme.primary,
            fontWeight: '500'
          }}>
            {filteredNotes.length === 0 
              ? `No results for "${activeSearchQuery}"`
              : `Found ${filteredNotes.length} note${filteredNotes.length !== 1 ? 's' : ''} matching "${activeSearchQuery}"`
            }
          </div>
        )}

        {filteredNotes.length === 0 && !hasActiveSearch ? (
          <div style={{
            padding: '48px 20px',
            textAlign: 'center',
            color: theme.textMuted,
            fontSize: '15px',
            lineHeight: '1.5'
          }}>
            No notes yet. Click the + button to create your first note!
          </div>
        ) : filteredNotes.length === 0 && hasActiveSearch ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: theme.textMuted,
            fontSize: '15px',
            lineHeight: '1.5'
          }}>
            No notes found for "{activeSearchQuery}"
            <br />
            <span style={{ fontSize: '13px', opacity: 0.8 }}>
              Try a different search term
            </span>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              style={{
                margin: '4px 12px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: currentNote?.id === note.id ? theme.primary + '15' : 'transparent',
                border: currentNote?.id === note.id ? `1px solid ${theme.primary}30` : '1px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0)',
                boxShadow: currentNote?.id === note.id ? theme.shadow : 'none',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (currentNote?.id !== note.id) {
                  e.currentTarget.style.backgroundColor = theme.surfaceVariant;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = theme.shadow;
                }
              }}
              onMouseLeave={(e) => {
                if (currentNote?.id !== note.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div 
                onClick={() => onSelectNote(note)}
                style={{
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: theme.text,
                  marginBottom: '6px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: '30px' // Make space for delete button
                }}>
                  {hasActiveSearch 
                    ? highlightText({ 
                        text: note.title, 
                        query: activeSearchQuery,
                        highlightStyle: getHighlightStyle('primary')
                      })
                    : note.title
                  }
                </div>
                <div style={{
                  fontSize: '13px',
                  color: theme.textSecondary,
                  marginBottom: '8px',
                  lineHeight: '1.4',
                  height: '34px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {note.content ? (
                    hasActiveSearch 
                      ? highlightText({ 
                          text: truncateContent(note.content, 60), 
                          query: activeSearchQuery,
                          highlightStyle: getHighlightStyle('secondary')
                        })
                      : truncateContent(note.content, 60)
                  ) : 'No content'}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textMuted,
                  fontWeight: '500'
                }}>
                  {formatDate(note.updatedAt)}
                </div>
              </div>
              
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent selecting the note
                  if (confirm('Are you sure you want to delete this note?')) {
                    onDeleteNote(note.id);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  opacity: 0.6
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.textMuted;
                  e.currentTarget.style.opacity = '0.6';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Delete note"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
