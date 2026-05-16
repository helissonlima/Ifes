import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Button } from '@mui/material';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { useApp } from '../../context/AppContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useApp();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)',
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 64, sm: 64 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          size="large"
          sx={{ display: { xs: 'none', md: 'inline-flex' } }}
        >
          <FiMenu />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <MdOutlineEco size={24} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.1, display: { xs: 'none', sm: 'block' } }}>
              SustentaCafé
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85, display: { xs: 'none', sm: 'block' }, lineHeight: 1 }}>
              ISA-EPAMIG / INCAPER
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ display: { xs: 'block', sm: 'none' } }}>
            SustentaCafé
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.2 } }}>
          <Avatar
            src={user?.foto_url || ''}
            alt={user?.nome || 'Usuario'}
            sx={{ width: 34, height: 34, border: '2px solid rgba(255,255,255,0.6)' }}
          >
            {user?.nome?.[0] || 'U'}
          </Avatar>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.1 }}>
              {user?.nome || 'Tecnico'}
            </Typography>
          </Box>
          <Button
            onClick={logout}
            color="inherit"
            size="small"
            startIcon={<FiLogOut size={14} />}
            sx={{
              minWidth: 0,
              px: { xs: 1, sm: 1.2 },
              borderColor: 'rgba(255,255,255,0.35)',
              '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.8 } },
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
