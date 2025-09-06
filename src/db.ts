import { Note, NoteCreateInput } from './types';

const DB_NAME = 'NotePadDB';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';

class NotesDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(NOTES_STORE)) {
          const store = db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async createNote(noteData: NoteCreateInput = {}): Promise<Note> {
    const now = new Date();
    const note: Note = {
      id: crypto.randomUUID(),
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      todos: noteData.todos || [],
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.add(note);

      request.onsuccess = () => resolve(note);
      request.onerror = () => reject(request.error);
    });
  }

  async updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'todos'>>): Promise<Note> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const note = getRequest.result;
        if (!note) {
          reject(new Error('Note not found'));
          return;
        }

        const updatedNote: Note = {
          ...note,
          ...updates,
          updatedAt: new Date(),
        };

        const updateRequest = store.put(updatedNote);
        updateRequest.onsuccess = () => resolve(updatedNote);
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getAllNotes(): Promise<Note[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const index = store.index('updatedAt');
      const request = index.getAll();

      request.onsuccess = () => {
        const notes = request.result as Note[];
        // Sort by most recently updated first
        notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(notes);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getNote(id: string): Promise<Note | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([NOTES_STORE], 'readonly');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteNote(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(NOTES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const notesDB = new NotesDB();
