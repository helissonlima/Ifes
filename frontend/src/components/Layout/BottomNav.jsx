import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { FiHome, FiMap, FiClipboard, FiList } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { label: 'Início',       icon: <FiHome size={20} />,      path: '/', permission: 'dashboard' },
  { label: 'Propriedades', icon: <FiMap size={20} />,       path: '/propriedades', permission: 'propriedades' },
  { label: 'Avaliar',      icon: <FiClipboard size={20} />, path: '/avaliacao/nova', permission: 'avaliacoes' },
  { label: 'Histórico',    icon: <FiList size={20} />,      path: '/historico', permission: 'historico' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, user } = useApp();
  const visibleItems = NAV_ITEMS.filter((item) => (
    item.adminOnly ? user?.role === 'admin' : hasPermission(item.permission)
  ));

  const activeIndex = visibleItems.findIndex((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path)
  );

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderRadius: 0,
        bgcolor: '#FFFFFF',
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.04)',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={activeIndex === -1 ? false : activeIndex}
        onChange={(_, idx) => navigate(visibleItems[idx].path)}
        sx={{
          bgcolor: 'transparent',
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            px: 0.5,
            py: 0.75,
            color: '#64748B',
            transition: 'color 150ms ease',
            '&.Mui-selected': {
              color: '#1B4D24',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 700,
                color: '#1B4D24',
              },
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.72rem',
            fontWeight: 500,
            mt: 0.25,
          },
        }}
      >
        {visibleItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            showLabel
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
