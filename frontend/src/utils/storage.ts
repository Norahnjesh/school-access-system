// Storage utilities for School Access System

// Storage keys constants
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  THEME: 'school-access-theme',
  LANGUAGE: 'school-access-language',
  PREFERENCES: 'school-access-preferences',
  RECENT_SEARCHES: 'recent-searches',
  FILTERS: {
    STUDENTS: 'student-filters',
    BUSES: 'bus-filters',
    IMPORTS: 'import-filters',
    REPORTS: 'report-filters'
  },
  DASHBOARD: {
    LAYOUT: 'dashboard-layout',
    WIDGETS: 'dashboard-widgets'
  },
  SCANNER: {
    SETTINGS: 'scanner-settings',
    RECENT_SCANS: 'recent-scans'
  },
  FORM_DRAFTS: {
    STUDENT: 'student-form-draft',
    BUS: 'bus-form-draft'
  }
} as const;

// Storage interface
interface StorageManager {
  get<T>(key: string, defaultValue?: T): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  exists(key: string): boolean;
  getSize(): number;
  getAllKeys(): string[];
}

// Local Storage Manager
class LocalStorageManager implements StorageManager {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue || null;
      
      // Try to parse as JSON, fall back to string
      try {
        return JSON.parse(item);
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading from localStorage for key "${key}":`, error);
      return defaultValue || null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
      // Handle quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanup();
        try {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (retryError) {
          console.error('Failed to save even after cleanup:', retryError);
        }
      }
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing from localStorage for key "${key}":`, error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }

  exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  getSize(): number {
    let size = 0;
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage.getItem(key)?.length || 0;
        }
      }
    } catch (error) {
      console.warn('Error calculating localStorage size:', error);
    }
    return size;
  }

  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.warn('Error getting localStorage keys:', error);
      return [];
    }
  }

  // Clean up old or unnecessary data
  private cleanup(): void {
    const keysToCleanup = [
      'recent-searches',
      'recent-scans',
      'student-form-draft',
      'bus-form-draft'
    ];

    keysToCleanup.forEach(key => {
      this.remove(key);
    });
  }
}

