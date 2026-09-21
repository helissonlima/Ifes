import { Component } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from '../ui/Button';

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
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <FiAlertTriangle className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Algo deu errado
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Ocorreu um erro inesperado nesta tela. Recarregar a página costuma resolver.
              Se o problema persistir, os dados já preenchidos em avaliações ficam salvos
              localmente e não são perdidos.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Recarregar
          </Button>
        </div>
      </div>
    );
  }
}
