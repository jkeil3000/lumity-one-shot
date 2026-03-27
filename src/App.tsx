import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import NavRail from './components/NavRail';
import ContextPanel from './components/ContextPanel';
import CaptureSheet from './components/CaptureSheet';
import NotificationsPanel from './components/NotificationsPanel';
import MessagesPanel from './components/MessagesPanel';
import ThemeSwitcher from './components/ThemeSwitcher';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Stream from './pages/Stream';
import Mind from './pages/Mind';
import Self from './pages/Self';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <div className="flex h-screen bg-surface-0 overflow-hidden relative">
            <NavRail />
            <NotificationsPanel />
            <MessagesPanel />
            <main className="flex-1 min-w-0 overflow-hidden bg-surface-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/stream" element={<Stream />} />
                <Route path="/mind" element={<Mind />} />
                <Route path="/self" element={<Self />} />
              </Routes>
            </main>
            <ContextPanel />
            <CaptureSheet />
            <ThemeSwitcher />
          </div>
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
