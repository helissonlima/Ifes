import Button from '../ui/Button';

/**
 * Componente padrão de empty state para todo o sistema.
 * Uso consistente em todas as páginas.
 */
export default function EmptyState({ icon, title, description, actionLabel, onAction, small = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center text-slate-500 ${small ? 'py-6 px-4' : 'py-12 px-6'}`}>
      {icon && (
        <div className={`mb-3 text-caparao-600 opacity-90 ${small ? 'text-3xl' : 'text-5xl'}`}>
          {icon}
        </div>
      )}
      <h3 className={`font-bold text-slate-800 ${small ? 'text-sm' : 'text-base'}`}>
        {title}
      </h3>
      {description && (
        <p className={`mt-1 max-w-sm text-sm text-slate-500 leading-relaxed ${actionLabel ? 'mb-4' : ''}`}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
