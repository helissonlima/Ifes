import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Box, Typography, Tooltip,
} from '@mui/material';
import { FiHome, FiMap, FiClipboard, FiBook, FiList, FiUsers, FiHelpCircle } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

const MENU_ITEMS = [
  { label: 'Dashboard', icon: <FiHome size={20} />, path: '/', permission: 'dashboard' },
  { label: 'Propriedades', icon: <FiMap size={20} />, path: '/propriedades', permission: 'propriedades' },
  { label: 'Nova Avaliação', icon: <FiClipboard size={20} />, path: '/avaliacao/nova', permission: 'avaliacoes' },
  { label: 'Histórico', icon: <FiList size={20} />, path: '/historico', permission: 'historico' },
  { label: 'Metodologia', icon: <FiBook size={20} />, path: '/metodologia', permission: 'metodologia' },
  { label: 'Guia de Aplicação', icon: <FiHelpCircle size={20} />, path: '/guia', permission: 'metodologia' },
  { label: 'Usuários', icon: <FiUsers size={20} />, path: '/usuarios', permission: 'usuarios' },
];

function SidebarContent({ onClose, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useApp();
  const visibleItems = MENU_ITEMS.filter((item) => hasPermission(item.permission));

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <List sx={{ px: 1, pt: 1, flexGrow: 1 }}>
        {visibleItems.map((item) => {
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
