import React, { useState, useEffect, useRef } from 'react';
import { Note, Todo } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useSearch } from '../contexts/SearchContext';
import { highlightText, useHighlight } from '../utils/textHighlight';
import TodoList from './TodoList';
import ResizablePanes from './ResizablePanes';
import PrivacyOverlay from './PrivacyOverlay';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'todos'>>) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdateNote }) => {
  const { theme } = useTheme();
  const { activeSearchQuery, hasActiveSearch } = useSearch();
  const { getHighlightStyle } = useHighlight();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showHighlight, setShowHighlight] = useState(true);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTodos(note.todos || []);
    } else {
      setTitle('');
      setContent('');
      setTodos([]);
    }
  }, [note]);

  // Show highlights by default when search is active
  useEffect(() => {
    setShowHighlight(hasActiveSearch);
  }, [hasActiveSearch]);

  const saveNote = (newTitle?: string, newContent?: string, newTodos?: Todo[]) => {
    if (!note) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      const updates: Partial<Pick<Note, 'title' | 'content' | 'todos'>> = {};
      if (newTitle !== undefined) updates.title = newTitle;
      if (newContent !== undefined) updates.content = newContent;
      if (newTodos !== undefined) updates.todos = newTodos;
      
      onUpdateNote(note.id, updates);
    }, 500); // Auto-save after 500ms of inactivity
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    saveNote(newTitle, content, todos);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    saveNote(title, newContent, todos);
  };

  const handleTodosChange = (newTodos: Todo[]) => {
    setTodos(newTodos);
    saveNote(title, content, newTodos);
  };

  const formatText = (command: string) => {
    if (!contentRef.current) return;
    
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newContent = content;
    let newStart = start;
    let newEnd = end;

    if (command === 'bold' && selectedText) {
      newContent = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
      newEnd = end + 4;
    }

    setContent(newContent);
    handleContentChange(newContent);

    // Restore cursor position
    setTimeout(() => {
      if (textarea) {
        textarea.selectionStart = newStart;
        textarea.selectionEnd = newEnd;
        textarea.focus();
      }
    }, 0);
  };

  if (!note) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
        color: theme.textMuted,
        fontSize: '18px',
        fontWeight: '500',
        textAlign: 'center',
        padding: '48px'
      }}>
        <div style={{ maxWidth: '300px', lineHeight: '1.6' }}>
          Select a note to start editing, or create a new one to get started! ✨
        </div>
      </div>
    );
  }

  const actionButtonStyle = {
    padding: '8px 16px',
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    backgroundColor: theme.surface,
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: theme.text,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const leftPane = (
    <TodoList 
      todos={todos}
      onUpdateTodos={handleTodosChange}
    />
  );

  const rightPane = (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.background,
      position: 'relative'
    }}>
      {/* Content Editor */}
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onFocus={() => setShowHighlight(false)}
          onBlur={() => setShowHighlight(true)}
          placeholder="Start writing your thoughts..."
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '16px',
            lineHeight: '1.7',
            padding: '32px',
            backgroundColor: theme.background,
            color: theme.textSecondary,
            fontFamily: 'inherit',
            fontWeight: '400',
            transition: 'all 0.2s ease',
            zIndex: 2
          }}
        />
        
        {/* Highlight Overlay (shows when search is active and not actively editing) */}
        {hasActiveSearch && showHighlight && content && (
          <div
            onClick={() => {
              // Click on highlight overlay to focus the textarea
              setShowHighlight(false);
              contentRef.current?.focus();
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: '32px',
              fontSize: '16px',
              lineHeight: '1.7',
              fontFamily: 'inherit',
              fontWeight: '400',
              color: theme.textSecondary,
              backgroundColor: theme.background,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'auto',
              cursor: 'text',
              zIndex: 3
            }}
          >
            {highlightText({
              text: content,
              query: activeSearchQuery,
              highlightStyle: getHighlightStyle('primary')
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.background,
      position: 'relative' // Enable relative positioning for privacy overlay
    }}>
      {/* Title and Actions Row */}
      <div style={{
        padding: '20px 32px',
        borderBottom: `1px solid ${theme.borderLight}`,
        backgroundColor: theme.surface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '80px',
        boxShadow: theme.shadow,
        zIndex: 10 // Keep above content but below privacy overlay
      }}>
        {/* Title */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled note"
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '28px',
            fontWeight: '700',
            backgroundColor: 'transparent',
            color: theme.text,
            fontFamily: 'inherit',
            letterSpacing: '-0.025em',
            transition: 'color 0.2s ease',
            flex: 1,
            marginRight: '24px'
          }}
        />
        
        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={() => formatText('bold')}
            style={actionButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.surfaceVariant;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = theme.shadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.surface;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Bold (works on notes)"
          >
            <strong>B</strong>
          </button>
          
          <div style={{ 
            fontSize: '13px', 
            color: theme.textMuted,
            fontWeight: '500',
            backgroundColor: theme.surfaceVariant,
            padding: '6px 12px',
            borderRadius: '6px'
          }}>
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Resizable Panes */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ResizablePanes
          leftPane={leftPane}
          rightPane={rightPane}
          defaultLeftWidth={40}
        />
        
        {/* Privacy Overlay - Only covers the note content area */}
        <PrivacyOverlay />
      </div>
    </div>
  );
};

export default NoteEditor;
