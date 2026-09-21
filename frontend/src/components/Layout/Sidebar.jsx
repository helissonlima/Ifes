import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Box, Typography,
} from '@mui/material';
import { FiHome, FiMap, FiClipboard, FiBook, FiList, FiUsers, FiHelpCircle, FiShield } from 'react-icons/fi';
import { MdGrain } from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import { useGeolocation } from '../../hooks/useGeolocation';

const MENU_SECTIONS = [
  {
    title: 'Operação de Campo',
    items: [
      { label: 'Visão Geral', icon: <FiHome size={18} />, path: '/', permission: 'dashboard' },
      { label: 'Propriedades', icon: <FiMap size={18} />, path: '/propriedades', permission: 'propriedades' },
      { label: 'Nova Avaliação', icon: <FiClipboard size={18} />, path: '/avaliacao/nova', permission: 'avaliacoes' },
      { label: 'Histórico', icon: <FiList size={18} />, path: '/historico', permission: 'historico' },
    ],
  },
  {
    title: 'Metodologia & Referência',
    items: [
      { label: 'Metodologia ICSR', icon: <FiBook size={18} />, path: '/metodologia', permission: 'metodologia' },
      { label: 'Guia de Aplicação', icon: <FiHelpCircle size={18} />, path: '/guia', permission: 'metodologia' },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Gestão de Usuários', icon: <FiShield size={18} />, path: '/usuarios', adminOnly: true },
      { label: 'Catálogo de Grãos', icon: <MdGrain size={18} />, path: '/graos', adminOnly: true },
    ],
  },
];

function SidebarContent({ onClose, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, user } = useApp();
  const { localidade } = useGeolocation();

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#FFFFFF' }}>
      <Box sx={{ px: 2, pt: 2, pb: 1, flexGrow: 1, overflowY: 'auto' }}>
        {MENU_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.adminOnly ? user?.role === 'admin' : hasPermission(item.permission)
          );

          if (visibleItems.length === 0) return null;

          return (
            <Box key={section.title} sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  mb: 0.75,
                  display: 'block',
                  color: '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {section.title}
              </Typography>
              <List disablePadding>
                {visibleItems.map((item) => {
                  const active =
                    location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <ListItemButton
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      selected={active}
                      sx={{
                        borderRadius: 1.5,
                        mb: 0.4,
                        py: 0.9,
                        px: 1.5,
                        transition: 'all 150ms ease',
                        position: 'relative',
                        color: active ? '#1B4D24' : '#475569',
                        bgcolor: active ? 'rgba(27, 77, 36, 0.08)' : 'transparent',
                        '&:hover': {
                          bgcolor: active ? 'rgba(27, 77, 36, 0.12)' : 'rgba(15, 23, 42, 0.04)',
                          color: active ? '#143B1B' : '#0F172A',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(27, 77, 36, 0.08)',
                          '&:hover': {
                            bgcolor: 'rgba(27, 77, 36, 0.12)',
                          },
                        },
                      }}
                    >
                      {active && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: '18%',
                            bottom: '18%',
                            width: 3,
                            borderRadius: '0 3px 3px 0',
                            bgcolor: '#1B4D24',
                          }}
                        />
                      )}
                      <ListItemIcon
                        sx={{
                          minWidth: 32,
                          color: active ? '#1B4D24' : '#64748B',
                          transition: 'color 150ms ease',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            style: {
                              fontWeight: active ? 700 : 500,
                              fontSize: '0.85rem',
                              letterSpacing: active ? '-0.01em' : 'normal',
                            },
                          },
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ borderColor: 'rgba(15, 23, 42, 0.06)' }} />

      <Box sx={{ p: 2, bgcolor: '#FAFCFA' }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 700,
            color: '#1B4D24',
            fontSize: '0.72rem',
            lineHeight: 1.2,
          }}
        >
          IFES · Campus Itapina
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: '#64748B',
            fontSize: '0.68rem',
            mt: 0.25,
            lineHeight: 1.2,
          }}
        >
          ICSR Caparaó (MG × ES)
        </Typography>
        {localidade && (
          <Box
            sx={{
              mt: 1,
              px: 1,
              py: 0.4,
              borderRadius: 1,
              bgcolor: 'rgba(27, 77, 36, 0.06)',
              border: '1px solid rgba(27, 77, 36, 0.1)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.66rem',
                color: '#1B4D24',
                fontWeight: 600,
                display: 'block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              📍 {localidade}
            </Typography>
          </Box>
        )}
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
        transition: 'width 180ms ease-out',
        overflow: 'hidden',
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
