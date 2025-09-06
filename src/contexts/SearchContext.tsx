import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
  searchQuery: string;
  activeSearchQuery: string; // The query that's actually being used for filtering
  setSearchQuery: (query: string) => void;
  executeSearch: () => void;
  clearSearch: () => void;
  hasActiveSearch: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  const executeSearch = () => {
    setActiveSearchQuery(searchQuery.trim());
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearchQuery('');
  };

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query);
    // If query is empty, clear the active search immediately
    if (!query.trim()) {
      setActiveSearchQuery('');
    }
  };

  const hasActiveSearch = activeSearchQuery.length > 0;

  return (
    <SearchContext.Provider value={{
      searchQuery,
      activeSearchQuery,
      setSearchQuery: handleSetSearchQuery,
      executeSearch,
      clearSearch,
      hasActiveSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};
