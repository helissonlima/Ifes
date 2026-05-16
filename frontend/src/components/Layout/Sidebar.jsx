import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Box, Typography, Tooltip,
} from '@mui/material';
import { FiHome, FiMap, FiClipboard, FiBarChart2, FiBook, FiList } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: <FiHome size={20} />, path: '/' },
  { label: 'Propriedades', icon: <FiMap size={20} />, path: '/propriedades' },
  { label: 'Nova Avaliação', icon: <FiClipboard size={20} />, path: '/avaliacao/nova' },
  { label: 'Histórico', icon: <FiList size={20} />, path: '/historico' },
  { label: 'Metodologia', icon: <FiBook size={20} />, path: '/metodologia' },
];

function SidebarContent({ onClose, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo area */}
      <Box
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
          display: 'flex', alignItems: 'center', gap: 1.5,
          minHeight: 64,
        }}
      >
        <MdOutlineEco size={32} color="#fff" />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
            SustentaCafé
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.75)" sx={{ lineHeight: 1 }}>
            Sustentabilidade Rural
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ px: 1, pt: 1, flexGrow: 1 }}>
        {MENU_ITEMS.map((item) => {
          const active = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Tooltip key={item.path} title="" placement="right">
              <ListItemButton
                onClick={() => handleNav(item.path)}
                selected={active}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': { color: 'white' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: active ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { style: { fontWeight: active ? 700 : 500, fontSize: '0.9rem' } } }}
                />
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled">
          ISA-EPAMIG · INCAPER
        </Typography>
        <br />
        <Typography variant="caption" color="text.disabled">
          Caparaó · Minas Gerais / ES
        </Typography>
      </Box>
    </Box>
  );
}

export default function Sidebar({ open, onClose, width, isMobile }) {
  return isMobile ? (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width, boxSizing: 'border-box' } }}
    >
      <SidebarContent onClose={onClose} isMobile={true} />
    </Drawer>
  ) : (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0,0,0,0.08)',
          top: 64,
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <SidebarContent onClose={onClose} isMobile={false} />
    </Drawer>
  );
}
