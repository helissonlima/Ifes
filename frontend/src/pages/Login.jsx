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
        background: 'radial-gradient(circle at top, rgba(76,175,80,0.18), transparent 34%), linear-gradient(180deg, #f6fbf2 0%, #edf5e8 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            maxWidth: 430,
            mx: 'auto',
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'rgba(27,94,32,0.12)',
            boxShadow: '0 18px 36px rgba(27, 94, 32, 0.08)',
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
                  Instrumento digital do ICSR para avaliação técnica em campo.
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
