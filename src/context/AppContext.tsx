import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type ContentItem, feedItems, libraryItems } from '../data/mock';
import { apiFetch } from '../lib/api';
import { normalizePost, unwrapList } from '../lib/normalize';

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);

  useEffect(() => {
    fetchFeed().then((posts) => {
      if (posts.length > 0) setFeed(posts);
    });
    fetchLibrary().then((items) => {
      if (items.length > 0) setLibrary(items);
    });
  }, []);

  const setSelectedItem = useCallback((item: ContentItem | null) => {
    setSelectedItemState(item);
    setContextPanelOpen(!!item);
  }, []);

  const addItem = useCallback((item: ContentItem) => {
    if (item.visibility === 'public') {
      setFeed(prev => [item, ...prev]);
    }
    setLibrary(prev => [item, ...prev]);
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
      feed, library, addItem,
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
