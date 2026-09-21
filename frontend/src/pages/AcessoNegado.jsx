import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

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
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center">
            <FiShield size={26} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {mensagem.titulo}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {mensagem.descricao}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Ir para o início
            </Button>
            <Button
              variant="outline"
              startIcon={<FiArrowLeft size={16} />}
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}