import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Stack,
  Avatar,
  Paper,
  Container,
} from '@mui/material';
import { MdOutlineEco } from 'react-icons/md';
import { useApp } from '../context/AppContext';
import loginBg from '../assets/login-bg.png';

export default function Login() {
  const navigate = useNavigate();
  const { login, notify, isAuthenticated } = useApp();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      notify('Login realizado com sucesso!', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 2, sm: 3 },
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(2px)',
          zIndex: 0,
        },
        '& > *': {
          position: 'relative',
          zIndex: 1,
        }
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            maxWidth: 430,
            mx: 'auto',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Card elevation={0}>
            <CardContent
              sx={{
                px: { xs: 2.5, sm: 3.5 },
                py: { xs: 2.5, sm: 3 },
                maxWidth: 420,
                mx: 'auto',
              }}
            >
              <Stack spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 54, height: 54 }}>
                  <MdOutlineEco size={26} />
                </Avatar>
                <Typography variant="h5" fontWeight={800} sx={{ textAlign: 'center' }}>
                  SustentaCafé
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Acesse a plataforma com suas credenciais.
                </Typography>
              </Stack>

              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    autoComplete="email"
                    variant="filled"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    label="Senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    fullWidth
                    autoComplete="current-password"
                    variant="filled"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 0.5 }}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
}
