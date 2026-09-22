import { FiInfo } from 'react-icons/fi';
import IndicadorCard from './IndicadorCard';
import { calcularIndiceDimensao } from '../../utils/metodologia';
import { corTextoDimensao } from '../../utils/coresICSR';
import Alert from '../ui/Alert';
import Tooltip from '../ui/Tooltip';

export default function DimensaoStep({ dimensao, respostas, observacoes, onChange, onObservacaoChange }) {
  const total = dimensao.indicadores.length;
  const respondidos = dimensao.indicadores.filter((ind) => respostas[ind.codigo] !== undefined).length;
  const progresso = (respondidos / total) * 100;
  const media = calcularIndiceDimensao(dimensao.indicadores, respostas);

  return (
    <div className="space-y-6">
      {/* Cabeçalho da dimensão */}
      <div
        className="rounded-xl p-5 border transition-all"
        style={{
          borderColor: `${dimensao.cor}44`,
          backgroundColor: `${dimensao.cor}0A`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              {/* A cor da dimensão identifica; quem carrega o texto é o
                  contraste do slate. */}
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: dimensao.cor }}
                aria-hidden="true"
              />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {dimensao.nome}
              </h2>
              <Tooltip content="Atribua notas de 0,00 a 1,00 para cada indicador conforme os critérios descritivos. Valores intermediários são permitidos. Registre justificativa na observação para notas extremas.">
                <button
                  type="button"
                  aria-label="Como avaliar os indicadores desta dimensão"
                  className="rounded-md p-1 text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700"
                >
                  <FiInfo size={16} />
                </button>
              </Tooltip>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Peso no ICSR: {Math.round(dimensao.peso * 100)}% · {total} indicadores · média ponderada
            </p>
          </div>

          <div className="text-right">
            <span
              className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold"
              style={{
                backgroundColor: `${dimensao.cor}1A`,
                color: corTextoDimensao(dimensao.codigo),
              }}
            >
              {respondidos}/{total}
            </span>
            {media !== null && (
              <span className="block mt-1 text-xs font-semibold text-slate-600 tabular-nums">
                Índice parcial: {(media * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progresso}%`,
              backgroundColor: dimensao.cor,
            }}
          />
        </div>
      </div>

      {respondidos < total && (
        <Alert variant="info">
          Avalie todos os {total} indicadores para calcular o índice desta dimensão.
        </Alert>
      )}

      {/* Lista de indicadores */}
      <div className="space-y-4">
        {dimensao.indicadores.map((ind) => (
          <IndicadorCard
            key={ind.codigo}
            indicador={ind}
            nota={respostas[ind.codigo]}
            observacao={observacoes?.[ind.codigo]}
            onChange={(nota) => onChange(ind.codigo, nota, ind.nome, ind.criterios.find(c => c.nota === nota)?.descricao)}
            onObservacaoChange={(texto) => onObservacaoChange?.(ind.codigo, texto)}
            corDimensao={dimensao.cor}
          />
        ))}
      </div>
    </div>
  );
}
