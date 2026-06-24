import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'wildlog_search_history';

export default function useSearchHistory(searchKey = 'default') {
  const [savedSearches, setSavedSearches] = useState({});

  // Load saved searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      setSavedSearches(stored);
    } catch (e) {
      console.error('Failed to load search history:', e);
    }
  }, []);

  // Save a search term
  const saveSearchTerm = useCallback((key, term) => {
    if (!term || !term.trim()) return;
    setSavedSearches(prev => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = [];
      // Remove duplicate if exists
      const filtered = updated[key].filter(t => t.toLowerCase() !== term.toLowerCase());
      // Add to front, limit to 10
      updated[key] = [term, ...filtered].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get saved searches for a specific key
  const getSavedSearches = useCallback((key) => {
    return savedSearches[key] || [];
  }, [savedSearches]);

  // Clear saved searches for a specific key
  const clearSavedSearches = useCallback((key) => {
    setSavedSearches(prev => {
      const updated = { ...prev };
      delete updated[key];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { saveSearchTerm, getSavedSearches, clearSavedSearches };
}