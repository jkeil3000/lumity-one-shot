import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { type ActivityEvent, type ContentItem, activityEventsSeed, feedItems, libraryItems } from '../data/mock';
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
      feed, library, addItem,
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
