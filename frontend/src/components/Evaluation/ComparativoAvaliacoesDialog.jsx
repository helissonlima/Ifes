import { useEffect, useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { avaliacoesAPI } from '../../services/api';
import { friendlyError } from '../../utils/errorMessages';
import { formatarDataCurta } from '../../utils/formatarData';
import IGSBadge from '../Common/IGSBadge';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Skeleton from '../ui/Skeleton';
import Badge from '../ui/Badge';

function DeltaChip({ valor, sufixoPercentual = true }) {
  if (valor === null || valor === undefined) return <span className="text-xs text-slate-400">—</span>;
  const positivo = valor > 0;
  const neutro = valor === 0;
  const corClass = neutro ? 'text-slate-500' : positivo ? 'text-emerald-700' : 'text-rose-700';
  const Icone = neutro ? FiMinus : positivo ? FiTrendingUp : FiTrendingDown;
  const texto = sufixoPercentual ? `${positivo ? '+' : ''}${(valor * 100).toFixed(1)}%` : `${positivo ? '+' : ''}${valor}`;
  return (
    <span className={`inline-flex items-center gap-1 font-bold text-xs ${corClass}`}>
      <Icone size={13} />
      <span>{texto}</span>
    </span>
  );
}

export default function ComparativoAvaliacoesDialog({ open, onClose, idA, idB }) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const buscar = () => {
    if (!idA || !idB) return;
    setCarregando(true);
    setErro('');
    avaliacoesAPI.comparar(idA, idB)
      .then((r) => setDados(r.data))
      .catch((e) => setErro(friendlyError(e)))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    if (open) buscar();
  }, [open, idA, idB]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Comparativo entre avaliações"
      className="max-w-2xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="space-y-4 py-1">
        {carregando && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        )}

        {!carregando && erro && (
          <Alert
            variant="error"
            action={
              <Button variant="secondary" size="sm" onClick={buscar}>
                Tentar novamente
              </Button>
            }
          >
            {erro}
          </Alert>
        )}

        {!carregando && !erro && dados && (
          <div className="space-y-4">
            {/* Cabeçalho: as duas avaliações lado a lado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[dados.a, dados.b].map((av, i) => (
                <div key={av.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Avaliação {i === 0 ? 'A' : 'B'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{av.propriedade_nome}</h4>
                  <p className="text-xs text-slate-500 mb-2">
                    {formatarDataCurta(av.data)} · {av.tecnico || 'Técnico não informado'}
                  </p>
                  <IGSBadge classificacao={av.classificacao} igs={av.igs} size="small" />
                </div>
              ))}
            </div>

            {/* IGS geral */}
            <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-100/70 py-2 text-xs font-semibold text-slate-700">
              <span>Variação do ICSR:</span>
              <DeltaChip valor={dados.delta_igs} />
            </div>

            {/* Por dimensão */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Por dimensão
              </h4>
              <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-3">
                {dados.dimensoes.map((d) => (
                  <div key={d.codigo} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.cor }} />
                      <span className="truncate font-medium text-slate-800">{d.nome}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-slate-500 tabular-nums">
                        {(d.a * 100).toFixed(0)}% → {(d.b * 100).toFixed(0)}%
                      </span>
                      <DeltaChip valor={d.delta} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo de indicadores */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="success">
                {dados.resumo.melhoraram} melhoraram
              </Badge>
              <Badge variant="danger">
                {dados.resumo.pioraram} pioraram
              </Badge>
              <Badge variant="outline">
                {dados.resumo.estaveis} estáveis
              </Badge>
            </div>

            {/* Tabela de Indicadores */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Indicador</th>
                    <th className="py-2.5 px-3 text-center w-12">A</th>
                    <th className="py-2.5 px-3 text-center w-12">B</th>
                    <th className="py-2.5 px-3 text-right w-20">Variação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dados.indicadores.map((ind) => (
                    <tr key={ind.codigo} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-800">{ind.indicador_nome}</p>
                        <p className="text-xs text-slate-400">{ind.dimensao_nome}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{ind.nota_a ?? '—'}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{ind.nota_b ?? '—'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <DeltaChip valor={ind.delta} sufixoPercentual={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
