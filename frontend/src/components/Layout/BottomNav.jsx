import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { FiHome, FiMap, FiClipboard, FiList, FiBook, FiShield } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { label: 'Início',       icon: <FiHome size={20} />,      path: '/', permission: 'dashboard' },
  { label: 'Propriedades', icon: <FiMap size={20} />,       path: '/propriedades', permission: 'propriedades' },
  { label: 'Avaliar',      icon: <FiClipboard size={20} />, path: '/avaliacao/nova', permission: 'avaliacoes' },
  { label: 'Histórico',    icon: <FiList size={20} />,      path: '/historico', permission: 'historico' },
  { label: 'Metodologia',  icon: <FiBook size={20} />,      path: '/metodologia', permission: 'metodologia' },
  { label: 'Admin',        icon: <FiShield size={20} />,    path: '/usuarios', adminOnly: true },
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
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }}
      elevation={8}
    >
      <BottomNavigation
        value={activeIndex === -1 ? false : activeIndex}
        onChange={(_, idx) => navigate(visibleItems[idx].path)}
        sx={{
          bgcolor: 'white',
          borderTop: '1px solid',
          borderColor: 'divider',
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            color: 'text.secondary',
            '&.Mui-selected': { color: 'primary.main' },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            fontWeight: 600,
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
