import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TodoListProps {
  todos: Todo[];
  onUpdateTodos: (todos: Todo[]) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onUpdateTodos }) => {
  const { theme } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewTodoInput, setShowNewTodoInput] = useState<boolean>(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const createNewTodo = (text: string = '') => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    const updatedTodos = [...todos, newTodo];
    onUpdateTodos(updatedTodos);
    
    if (text.trim()) {
      setShowNewTodoInput(false);
      // Auto-create next todo
      setTimeout(() => {
        setShowNewTodoInput(true);
      }, 50);
    } else {
      setEditingId(newTodo.id);
    }
  };

  const updateTodo = (todoId: string, updates: Partial<Todo>) => {
    const updatedTodos = todos.map(todo =>
      todo.id === todoId ? { ...todo, ...updates } : todo
    );
    onUpdateTodos(updatedTodos);
  };

  const deleteTodo = (todoId: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== todoId);
    onUpdateTodos(updatedTodos);
  };

  const handleKeyPress = (e: React.KeyboardEvent, todoId?: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter behavior
      const todoText = (e.target as HTMLTextAreaElement).value.trim();
      
      if (todoId) {
        // Editing existing todo
        if (todoText) {
          updateTodo(todoId, { text: todoText });
          setEditingId(null);
          createNewTodo(); // Auto-create next todo
        } else {
          deleteTodo(todoId); // Delete empty todo
          setEditingId(null);
        }
      } else {
        // Creating new todo from input
        if (todoText) {
          createNewTodo(todoText);
          const textarea = e.target as HTMLTextAreaElement;
          textarea.value = '';
          handleTextareaResize(textarea);
        }
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Allow Shift+Enter for new line within the same todo
      // Don't prevent default - let textarea handle the new line
      // The onChange handler will handle auto-saving
    } else if (e.key === 'Escape') {
      if (todoId) {
        const todo = todos.find(t => t.id === todoId);
        if (todo && !todo.text.trim()) {
          deleteTodo(todoId);
        }
        setEditingId(null);
      } else {
        setShowNewTodoInput(false);
        const textarea = e.target as HTMLTextAreaElement;
        textarea.value = '';
        handleTextareaResize(textarea);
      }
    }
  };

  const handleNewTodoInput = (e: React.KeyboardEvent) => {
    handleKeyPress(e);
  };

  const handleBlur = (todoId: string, text: string) => {
    if (text.trim()) {
      updateTodo(todoId, { text: text.trim() });
    } else {
      deleteTodo(todoId);
    }
    setEditingId(null);
  };

  // Auto-resize textarea
  const handleTextareaResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(20, textarea.scrollHeight) + 'px';
  };

  // Debounced auto-save for multi-line todos
  const debouncedSave = (todoId: string, text: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (text.trim()) {
        updateTodo(todoId, { text: text.trim() });
      }
    }, 300); // Save after 300ms of inactivity
  };

  const handleTextareaChange = (todoId: string, text: string) => {
    // Auto-save while typing (for multi-line support)
    debouncedSave(todoId, text);
  };

  useEffect(() => {
    if ((editingId || showNewTodoInput) && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.focus();
      
      // Auto-resize on focus
      handleTextareaResize(textarea);
      
      // Move cursor to end
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
    }
  }, [editingId, showNewTodoInput]);

  // Check if we should show new todo input
  const shouldShowNewInput = () => {
    if (todos.length === 0) return true; // Always show when no todos
    if (showNewTodoInput) return true; // Explicitly showing
    
    // Show if all todos are completed and user can add more
    const allCompleted = todos.every(todo => todo.completed);
    return allCompleted;
  };

  // Sort todos: uncompleted first, then completed (faded)
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      backgroundColor: theme.surface
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: `1px solid ${theme.borderLight}`
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: theme.text,
          margin: 0
        }}>
          Tasks
        </h3>
      </div>

      {/* Todo List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* New Todo Input (shown at top when needed) */}
        {shouldShowNewInput() && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: theme.surfaceVariant,
              border: `2px solid ${theme.primary}30`,
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="checkbox"
              disabled
              style={{
                width: '16px',
                height: '16px',
                accentColor: theme.primary,
                opacity: 0.5
              }}
            />
            <textarea
              ref={inputRef}
              onKeyDown={handleNewTodoInput}
              onClick={() => setShowNewTodoInput(true)}
              onFocus={() => setShowNewTodoInput(true)}
              onInput={(e) => handleTextareaResize(e.target as HTMLTextAreaElement)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: theme.text,
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'none',
                minHeight: '20px',
                lineHeight: '1.4',
                padding: 0,
                overflow: 'hidden'
              }}
              placeholder={todos.length === 0 ? "What needs to be done? Press Enter to save, Shift+Enter for new line..." : "Add another task..."}
              rows={1}
            />
          </div>
        )}

        {/* Existing Todos */}
        {sortedTodos.map((todo) => (
          <div
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: theme.surfaceVariant,
              opacity: todo.completed ? 0.6 : 1,
              transition: 'all 0.2s ease',
              border: `1px solid ${theme.borderLight}`
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => updateTodo(todo.id, { completed: e.target.checked })}
              style={{
                width: '16px',
                height: '16px',
                accentColor: theme.primary,
                cursor: 'pointer'
              }}
            />
            {editingId === todo.id ? (
              <textarea
                ref={inputRef}
                defaultValue={todo.text}
                onKeyDown={(e) => handleKeyPress(e, todo.id)}
                onBlur={(e) => handleBlur(todo.id, e.target.value)}
                onInput={(e) => {
                  const textarea = e.target as HTMLTextAreaElement;
                  handleTextareaResize(textarea);
                  handleTextareaChange(todo.id, textarea.value);
                }}
                onChange={(e) => handleTextareaChange(todo.id, e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: theme.text,
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  minHeight: '20px',
                  lineHeight: '1.4',
                  padding: 0,
                  overflow: 'hidden'
                }}
                placeholder="What needs to be done?"
                rows={1}
              />
            ) : (
              <div
                onClick={() => setEditingId(todo.id)}
                style={{
                  flex: 1,
                  color: todo.completed ? theme.textMuted : theme.text,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  transition: 'color 0.2s ease',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  minHeight: '20px'
                }}
              >
                {todo.text || 'Click to edit...'}
              </div>
            )}
          </div>
        ))}

        {/* Show input at bottom if all todos are completed and we haven't shown it at top */}
        {todos.length > 0 && todos.every(todo => todo.completed) && !shouldShowNewInput() && (
          <div
            onClick={() => setShowNewTodoInput(true)}
            style={{
              padding: '12px',
              textAlign: 'center',
              color: theme.textMuted,
              fontSize: '14px',
              cursor: 'pointer',
              border: `2px dashed ${theme.border}`,
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.surfaceVariant;
              e.currentTarget.style.borderColor = theme.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = theme.border;
            }}
          >
            All done! Click here or press Enter to add another task...
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        fontSize: '12px',
        color: theme.textMuted,
        marginTop: '12px',
        padding: '8px',
        backgroundColor: theme.background,
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        Enter to save • Shift+Enter for new line • Escape to cancel
      </div>
    </div>
  );
};

export default TodoList;
