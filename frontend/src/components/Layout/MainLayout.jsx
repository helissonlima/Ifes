import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import SystemStatusBanner from './SystemStatusBanner';
import { useGlobalKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const DRAWER_WIDTH = 260;

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();

  const toggle = () => setSidebarOpen((v) => !v);
  const close = () => setSidebarOpen(false);

  useGlobalKeyboardShortcuts({
    onNewEvaluation: () => navigate('/avaliacao/nova'),
    onGoHistory: () => navigate('/historico'),
    onGoHome: () => navigate('/'),
    onGoProperties: () => navigate('/propriedades'),
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar onMenuClick={toggle} isMobile={isMobile} />
      <Sidebar
        open={sidebarOpen}
        onClose={close}
        width={DRAWER_WIDTH}
        isMobile={isMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, sm: 9 },
          px: { xs: 2, sm: 3 },
          pb: { xs: 12, md: 4 },
          ml: { md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: 'margin-left 180ms ease-out',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <SystemStatusBanner />
        <Outlet />
      </Box>
      {isMobile && <BottomNav />}
    </Box>
  );
}