// Session Storage Manager
class SessionStorageManager implements StorageManager {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) return defaultValue || null;
      
      try {
        return JSON.parse(item);
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading from sessionStorage for key "${key}":`, error);
      return defaultValue || null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      sessionStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Error writing to sessionStorage for key "${key}":`, error);
    }
  }

  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing from sessionStorage for key "${key}":`, error);
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Error clearing sessionStorage:', error);
    }
  }

  exists(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  }

  getSize(): number {
    let size = 0;
    try {
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          size += sessionStorage.getItem(key)?.length || 0;
        }
      }
    } catch (error) {
      console.warn('Error calculating sessionStorage size:', error);
    }
    return size;
  }

  getAllKeys(): string[] {
    try {
      return Object.keys(sessionStorage);
    } catch (error) {
      console.warn('Error getting sessionStorage keys:', error);
      return [];
    }
  }
}

// Storage instances
export const localStorage = new LocalStorageManager();
export const sessionStorage = new SessionStorageManager();

// High-level storage utilities
export const auth = {
  getToken: (): string | null => {
    return localStorage.get(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  setToken: (token: string): void => {
    localStorage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  
  getUser: (): any | null => {
    return localStorage.get(STORAGE_KEYS.AUTH_USER);
  },
  
  setUser: (user: any): void => {
    localStorage.set(STORAGE_KEYS.AUTH_USER, user);
  },
  
  clearAuth: (): void => {
    localStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.remove(STORAGE_KEYS.AUTH_USER);
  },
  
  isAuthenticated: (): boolean => {
    return localStorage.exists(STORAGE_KEYS.AUTH_TOKEN) && localStorage.exists(STORAGE_KEYS.AUTH_USER);
  }
};

export const preferences = {
  get: (): any => {
    return localStorage.get(STORAGE_KEYS.PREFERENCES, {});
  },
  
  set: (prefs: any): void => {
    const current = preferences.get();
    localStorage.set(STORAGE_KEYS.PREFERENCES, { ...current, ...prefs });
  },
  
  getValue: (key: string, defaultValue?: any): any => {
    const prefs = preferences.get();
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
  },
  
  setValue: (key: string, value: any): void => {
    const current = preferences.get();
    current[key] = value;
    localStorage.set(STORAGE_KEYS.PREFERENCES, current);
  }
};

export const filters = {
  getStudentFilters: (): any => {
    return localStorage.get(STORAGE_KEYS.FILTERS.STUDENTS, {
      search: '',
      grade: '',
      class: '',
      status: 'all',
      service: 'all',
      paymentStatus: 'all'
    });
  },
  
  setStudentFilters: (filters: any): void => {
    localStorage.set(STORAGE_KEYS.FILTERS.STUDENTS, filters);
  },
  
  getBusFilters: (): any => {
    return localStorage.get(STORAGE_KEYS.FILTERS.BUSES, {
      search: '',
      status: 'all',
      route: ''
    });
  },
  
  setBusFilters: (filters: any): void => {
    localStorage.set(STORAGE_KEYS.FILTERS.BUSES, filters);
  }
};

export const recentSearches = {
  get: (maxItems: number = 10): string[] => {
    return localStorage.get(STORAGE_KEYS.RECENT_SEARCHES, []).slice(0, maxItems);
  },
  
  add: (searchTerm: string, maxItems: number = 10): void => {
    if (!searchTerm.trim()) return;
    
    const searches = recentSearches.get(maxItems);
    const filtered = searches.filter(term => term !== searchTerm);
    const updated = [searchTerm, ...filtered].slice(0, maxItems);
    
    localStorage.set(STORAGE_KEYS.RECENT_SEARCHES, updated);
  },
  
  remove: (searchTerm: string): void => {
    const searches = recentSearches.get();
    const filtered = searches.filter(term => term !== searchTerm);
    localStorage.set(STORAGE_KEYS.RECENT_SEARCHES, filtered);
  },
  
  clear: (): void => {
    localStorage.remove(STORAGE_KEYS.RECENT_SEARCHES);
  }
};

export const formDrafts = {
  saveStudentDraft: (data: any): void => {
    localStorage.set(STORAGE_KEYS.FORM_DRAFTS.STUDENT, {
      data,
      timestamp: Date.now()
    });
  },
  
  getStudentDraft: (): any | null => {
    const draft = localStorage.get(STORAGE_KEYS.FORM_DRAFTS.STUDENT);
    
    // Check if draft is older than 24 hours
    if (draft && draft.timestamp) {
      const hoursSinceCreation = (Date.now() - draft.timestamp) / (1000 * 60 * 60);
      if (hoursSinceCreation > 24) {
        localStorage.remove(STORAGE_KEYS.FORM_DRAFTS.STUDENT);
        return null;
      }
    }
    
    return draft?.data || null;
  },
  
  clearStudentDraft: (): void => {
    localStorage.remove(STORAGE_KEYS.FORM_DRAFTS.STUDENT);
  },
  
  saveBusDraft: (data: any): void => {
    localStorage.set(STORAGE_KEYS.FORM_DRAFTS.BUS, {
      data,
      timestamp: Date.now()
    });
  },
  
  getBusDraft: (): any | null => {
    const draft = localStorage.get(STORAGE_KEYS.FORM_DRAFTS.BUS);
    
    // Check if draft is older than 24 hours
    if (draft && draft.timestamp) {
      const hoursSinceCreation = (Date.now() - draft.timestamp) / (1000 * 60 * 60);
      if (hoursSinceCreation > 24) {
        localStorage.remove(STORAGE_KEYS.FORM_DRAFTS.BUS);
        return null;
      }
    }
    
    return draft?.data || null;
  },
  
  clearBusDraft: (): void => {
    localStorage.remove(STORAGE_KEYS.FORM_DRAFTS.BUS);
  }
};

export const scannerSettings = {
  get: (): any => {
    return localStorage.get(STORAGE_KEYS.SCANNER.SETTINGS, {
      soundEnabled: true,
      vibrationEnabled: true,
      autoFocus: true,
      torchEnabled: false,
      scanDelay: 1000
    });
  },
  
  set: (settings: any): void => {
    const current = scannerSettings.get();
    localStorage.set(STORAGE_KEYS.SCANNER.SETTINGS, { ...current, ...settings });
  }
};

export const recentScans = {
  get: (maxItems: number = 50): any[] => {
    return localStorage.get(STORAGE_KEYS.SCANNER.RECENT_SCANS, []).slice(0, maxItems);
  },
  
  add: (scanResult: any, maxItems: number = 50): void => {
    const scans = recentScans.get(maxItems);
    const updated = [
      {
        ...scanResult,
        timestamp: Date.now()
      },
      ...scans
    ].slice(0, maxItems);
    
    localStorage.set(STORAGE_KEYS.SCANNER.RECENT_SCANS, updated);
  },
  
  clear: (): void => {
    localStorage.remove(STORAGE_KEYS.SCANNER.RECENT_SCANS);
  }
};

// Utility functions
export const getStorageInfo = () => {
  return {
    localStorage: {
      size: localStorage.getSize(),
      keys: localStorage.getAllKeys().length,
      available: isStorageAvailable('localStorage')
    },
    sessionStorage: {
      size: sessionStorage.getSize(),
      keys: sessionStorage.getAllKeys().length,
      available: isStorageAvailable('sessionStorage')
    }
  };
};

export const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  try {
    const storage = window[type];
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

export const clearAllAppData = (): void => {
  // Clear specific app data but preserve user preferences
  const keysToPreserve = [
    STORAGE_KEYS.THEME,
    STORAGE_KEYS.LANGUAGE,
    STORAGE_KEYS.PREFERENCES
  ];
  
  const allKeys = localStorage.getAllKeys();
  allKeys.forEach(key => {
    if (!keysToPreserve.includes(key)) {
      localStorage.remove(key);
    }
  });
  
  sessionStorage.clear();
};

// Export default storage object
export default {
  localStorage,
  sessionStorage,
  auth,
  preferences,
  filters,
  recentSearches,
  formDrafts,
  scannerSettings,
  recentScans,
  getStorageInfo,
  isStorageAvailable,
  clearAllAppData,
  STORAGE_KEYS
};
