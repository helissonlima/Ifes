import { useState, useRef } from 'react';
import { FiCheckSquare, FiChevronDown, FiChevronUp, FiCheck, FiInfo, FiEdit3 } from 'react-icons/fi';
import { getDefinicao } from '../../utils/glossario';
import { COR_NOTA, COR_NOTA_TEXTO, COR_NOTA_BADGE_SELECIONADO } from '../../utils/coresICSR';
import Tooltip from '../ui/Tooltip';
import { cn } from '../../utils/cn';

const LABEL_NOTA = { 0: '0,00', 0.25: '0,25', 0.5: '0,50', 0.75: '0,75', 1: '1,00' };
const NIVEL = {
  0: 'Crítico', 0.25: 'Insuficiente', 0.5: 'Regular', 0.75: 'Bom', 1: 'Excelente',
};

export default function IndicadorCard({ indicador, nota, observacao, onChange, onObservacaoChange, corDimensao }) {
  const [obsExpanded, setObsExpanded] = useState(false);
  const glossario = getDefinicao(indicador.nome) || getDefinicao(indicador.criterio);
  const itemRefs = useRef([]);

  const moverEselecionar = (novoIndex) => {
    if (novoIndex < 0 || novoIndex >= indicador.criterios.length) return;
    const alvo = indicador.criterios[novoIndex];
    if (!alvo) return;
    onChange(alvo.nota);
    itemRefs.current[novoIndex]?.focus();
  };

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4 sm:p-5 transition-all duration-150',
        nota !== undefined ? 'shadow-xs' : 'shadow-xs border-slate-200/80'
      )}
      style={{
        borderColor: nota !== undefined ? `${COR_NOTA[nota]}66` : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0 mt-1.5"
          style={{ backgroundColor: corDimensao }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {indicador.nome}
            </h3>
            {indicador.peso !== undefined && (
              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                peso {Math.round(indicador.peso * 100)}%
              </span>
            )}
            {glossario && (
              <Tooltip content={`${glossario.termo}: ${glossario.def}`}>
                <button
                  type="button"
                  aria-label={`O que significa ${glossario.termo}`}
                  className="rounded-md p-0.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-hidden"
                >
                  <FiInfo size={14} />
                </button>
              </Tooltip>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            {indicador.criterio}
          </p>
        </div>

        {nota !== undefined && (
          <div
            className="rounded-md px-2.5 py-1 text-xs font-bold tabular-nums shrink-0 border"
            style={{
              backgroundColor: `${COR_NOTA[nota]}18`,
              color: COR_NOTA_TEXTO[nota],
              borderColor: `${COR_NOTA[nota]}40`,
            }}
          >
            {NIVEL[nota]} · {LABEL_NOTA[nota]}
          </div>
        )}
      </div>

      {/* Selectable criteria list — radiogroup acessível */}
      <div
        role="radiogroup"
        aria-label={`Nota para ${indicador.nome}`}
        className="flex flex-col gap-2"
      >
        {indicador.criterios.map((c, idx) => {
          const selected = nota === c.nota;
          const cor = COR_NOTA[c.nota];
          const podeReceberFoco = selected || (nota === undefined && idx === 0);

          return (
            <div
              key={c.nota}
              ref={(el) => { itemRefs.current[idx] = el; }}
              role="radio"
              aria-checked={selected}
              tabIndex={podeReceberFoco ? 0 : -1}
              onClick={() => onChange(c.nota)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(c.nota);
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                  e.preventDefault();
                  moverEselecionar(idx + 1);
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  moverEselecionar(idx - 1);
                }
              }}
              style={{
                borderColor: selected ? cor : undefined,
                backgroundColor: selected ? `${cor}0D` : undefined,
              }}
              className={cn(
                'flex items-start gap-3 rounded-lg p-3 text-left transition-all duration-100 cursor-pointer select-none focus:outline-hidden focus-visible:ring-2',
                selected
                  ? 'border-1.5'
                  : 'border border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300'
              )}
            >
              <div
                className="w-10 text-center px-1.5 py-0.5 rounded text-xs font-extrabold tabular-nums shrink-0 leading-normal"
                style={{
                  backgroundColor: selected ? cor : `${cor}18`,
                  color: selected ? COR_NOTA_BADGE_SELECIONADO[c.nota] : COR_NOTA_TEXTO[c.nota],
                }}
              >
                {LABEL_NOTA[c.nota]}
              </div>

              <div className="flex-1 min-w-0 text-sm leading-relaxed">
                <span className="font-bold mr-1" style={{ color: COR_NOTA_TEXTO[c.nota] }}>
                  {NIVEL[c.nota]}:
                </span>
                <span className={selected ? 'text-slate-900 font-semibold' : 'text-slate-600'}>
                  {c.descricao}
                </span>
              </div>

              <div
                className="shrink-0 transition-opacity"
                style={{
                  color: cor,
                  opacity: selected ? 1 : 0,
                }}
              >
                <FiCheck size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer com evidência esperada e botão de observação */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {indicador.evidencia_esperada && (
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-sm text-slate-600">
            <FiCheckSquare size={13} className="shrink-0 text-caparao-700" />
            <span>Evidência: {indicador.evidencia_esperada}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setObsExpanded((v) => !v)}
          className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-hidden"
        >
          {obsExpanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
          <span>{observacao ? 'Editar observação' : 'Observação'}</span>
        </button>
      </div>

      {/* Campo expansível de observação */}
      {obsExpanded && (
        <div className="mt-2.5 relative">
          <textarea
            rows={2}
            value={observacao || ''}
            onChange={(e) => onObservacaoChange?.(e.target.value)}
            placeholder="Justificativa da nota, evidências verificadas (fotos, documentos, depoimentos)."
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-caparao-700 focus:outline-hidden focus:ring-1 focus:ring-caparao-700"
          />
        </div>
      )}
    </div>
  );
}
