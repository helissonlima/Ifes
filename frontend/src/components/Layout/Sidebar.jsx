import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiMap, FiClipboard, FiBook, FiList, FiShield, FiHelpCircle, FiX } from 'react-icons/fi';
import { MdGrain } from 'react-icons/md';
import { useApp } from '../../context/AppContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { cn } from '../../utils/cn';

const MENU_SECTIONS = [
  {
    title: 'Operação de Campo',
    items: [
      { label: 'Visão Geral', icon: <FiHome size={18} />, path: '/', permission: 'dashboard' },
      { label: 'Propriedades', icon: <FiMap size={18} />, path: '/propriedades', permission: 'propriedades' },
      { label: 'Nova Avaliação', icon: <FiClipboard size={18} />, path: '/avaliacao/nova', permission: 'avaliacoes' },
      { label: 'Histórico', icon: <FiList size={18} />, path: '/historico', permission: 'historico' },
    ],
  },
  {
    title: 'Metodologia & Referência',
    items: [
      { label: 'Metodologia ICSR', icon: <FiBook size={18} />, path: '/metodologia', permission: 'metodologia' },
      { label: 'Guia de Aplicação', icon: <FiHelpCircle size={18} />, path: '/guia', permission: 'metodologia' },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Gestão de Usuários', icon: <FiShield size={18} />, path: '/usuarios', adminOnly: true },
      { label: 'Catálogo de Grãos', icon: <MdGrain size={18} />, path: '/graos', adminOnly: true },
    ],
  },
];

function SidebarContent({ onClose, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, user } = useApp();
  const { localidade } = useGeolocation();

  const handleNav = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  return (
    <div className="flex h-full flex-col justify-between bg-white text-slate-800">
      {/* Lista de Navegação */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {isMobile && (
          <div className="mb-4 flex items-center justify-between px-2 pb-2 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-800">Navegação</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Fechar menu"
            >
              <FiX size={20} />
            </button>
          </div>
        )}

        {MENU_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.adminOnly ? user?.role === 'admin' : hasPermission(item.permission)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-5">
              <span className="block px-3 mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </span>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const active =
                    location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path));

                  return (
                    <li key={item.path}>
                      <button
                        type="button"
                        onClick={() => handleNav(item.path)}
                        className={cn(
                          'relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-left',
                          active
                            ? 'bg-caparao-50 text-caparao-800 font-semibold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-sm bg-caparao-700" />
                        )}
                        <span className={cn('shrink-0 transition-colors', active ? 'text-caparao-700' : 'text-slate-400')}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Rodapé da Barra Lateral */}
      <div className="border-t border-slate-100 bg-slate-50/70 p-4">
        <p className="text-xs font-bold text-caparao-800 leading-tight">
          IFES · Campus Itapina
        </p>
        <p className="mt-0.5 text-xs text-slate-500 leading-tight">
          ICSR Caparaó (MG × ES)
        </p>
        {localidade && (
          <div className="mt-2.5 rounded-md border border-caparao-200/60 bg-caparao-50/50 px-2.5 py-1 text-xs font-medium text-caparao-800 truncate">
            📍 {localidade}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose, width = 260, isMobile }) {
  if (isMobile) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Painel móvel */}
        <div
          className="relative flex w-64 max-w-[80vw] flex-1 flex-col bg-white shadow-2xl z-10"
          style={{ width }}
        >
          <SidebarContent onClose={onClose} isMobile={true} />
        </div>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        'sticky top-15 h-[calc(100vh-3.75rem)] shrink-0 border-r border-slate-200/80 bg-white transition-all duration-200 ease-in-out z-30',
        open ? 'w-65' : 'w-0 overflow-hidden border-none'
      )}
    >
      <div className="h-full w-65">
        <SidebarContent onClose={onClose} isMobile={false} />
      </div>
    </aside>
  );
}
