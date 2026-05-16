import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { FiHome, FiMap, FiClipboard, FiList, FiBook } from 'react-icons/fi';

const NAV_ITEMS = [
  { label: 'Início',       icon: <FiHome size={20} />,      path: '/' },
  { label: 'Propriedades', icon: <FiMap size={20} />,       path: '/propriedades' },
  { label: 'Avaliar',      icon: <FiClipboard size={20} />, path: '/avaliacao/nova' },
  { label: 'Histórico',    icon: <FiList size={20} />,      path: '/historico' },
  { label: 'Metodologia',  icon: <FiBook size={20} />,      path: '/metodologia' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = NAV_ITEMS.findIndex((item) =>
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
        onChange={(_, idx) => navigate(NAV_ITEMS[idx].path)}
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
        {NAV_ITEMS.map((item) => (
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
