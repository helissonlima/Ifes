import { AppBar, Toolbar, IconButton, Typography, Box, Chip } from '@mui/material';
import { FiMenu } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';

export default function Navbar({ onMenuClick }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
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

        <Chip
          label="v1.0"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
        />
      </Toolbar>
    </AppBar>
  );
}
