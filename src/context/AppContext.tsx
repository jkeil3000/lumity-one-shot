import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type ContentItem, feedItems, libraryItems } from '../data/mock';

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
