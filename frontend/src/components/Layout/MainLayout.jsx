import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import SystemStatusBanner from './SystemStatusBanner';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useGlobalKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const DRAWER_WIDTH = 260;

export default function MainLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileMenuOpen((v) => !v);
    } else {
      setSidebarOpen((v) => !v);
    }
  };

  useGlobalKeyboardShortcuts({
    onNewEvaluation: () => navigate('/avaliacao/nova'),
    onGoHistory: () => navigate('/historico'),
    onGoHome: () => navigate('/'),
    onGoProperties: () => navigate('/propriedades'),
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
      <Navbar onMenuClick={handleMenuClick} isMobile={isMobile} />

      <div className="flex flex-1 pt-15">
        {/* Sidebar no Desktop ou Gaveta no Mobile */}
        <Sidebar
          open={isMobile ? mobileMenuOpen : sidebarOpen}
          onClose={() => setMobileMenuOpen(false)}
          width={DRAWER_WIDTH}
          isMobile={isMobile}
        />

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-x-hidden px-4 sm:px-6 md:px-8 py-6 pb-20 md:pb-12">
          <div className="mx-auto max-w-7xl">
            <SystemStatusBanner />
            <Outlet />
          </div>
        </main>
      </div>

      {isMobile && <BottomNav />}
    </div>
  );
}
