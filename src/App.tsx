import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import NavRail from './components/NavRail';
import ContextPanel from './components/ContextPanel';
import CaptureSheet from './components/CaptureSheet';
import NotificationsPanel from './components/NotificationsPanel';
import MessagesPanel from './components/MessagesPanel';
import Home from './pages/Home';
import Stream from './pages/Stream';
import Mind from './pages/Mind';
import Self from './pages/Self';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="flex h-screen bg-surface-0 overflow-hidden relative">
          <NavRail />
          <NotificationsPanel />
          <MessagesPanel />
          <main className="flex-1 min-w-0 overflow-hidden bg-surface-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stream" element={<Stream />} />
              <Route path="/mind" element={<Mind />} />
              <Route path="/self" element={<Self />} />
            </Routes>
          </main>
          <ContextPanel />
          <CaptureSheet />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
