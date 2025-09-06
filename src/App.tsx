import React, { useState, useEffect, useRef } from 'react';
import { Note } from './types';
import { notesDB } from './db';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import SearchBar from './components/SearchBar';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { SearchProvider } from './contexts/SearchContext';
import ThemeToggle from './components/ThemeToggle';
import PrivacyToggle from './components/PrivacyToggle';
import PrivacyOverlay from './components/PrivacyOverlay';

function AppContent() {
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const broadcastChannel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    initializeApp();
    setupCrossWindowSync();

    return () => {
      if (broadcastChannel.current) {
        broadcastChannel.current.close();
      }
    };
  }, []);

  const setupCrossWindowSync = () => {
    // Create broadcast channel for cross-window communication
    broadcastChannel.current = new BroadcastChannel('notepad-sync');
    
    // Listen for updates from other windows
    broadcastChannel.current.addEventListener('message', (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'NOTE_UPDATED':
          handleExternalNoteUpdate(data.note);
          break;
        case 'NOTE_CREATED':
          handleExternalNoteCreation(data.note);
          break;
        case 'NOTE_DELETED':
          handleExternalNoteDeleted(data.noteId);
          break;
        case 'NOTES_REFRESHED':
          refreshNotes();
          break;
      }
    });
  };

  const handleExternalNoteUpdate = (updatedNote: Note) => {
    setNotes(prev => prev.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ));
    
    // Update current note if it's the one being edited
    if (currentNote?.id === updatedNote.id) {
      setCurrentNote(updatedNote);
    }
  };

  const handleExternalNoteCreation = (newNote: Note) => {
    setNotes(prev => [newNote, ...prev]);
  };

  const handleExternalNoteDeleted = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    
    // If the deleted note was currently selected, clear selection
    if (currentNote?.id === noteId) {
      setCurrentNote(null);
    }
  };

  const refreshNotes = async () => {
    try {
      const allNotes = await notesDB.getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Failed to refresh notes:', error);
    }
  };

  const broadcastChange = (type: string, data: any) => {
    if (broadcastChannel.current) {
      broadcastChannel.current.postMessage({ type, data });
    }
  };

  const initializeApp = async () => {
    try {
      await notesDB.init();
      const allNotes = await notesDB.getAllNotes();
      setNotes(allNotes);
      
      // Load the most recent note by default
      if (allNotes.length > 0) {
        setCurrentNote(allNotes[0]);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewNote = async () => {
    try {
      const newNote = await notesDB.createNote();
      setNotes(prev => [newNote, ...prev]);
      setCurrentNote(newNote);
      
      // Broadcast to other windows
      broadcastChange('NOTE_CREATED', { note: newNote });
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const updateNote = async (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'todos'>>) => {
    try {
      const updatedNote = await notesDB.updateNote(id, updates);
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ));
      
      // Update current note if it's the one being edited
      if (currentNote?.id === id) {
        setCurrentNote(updatedNote);
      }

      // Re-sort notes by updated time
      const allNotes = await notesDB.getAllNotes();
      setNotes(allNotes);
      
      // Broadcast to other windows
      broadcastChange('NOTE_UPDATED', { note: updatedNote });
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const selectNote = (note: Note) => {
    setCurrentNote(note);
  };

  const deleteNote = async (noteId: string) => {
    try {
      await notesDB.deleteNote(noteId);
      
      // Remove from local state
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      // If we're deleting the currently selected note, clear the selection
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
      }
      
      // Broadcast to other windows
      broadcastChange('NOTE_DELETED', { noteId });
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: theme.textMuted,
        backgroundColor: theme.background,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        Loading your notes...
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      backgroundColor: theme.background,
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <SearchBar />
      <ThemeToggle />
      <PrivacyToggle />
      <Sidebar 
        notes={notes}
        currentNote={currentNote}
        onCreateNote={createNewNote}
        onSelectNote={selectNote}
        onDeleteNote={deleteNote}
      />
      <NoteEditor 
        note={currentNote}
        onUpdateNote={updateNote}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <PrivacyProvider>
          <AppContent />
        </PrivacyProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;
