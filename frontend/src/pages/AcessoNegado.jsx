import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShield } from 'react-icons/fi';

const MENSAGENS = {
  permission: {
    titulo: 'Acesso não autorizado',
    descricao: 'Seu perfil não tem permissão para abrir esta área. Se isso estiver incorreto, solicite ajuste de acesso ao administrador.',
  },
  admin: {
    titulo: 'Área administrativa restrita',
    descricao: 'Esta tela é exclusiva para administradores do sistema. Volte para uma área operacional permitida ao seu perfil.',
  },
};

export default function AcessoNegado() {
  const navigate = useNavigate();
  const location = useLocation();
  const motivo = location.state?.reason || 'permission';
  const mensagem = MENSAGENS[motivo] || MENSAGENS.permission;

  return (
    <Box sx={{ minHeight: '100%', display: 'grid', placeItems: 'center', py: 4 }}>
      <Card sx={{ maxWidth: 560, width: '100%' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: 'warning.50', color: 'warning.dark' }}>
              <FiShield size={24} />
            </Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              {mensagem.titulo}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {mensagem.descricao}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
              <Button variant="contained" onClick={() => navigate('/')}>Ir para o início</Button>
              <Button variant="outlined" startIcon={<FiArrowLeft />} onClick={() => navigate(-1)}>
                Voltar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}