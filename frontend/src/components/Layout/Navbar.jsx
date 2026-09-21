import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Button, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiLogOut, FiUploadCloud } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import { useRascunhoPendente } from '../../hooks/useRascunhoPendente';

export default function Navbar({ onMenuClick, isMobile }) {
  const { user, logout, isOnline } = useApp();
  const navigate = useNavigate();
  const rascunhoPendente = useRascunhoPendente();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: '#122A16',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 58, sm: 62 }, px: { xs: 2, sm: 3 } }}>
        {!isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            size="medium"
            aria-label="Alternar navegação lateral"
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.08)' },
            }}
          >
            <FiMenu size={20} />
          </IconButton>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            flexGrow: 1,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'rgba(76, 175, 80, 0.16)',
              color: '#81C784',
            }}
          >
            <MdOutlineEco size={20} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                fontSize: { xs: '1rem', sm: '1.05rem' },
              }}
            >
              SustentaCafé
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.65)',
                display: { xs: 'none', sm: 'block' },
                fontSize: '0.68rem',
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}
            >
              Sistema de Avaliação ICSR · IFES
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {rascunhoPendente && (
            <Tooltip title="Você possui uma avaliação em rascunho com dados pendentes de sincronização. Toque para retomar.">
              <Button
                onClick={() => navigate('/avaliacao/nova')}
                aria-label="1 avaliação pendente de sincronização — clique para continuar"
                size="small"
                startIcon={<FiUploadCloud size={14} />}
                variant="outlined"
                sx={{
                  minWidth: 0,
                  color: '#FEF08A',
                  borderColor: 'rgba(254, 240, 138, 0.35)',
                  bgcolor: 'rgba(254, 240, 138, 0.08)',
                  px: { xs: 1, sm: 1.25 },
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(254, 240, 138, 0.16)',
                    borderColor: 'rgba(254, 240, 138, 0.6)',
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  1 pendente
                </Box>
              </Button>
            </Tooltip>
          )}

          {/* Indicador de Conexão */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 0.8,
              px: 1.2,
              py: 0.4,
              borderRadius: 999,
              bgcolor: isOnline ? 'rgba(46, 125, 50, 0.2)' : 'rgba(234, 88, 12, 0.2)',
              border: `1px solid ${isOnline ? 'rgba(74, 222, 128, 0.25)' : 'rgba(251, 146, 60, 0.3)'}`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: isOnline ? '#4ADE80' : '#FB923C',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: isOnline ? '#DCFCE7' : '#FFEDD5',
                fontSize: '0.72rem',
                letterSpacing: '0.01em',
              }}
            >
              {isOnline ? 'Online' : 'Sem rede'}
            </Typography>
          </Box>

          {/* Usuário logado */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={user?.foto_url || ''}
              alt={user?.nome || 'Usuário'}
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.85rem',
                fontWeight: 700,
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {user?.nome?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.95)',
                  lineHeight: 1.1,
                  fontSize: '0.82rem',
                }}
              >
                {user?.nome || 'Técnico'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: 1,
                  fontSize: '0.68rem',
                  display: 'block',
                }}
              >
                {user?.role === 'admin' ? 'Administrador' : 'Extensão Rural'}
              </Typography>
            </Box>
          </Box>

          {/* Botão Sair */}
          <Button
            onClick={logout}
            color="inherit"
            size="small"
            startIcon={<FiLogOut size={13} />}
            sx={{
              minWidth: 0,
              px: { xs: 1, sm: 1.25 },
              py: 0.5,
              fontSize: '0.78rem',
              color: 'rgba(255, 255, 255, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                color: '#FFFFFF',
              },
            }}
            variant="outlined"
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Sair
            </Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
