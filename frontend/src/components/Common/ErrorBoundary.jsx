import { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FiAlertTriangle } from 'react-icons/fi';

/**
 * Último recurso contra tela branca: captura erros de renderização não
 * tratados em qualquer parte da árvore de rotas e mostra uma tela amigável
 * em vez de deixar o React desmontar a aplicação inteira.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erro não tratado na interface:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 3 }}>
        <Box sx={{ display: 'grid', justifyItems: 'center', gap: 2, textAlign: 'center', maxWidth: 420 }}>
          <Box sx={{ color: 'error.main' }}>
            <FiAlertTriangle size={40} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
              Algo deu errado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Ocorreu um erro inesperado nesta tela. Recarregar a página costuma resolver.
              Se o problema persistir, os dados já preenchidos em avaliações ficam salvos
              localmente e não são perdidos.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        </Box>
      </Box>
    );
  }
}
