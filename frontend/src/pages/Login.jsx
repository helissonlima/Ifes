import { useState } from 'react';
import { friendlyError } from '../utils/errorMessages';
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
      notify(friendlyError(err), 'error');
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
        backgroundImage: `linear-gradient(rgba(9, 30, 14, 0.42), rgba(9, 30, 14, 0.34)), radial-gradient(circle at top, rgba(76,175,80,0.22), transparent 34%), url(${loginBg})`,
        backgroundSize: 'cover, auto, cover',
        backgroundPosition: 'center, center, center',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            maxWidth: 420,
            mx: 'auto',
            borderRadius: 2.5,
            overflow: 'hidden',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(15, 23, 42, 0.12)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Card elevation={0} sx={{ bgcolor: 'transparent', border: 'none', boxShadow: 'none' }}>
            <CardContent
              sx={{
                px: { xs: 3, sm: 4 },
                py: { xs: 3.5, sm: 4 },
              }}
            >
              <Stack spacing={1.25} sx={{ alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: '#1B4D24',
                    width: 48,
                    height: 48,
                    boxShadow: '0 2px 8px rgba(27, 77, 36, 0.25)',
                  }}
                >
                  <MdOutlineEco size={24} />
                </Avatar>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    textAlign: 'center',
                    color: '#0F172A',
                    letterSpacing: '-0.025em',
                  }}
                >
                  SustentaCafé
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748B',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                  }}
                >
                  Instrumento digital de avaliação do ICSR · IFES
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
                    variant="outlined"
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
                    variant="outlined"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 0.5 }}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Em caso de falha de acesso, confirme sua conexão e as permissões do seu perfil.
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
}
