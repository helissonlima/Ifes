import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome, FiMap, FiClipboard, FiList, FiMoreHorizontal,
  FiBook, FiHelpCircle, FiShield,
} from 'react-icons/fi';
import { MdGrain } from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';
import Dialog from '../ui/Dialog';

const NAV_ITEMS = [
  { label: 'Início', icon: <FiHome size={20} />, path: '/', permission: 'dashboard' },
  { label: 'Propriedades', icon: <FiMap size={20} />, path: '/propriedades', permission: 'propriedades' },
  { label: 'Avaliar', icon: <FiClipboard size={20} />, path: '/avaliacao/nova', permission: 'avaliacoes' },
  { label: 'Histórico', icon: <FiList size={20} />, path: '/historico', permission: 'historico' },
];

// Telas que não cabem na barra: sem isto, no celular não havia caminho
// nenhum até metodologia, guia, usuários e grãos.
const ITENS_EXTRAS = [
  { label: 'Metodologia ICSR', descricao: 'Pesos, fórmula e escala de classificação', icon: <FiBook size={18} />, path: '/metodologia', permission: 'metodologia' },
  { label: 'Guia de Aplicação', descricao: 'Passo a passo da visita técnica', icon: <FiHelpCircle size={18} />, path: '/guia', permission: 'metodologia' },
  { label: 'Gestão de Usuários', descricao: 'Papéis e permissões de acesso', icon: <FiShield size={18} />, path: '/usuarios', adminOnly: true },
  { label: 'Catálogo de Grãos', descricao: 'Culturas disponíveis para as propriedades', icon: <MdGrain size={18} />, path: '/graos', adminOnly: true },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, user } = useApp();
  const [maisAberto, setMaisAberto] = useState(false);

  const podeVer = (item) => (item.adminOnly ? user?.role === 'admin' : hasPermission(item.permission));
  const visibleItems = NAV_ITEMS.filter(podeVer);
  const extrasVisiveis = ITENS_EXTRAS.filter(podeVer);

  const estaAtivo = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
  const algumExtraAtivo = extrasVisiveis.some((i) => estaAtivo(i.path));

  const irPara = (path) => {
    setMaisAberto(false);
    navigate(path);
  };

  return (
    <>
      <nav
        aria-label="Navegação móvel"
        className="no-print fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.04)] md:hidden"
      >
        {visibleItems.map((item) => {
          const active = estaAtivo(item.path);
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => irPara(item.path)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-inset rounded-lg',
                active ? 'text-caparao-700' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <span className={cn('transition-transform duration-150', active && 'scale-110')}>
                {item.icon}
              </span>
              <span className={cn('mt-1 text-xs leading-none', active ? 'font-bold text-caparao-800' : 'font-medium')}>
                {item.label}
              </span>
            </button>
          );
        })}

        {extrasVisiveis.length > 0 && (
          <button
            type="button"
            onClick={() => setMaisAberto(true)}
            aria-haspopup="dialog"
            className={cn(
              'flex flex-1 flex-col items-center justify-center py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-inset rounded-lg',
              algumExtraAtivo ? 'text-caparao-700' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <FiMoreHorizontal size={20} />
            <span className={cn('mt-1 text-xs leading-none', algumExtraAtivo ? 'font-bold text-caparao-800' : 'font-medium')}>
              Mais
            </span>
          </button>
        )}
      </nav>

      <Dialog
        open={maisAberto}
        onOpenChange={setMaisAberto}
        title="Mais"
        description="Metodologia, referência e administração"
        className="sm:max-w-sm"
      >
        <ul className="divide-y divide-slate-100">
          {extrasVisiveis.map((item) => {
            const active = estaAtivo(item.path);
            return (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => irPara(item.path)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700',
                    active ? 'bg-caparao-50 text-caparao-800' : 'hover:bg-slate-50'
                  )}
                >
                  <span className={cn('shrink-0', active ? 'text-caparao-700' : 'text-slate-500')}>
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                    <span className="block text-xs text-slate-500">{item.descricao}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Dialog>
    </>
  );
}
