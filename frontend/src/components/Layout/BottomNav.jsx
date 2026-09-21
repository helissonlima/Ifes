import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiMap, FiClipboard, FiList } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';

const NAV_ITEMS = [
  { label: 'Início', icon: <FiHome size={20} />, path: '/', permission: 'dashboard' },
  { label: 'Propriedades', icon: <FiMap size={20} />, path: '/propriedades', permission: 'propriedades' },
  { label: 'Avaliar', icon: <FiClipboard size={20} />, path: '/avaliacao/nova', permission: 'avaliacoes' },
  { label: 'Histórico', icon: <FiList size={20} />, path: '/historico', permission: 'historico' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, user } = useApp();

  const visibleItems = NAV_ITEMS.filter((item) => (
    item.adminOnly ? user?.role === 'admin' : hasPermission(item.permission)
  ));

  return (
    <nav
      aria-label="Navegação móvel"
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.04)] md:hidden"
    >
      {visibleItems.map((item) => {
        const active =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center py-1.5 transition-colors focus:outline-hidden',
              active ? 'text-caparao-700' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <span className={cn('transition-transform duration-150', active && 'scale-110')}>
              {item.icon}
            </span>
            <span
              className={cn(
                'mt-1 text-[11px] leading-none',
                active ? 'font-bold text-caparao-800' : 'font-medium'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
