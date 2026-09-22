/**
 * Cabeçalho de página: título, subtítulo e ações.
 *
 * Não é um card. Antes era uma caixa branca com borda e sombra só para
 * emoldurar o título — no celular, somada ao banner de status, empurrava o
 * conteúdo real (a lista, a tabela) para fora da primeira tela.
 */
export default function PageHeaderCard({
  title,
  subtitle,
  icon,
  titleAdornment,
  actions,
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-slate-200 pb-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          {icon && (
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-caparao-50 text-caparao-700">
              {icon}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {titleAdornment}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
