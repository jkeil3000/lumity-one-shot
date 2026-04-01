import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { type ActivityEvent, type ContentItem, type Collection, activityEventsSeed, feedItems, libraryItems, collections as defaultCollections } from '../data/mock';
import { apiFetch } from '../lib/api';
import { normalizePost, unwrapList } from '../lib/normalize';
import { calculateStreakSummary } from '../utils/streak';

type ViewMode = 'scroll' | 'scan';
type StreamLens = 'following' | 'foryou' | string; // string = interest name
type LibraryFilter = 'all' | 'saved' | 'in-progress' | 'completed' | 'favorites';

interface AppState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  streamLens: StreamLens;
  setStreamLens: (lens: StreamLens) => void;
  selectedItem: ContentItem | null;
  setSelectedItem: (item: ContentItem | null) => void;
  contextPanelOpen: boolean;
  setContextPanelOpen: (open: boolean) => void;
  captureOpen: boolean;
  setCaptureOpen: (open: boolean) => void;
  libraryFilter: LibraryFilter;
  setLibraryFilter: (filter: LibraryFilter) => void;
  libraryCollection: string | null;
  setLibraryCollection: (col: string | null) => void;
  feed: ContentItem[];
  library: ContentItem[];
  addItem: (item: ContentItem) => void;
  updateItemState: (itemId: string, newState: ContentItem['state']) => void;
  toggleFavorite: (itemId: string) => void;
  collections: Collection[];
  addCollection: (name: string, description?: string) => Collection;
  updateCollection: (id: string, updates: Partial<Pick<Collection, 'name' | 'description'>>) => void;
  deleteCollection: (id: string) => void;
  removeItem: (itemId: string) => void;
  addToCollection: (itemId: string, collectionName: string) => void;
  removeFromCollection: (itemId: string, collectionName: string) => void;
  activityEvents: ActivityEvent[];
  recordActivity: (type: ActivityEvent['type']) => void;
  streakOpen: boolean;
  setStreakOpen: (open: boolean) => void;
  restoreStreakDay: (dateKey: string) => void;
  streakSummary: ReturnType<typeof calculateStreakSummary>;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  messagesOpen: boolean;
  setMessagesOpen: (open: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

async function fetchFeed(): Promise<ContentItem[]> {
  try {
    const data = await apiFetch('/posts/community', { method: 'GET' });
    const posts = unwrapList(data);
    if (posts.length > 0) return posts.map(normalizePost);
  } catch {
    // fall through to for-you
  }
  try {
    const data = await apiFetch('/posts/for-you', { method: 'GET' });
    const posts = unwrapList(data);
    if (posts.length > 0) return posts.map(normalizePost);
  } catch {
    // fall through to foryou alias
  }
  try {
    const data = await apiFetch('/posts/foryou', { method: 'GET' });
    const posts = unwrapList(data);
    return posts.map(normalizePost);
  } catch {
    return [];
  }
}

async function fetchLibrary(): Promise<ContentItem[]> {
  try {
    const userId = window.localStorage.getItem('userId') || window.localStorage.getItem('currentUserId');
    if (!userId) return [];
    const data = await apiFetch(`/mylibrary?userId=${encodeURIComponent(userId)}&lastId=0&limit=50`, { method: 'GET' });
    const items = unwrapList(data);
    return items.flatMap((playlist) => {
      const posts = Array.isArray(playlist.posts)
        ? (playlist.posts as Record<string, unknown>[]).filter((p) => p && typeof p === 'object')
        : [];
      return posts.map(normalizePost);
    });
  } catch {
    return [];
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('scan');
  const [streamLens, setStreamLens] = useState<StreamLens>('following');
  const [selectedItem, setSelectedItemState] = useState<ContentItem | null>(null);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>('all');
  const [libraryCollection, setLibraryCollection] = useState<string | null>(null);
  const [feed, setFeed] = useState<ContentItem[]>(feedItems);
  const [library, setLibrary] = useState<ContentItem[]>(libraryItems);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(activityEventsSeed);
  const [streakOpen, setStreakOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [userCollections, setUserCollections] = useState<Collection[]>(defaultCollections);

  useEffect(() => {
    fetchFeed().then((posts) => {
      if (posts.length > 0) setFeed(posts);
    });
    fetchLibrary().then((items) => {
      if (items.length > 0) setLibrary(items);
    });
  }, []);

  const streakSummary = useMemo(() => calculateStreakSummary(activityEvents), [activityEvents]);

  const setSelectedItem = useCallback((item: ContentItem | null) => {
    setSelectedItemState(item);
    setContextPanelOpen(!!item);
    if (item) {
      setActivityEvents(prev => [
        ...prev,
        {
          id: `ae-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'open_item',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  const recordActivity = useCallback((type: ActivityEvent['type']) => {
    setActivityEvents(prev => [
      ...prev,
      {
        id: `ae-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const addItem = useCallback((item: ContentItem) => {
    if (item.visibility === 'public') {
      setFeed(prev => [item, ...prev]);
    }
    setLibrary(prev => [item, ...prev]);
    recordActivity(item.type === 'thought' ? 'create_thought' : item.visibility === 'public' ? 'share_item' : 'save_item');
  }, [recordActivity]);

  const updateItemState = useCallback((itemId: string, newState: ContentItem['state']) => {
    setLibrary(prev => prev.map(item =>
      item.id === itemId ? { ...item, state: newState } : item
    ));
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    setLibrary(prev => prev.map(item =>
      item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  }, []);

  const addCollection = useCallback((name: string, description?: string): Collection => {
    const col: Collection = { id: `col-${Date.now()}`, name, count: 0, visibility: 'private', description };
    setUserCollections(prev => [...prev, col]);
    return col;
  }, []);

  const updateCollection = useCallback((id: string, updates: Partial<Pick<Collection, 'name' | 'description'>>) => {
    setUserCollections(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...updates };
      // If name changed, update all library items that reference the old name
      if (updates.name && updates.name !== c.name) {
        setLibrary(lib => lib.map(item =>
          item.collections.includes(c.name)
            ? { ...item, collections: item.collections.map(col => col === c.name ? updates.name! : col) }
            : item
        ));
      }
      return updated;
    }));
  }, []);

  const deleteCollection = useCallback((id: string) => {
    const col = userCollections.find(c => c.id === id);
    if (col) {
      // Remove collection reference from all library items
      setLibrary(prev => prev.map(item => ({
        ...item,
        collections: item.collections.filter(c => c !== col.name),
      })));
    }
    setUserCollections(prev => prev.filter(c => c.id !== id));
  }, [userCollections]);

  const removeItem = useCallback((itemId: string) => {
    setLibrary(prev => prev.filter(item => item.id !== itemId));
    setFeed(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const addToCollection = useCallback((itemId: string, collectionName: string) => {
    setLibrary(prev => prev.map(item =>
      item.id === itemId && !item.collections.includes(collectionName)
        ? { ...item, collections: [...item.collections, collectionName] }
        : item
    ));
  }, []);

  const removeFromCollection = useCallback((itemId: string, collectionName: string) => {
    setLibrary(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, collections: item.collections.filter(c => c !== collectionName) }
        : item
    ));
  }, []);

  const restoreStreakDay = useCallback((dateKey: string) => {
    setActivityEvents(prev => {
      if (prev.some(event => event.effectiveDateKey === dateKey && event.type === 'grace_restore')) {
        return prev;
      }

      return [
        ...prev,
        {
          id: `ae-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'grace_restore',
          timestamp: new Date().toISOString(),
          effectiveDateKey: dateKey,
        },
      ];
    });
  }, []);

  return (
    <AppContext.Provider value={{
      viewMode, setViewMode,
      streamLens, setStreamLens,
      selectedItem, setSelectedItem,
      contextPanelOpen, setContextPanelOpen,
      captureOpen, setCaptureOpen,
      libraryFilter, setLibraryFilter,
      libraryCollection, setLibraryCollection,
      feed, library, addItem, updateItemState, toggleFavorite,
      collections: userCollections, addCollection, updateCollection, deleteCollection, removeItem, addToCollection, removeFromCollection,
      activityEvents, recordActivity,
      streakOpen, setStreakOpen, restoreStreakDay, streakSummary,
      notificationsOpen, setNotificationsOpen,
      messagesOpen, setMessagesOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
