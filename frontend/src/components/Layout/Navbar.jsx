import { useNavigate } from 'react-router-dom';
import { FiMenu, FiLogOut, FiUploadCloud } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import { useRascunhoPendente } from '../../hooks/useRascunhoPendente';
import Tooltip from '../ui/Tooltip';

export default function Navbar({ onMenuClick, isMobile }) {
  const { user, logout, isOnline } = useApp();
  const navigate = useNavigate();
  const rascunhoPendente = useRascunhoPendente();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#122A16] text-white border-b border-white/10 shadow-xs">
      <div className="flex h-15 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {!isMobile && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Alternar navegação lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/85 hover:bg-white/10 hover:text-white transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <FiMenu size={20} />
            </button>
          )}

          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigate('/')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <MdOutlineEco size={20} />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-white leading-tight">
                SustentaCafé
              </span>
              <span className="hidden sm:block text-[10px] text-white/60 tracking-wider leading-none">
                Sistema de Avaliação ICSR · IFES
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {rascunhoPendente && (
            <Tooltip content="Você possui uma avaliação em rascunho com dados pendentes de sincronização. Toque para retomar.">
              <button
                type="button"
                onClick={() => navigate('/avaliacao/nova')}
                aria-label="1 avaliação pendente de sincronização — clique para continuar"
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/40 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-400/20 transition-colors"
              >
                <FiUploadCloud size={14} />
                <span className="hidden sm:inline">1 pendente</span>
              </button>
            </Tooltip>
          )}

          {/* Indicador de Conexão */}
          <div
            className={`hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              isOnline
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                : 'border-amber-500/30 bg-amber-500/15 text-amber-300'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}
            />
            <span className="text-[11px] font-semibold">
              {isOnline ? 'Online' : 'Sem rede'}
            </span>
          </div>

          {/* Usuário logado */}
          <div className="flex items-center gap-2">
            {user?.foto_url ? (
              <img
                src={user.foto_url}
                alt={user.nome || 'Usuário'}
                className="h-8 w-8 rounded-full border border-white/20 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white">
                {user?.nome?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white/95 leading-tight">
                {user?.nome || 'Técnico'}
              </p>
              <p className="text-[10px] text-white/60 leading-tight">
                {user?.role === 'admin' ? 'Administrador' : 'Extensão Rural'}
              </p>
            </div>
          </div>

          {/* Botão Sair */}
          <button
            type="button"
            onClick={logout}
            aria-label="Sair da conta"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-2.5 py-1 text-xs font-medium text-white/85 hover:bg-white/10 hover:text-white transition-colors"
          >
            <FiLogOut size={13} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
