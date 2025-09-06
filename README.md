# 📝 Notepad Chrome Extension

A modern, feature-rich notepad Chrome extension that replaces your new tab with a powerful note-taking and task management interface.

## ✨ Features

### 🎯 **Core Functionality**
- **New Tab Override** - Opens automatically when you create a new tab
- **Dual-Pane Layout** - Resizable todo list (40%) and notes area (60%)
- **Auto-save** - Real-time saving with 500ms debouncing
- **Cross-window Sync** - Changes sync instantly across all open tabs
- **IndexedDB Storage** - Future-ready for cloud sync capabilities

### 📋 **Smart Todo Management**
- **Natural Creation** - Just start typing, checkbox appears automatically
- **Multi-line Support** - Shift+Enter for new lines within todos
- **Auto-resize** - Text areas expand as you type
- **Completion Tracking** - Completed todos fade and move to bottom
- **Click to Edit** - Intuitive editing experience

### 📖 **Rich Note Taking**
- **Google Docs-like Editor** - Clean, distraction-free writing
- **Text Formatting** - Bold text support with **B** button
- **Multi-line Notes** - Full-featured textarea for long-form content
- **Title Management** - Easy note title editing

### 🎨 **Modern Design**
- **Dark Mode by Default** - Beautiful dark interface
- **Light Mode Toggle** - ☀️/🌙 button for theme switching  
- **Inter Font** - Professional typography with custom font features
- **Smooth Animations** - Micro-interactions and hover effects
- **Custom Shadows** - Depth and modern aesthetics

### 🔒 **Privacy Features**
- **Privacy Mode** - Blur note content for screen sharing
- **Smart Toggle** - 🔒/👁️ button for quick privacy control
- **Keyboard Shortcut** - Ctrl/Cmd + Shift + P for instant toggle
- **Content Protection** - Only note content blurs, UI stays visible
- **Settings Persistence** - Remembers your privacy preferences

### 🗂️ **Note Management**
- **Sidebar Navigation** - Clean note list with previews
- **Recent First** - Notes sorted by last updated
- **Delete Functionality** - ✕ button with confirmation
- **Note Previews** - Title, content preview, and timestamp
- **Quick Creation** - + button for instant new notes

## 🚀 **Installation**

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist` folder
7. Open a new tab to start using your notepad!

## 🛠️ **Development**

### **Tech Stack**
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **IndexedDB** - Client-side database
- **Chrome Extension Manifest V3** - Latest extension format

### **Commands**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### **Architecture**
- **Context-based State Management** - Theme and Privacy contexts
- **Component Architecture** - Modular, reusable components
- **Database Abstraction** - Clean IndexedDB wrapper
- **Cross-window Communication** - BroadcastChannel API

## 📁 **Project Structure**

```
src/
├── components/           # React components
│   ├── NoteEditor.tsx   # Main note editing interface
│   ├── Sidebar.tsx      # Note list and navigation
│   ├── TodoList.tsx     # Todo management
│   ├── ResizablePanes.tsx # Resizable layout
│   ├── ThemeToggle.tsx  # Dark/light mode toggle
│   ├── PrivacyToggle.tsx # Privacy mode control
│   └── PrivacyOverlay.tsx # Privacy blur overlay
├── contexts/            # React contexts
│   ├── ThemeContext.tsx # Theme management
│   └── PrivacyContext.tsx # Privacy mode state
├── types.ts            # TypeScript definitions
├── db.ts              # IndexedDB database layer
├── main.tsx           # React entry point
└── index.css          # Global styles
```

## 🎯 **Future Enhancements**

- [ ] Search functionality across all notes
- [ ] Cloud sync for cross-device access
- [ ] Note categories/tags
- [ ] Export/import functionality
- [ ] Markdown support
- [ ] Collaborative features
- [ ] Mobile responsive design

## 📄 **License**

MIT License - feel free to use, modify, and distribute!

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for productivity and beautiful user experiences.
