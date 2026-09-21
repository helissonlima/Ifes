import { FiChevronDown, FiInfo } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import PageHeaderCard from '../components/Common/PageHeaderCard';
import { COR_CLASSIFICACAO } from '../utils/coresICSR';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Progress from '../components/ui/Progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';

const DIMENSOES = [
  {
    nome: 'Econômica',
    cor: '#2196F3',
    peso: 30,
    descricao: 'Avalia a viabilidade financeira, produtividade, diversidade de renda e planejamento econômico da propriedade.',
    indicadores: ['Produtividade', 'Eficiência de Comercialização', 'Diversidade de Renda', 'Custo de Produção', 'Evolução Patrimonial', 'Qualidade do Café', 'Planejamento Financeiro'],
  },
  {
    nome: 'Ambiental',
    cor: '#4CAF50',
    peso: 35,
    descricao: 'Analisa as práticas de conservação, manejo ambiental e conformidade legal da propriedade rural.',
    indicadores: ['Conservação do Solo', 'Manejo da Água', 'APP e Reserva Legal', 'Gestão de Resíduos', 'Uso Racional de Defensivos', 'Manejo Integrado de Pragas', 'Irrigação Eficiente', 'Proteção de Nascentes', 'Cobertura Vegetal'],
  },
  {
    nome: 'Social',
    cor: '#FF9800',
    peso: 20,
    descricao: 'Verifica as condições de trabalho, qualidade de vida, capacitação e organização social dos agricultores.',
    indicadores: ['Capacitação Técnica', 'Segurança do Trabalho', 'Sucessão Familiar', 'Qualidade de Vida', 'Organização Produtiva', 'Infraestrutura Sanitária', 'Assistência Técnica'],
  },
  {
    nome: 'Gestão, Qualidade e Governança',
    cor: '#9C27B0',
    peso: 15,
    descricao: 'Avalia rastreabilidade, gestão operacional, certificações, conformidade e governança (transparência, due diligence de cadeia e participação de stakeholders). Inclui indicadores de compliance com CSDDD/UE, GRI e Pacto Global ONU.',
    indicadores: ['Rastreabilidade', 'Pós-Colheita', 'Armazenamento', 'Planejamento Produtivo', 'Registros Técnicos', 'Conformidade Ambiental', 'Certificações', 'Transparência e Due Diligence', 'Participação de Stakeholders'],
  },
];

const ESCALA = [
  { faixa: '0,00 – 0,20', classificacao: 'Muito Baixa', descricao: 'Situação crítica — intervenção urgente necessária' },
  { faixa: '0,20 – 0,40', classificacao: 'Baixa', descricao: 'Sustentabilidade comprometida — ações corretivas necessárias' },
  { faixa: '0,40 – 0,60', classificacao: 'Moderada', descricao: 'Em transição — práticas sustentáveis em implantação' },
  { faixa: '0,60 – 0,80', classificacao: 'Boa', descricao: 'Bom desempenho sustentável — manter e aprimorar' },
  { faixa: '0,80 – 1,00', classificacao: 'Alta', descricao: 'Excelência em sustentabilidade — referência regional' },
].map((e) => ({ ...e, cor: COR_CLASSIFICACAO[e.classificacao] }));

export default function Metodologia() {
  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Metodologia"
        subtitle="Análise comparativa referência metodológica regional — Sistema Integrado de Sustentabilidade Rural"
      />

      {/* Apresentação */}
      <div className="rounded-xl bg-[#143519] border border-white/10 p-6 text-white shadow-xs">
        <div className="flex gap-4 items-start">
          <div className="w-11 h-11 rounded-lg bg-white/10 text-emerald-300 flex items-center justify-center shrink-0">
            <MdOutlineEco size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Sistema Integrado de Avaliação de Sustentabilidade
            </h2>
            <p className="mt-1.5 text-sm text-white/85 leading-relaxed">
              Proposta baseada na análise comparativa entre a <strong className="font-semibold text-white">metodologia de referência</strong> (Minas Gerais)
              e a <strong className="font-semibold text-white">instituição regional</strong> (Espírito Santo).
              Combina a robustez metodológica quantitativa com a aplicabilidade prática e o foco
              na cafeicultura sustentável do Caparaó.
            </p>
          </div>
        </div>
      </div>

      {/* Instrumentos base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-t-4 border-t-[#1565C0]">
          <CardContent className="p-5">
            <h3 className="text-base font-bold text-[#1565C0]">ISA – EPAMIG</h3>
            <p className="text-xs text-slate-500 mt-0.5">Minas Gerais · Índice de Sustentabilidade em Agroecossistemas</p>
            <div className="my-3 border-t border-slate-100" />
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Abordagem ampla e multidimensional. Forte uso de ponderações, indicadores compostos e análise quantitativa.
              Ênfase na evolução patrimonial, análise histórica e sustentabilidade sistêmica.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Quantitativa', 'Multiculturas', 'Patrimonial', 'Alta precisão'].map((t) => (
                <Badge key={t} size="sm" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#2E7D32]">
          <CardContent className="p-5">
            <h3 className="text-base font-bold text-[#2E7D32]">Instituição Regional</h3>
            <p className="text-xs text-slate-500 mt-0.5">Espírito Santo · Sistema de Indicadores da Cafeicultura Sustentável</p>
            <div className="my-3 border-t border-slate-100" />
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Enfoque setorial voltado à cafeicultura. Avaliação qualitativa com escalas ordinais, forte aderência
              às Boas Práticas Agrícolas (BPA) e alta aplicabilidade extensionista.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Qualitativa', 'Cafeicultura', 'BPA', 'Extensionista'].map((t) => (
                <Badge key={t} size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fórmula IGS */}
      <Card>
        <CardHeader>
          <CardTitle>Fórmula do ICSR — Versão Revisada com Médias Ponderadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center">
            <p className="text-lg md:text-xl font-black text-emerald-950 font-mono tracking-tight">
              ICSR = (IA × 0,35) + (IE × 0,30) + (IS × 0,20) + (IGQG × 0,15)
            </p>
            <p className="text-xs text-slate-600 mt-1.5">
              Cada subíndice é calculado por média ponderada dos seus indicadores internos.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DIMENSOES.map((d) => (
              <div
                key={d.nome}
                className="text-center p-3 rounded-xl border"
                style={{
                  backgroundColor: `${d.cor}10`,
                  borderColor: `${d.cor}33`,
                }}
              >
                <div className="text-2xl font-black" style={{ color: d.cor }}>
                  {d.peso}%
                </div>
                <div className="text-xs font-bold mt-0.5" style={{ color: d.cor }}>
                  {d.nome}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escala de classificação */}
      <Card>
        <CardHeader>
          <CardTitle>Escala de Classificação</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#143519] hover:bg-[#143519]">
                  <TableHead className="text-white font-bold">Faixa do IGS</TableHead>
                  <TableHead className="text-white font-bold">Classificação</TableHead>
                  <TableHead className="text-white font-bold">Descrição</TableHead>
                  <TableHead className="text-white font-bold">Nível</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ESCALA.map((e, idx) => (
                  <TableRow key={e.classificacao} className="hover:bg-slate-50/80">
                    <TableCell className="font-mono font-bold text-slate-800">{e.faixa}</TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold text-white shadow-2xs"
                        style={{ backgroundColor: e.cor }}
                      >
                        {e.classificacao}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-700">{e.descricao}</TableCell>
                    <TableCell className="w-28">
                      <Progress
                        value={Math.min(idx * 25 + 15, 100)}
                        indicatorColor={e.cor}
                        className="h-2 bg-slate-100"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dimensões - Accordions */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">Dimensões e Indicadores</h3>
        <div className="space-y-3">
          {DIMENSOES.map((d) => (
            <details
              key={d.nome}
              className="group rounded-xl border bg-white shadow-2xs overflow-hidden transition-all duration-200"
              style={{ borderColor: `${d.cor}55` }}
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: d.cor }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{d.nome}</h4>
                    <p className="text-xs text-slate-500">
                      {d.indicadores.length} indicadores · peso {d.peso}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: d.cor }}
                  >
                    {d.peso}%
                  </span>
                  <FiChevronDown
                    className="text-slate-400 group-open:rotate-180 transition-transform duration-200"
                    size={18}
                  />
                </div>
              </summary>

              <div className="p-4 pt-2 border-t border-slate-100 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">{d.descricao}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {d.indicadores.map((ind) => (
                    <div
                      key={ind}
                      className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-slate-800"
                      style={{ backgroundColor: `${d.cor}12` }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: d.cor }}
                      />
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Escala de notas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiInfo className="text-slate-500" size={18} />
            Escala Padronizada de Notas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <p className="text-xs text-slate-600">
            Cada indicador é avaliado em uma escala padronizada de 0 a 1 com cinco níveis de desempenho:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
            {[
              { nota: '0,00', desc: 'Condição inexistente ou inadequada', cor: '#dc2626' },
              { nota: '0,25', desc: 'Baixo desempenho', cor: '#f97316' },
              { nota: '0,50', desc: 'Desempenho moderado', cor: '#eab308' },
              { nota: '0,75', desc: 'Bom desempenho', cor: '#84cc16' },
              { nota: '1,00', desc: 'Excelente desempenho', cor: '#16a34a' },
            ].map((n) => (
              <div
                key={n.nota}
                className="p-3 rounded-xl border text-center"
                style={{
                  backgroundColor: `${n.cor}10`,
                  borderColor: `${n.cor}33`,
                }}
              >
                <div className="text-xl font-black font-mono" style={{ color: n.cor }}>
                  {n.nota}
                </div>
                <div className="text-[11px] text-slate-600 mt-1 leading-tight">{n.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Referência Rápida */}
      <Card>
        <CardHeader>
          <CardTitle>Tabela de Referência Rápida — Critérios de Pontuação</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <p className="text-xs text-slate-600">
            Exemplos de critérios por dimensão para apoiar a calibração da nota em campo.
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-[#143519] hover:bg-[#143519]">
                  {['Nota', 'Interpretação Geral', 'Ambiental', 'Econômica', 'Social', 'Gestão & Qualidade'].map((h) => (
                    <TableHead key={h} className="text-white font-bold">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    nota: '0,00', cor: '#dc2626',
                    geral: 'Inexistente ou inadequado',
                    amb: 'Erosão visível, solo exposto, sem práticas',
                    eco: 'Prejuízo, produtividade < 50% da média',
                    soc: 'Condições precárias, sem capacitação',
                    gq: 'Sem registros, irregular',
                  },
                  {
                    nota: '0,25', cor: '#f97316',
                    geral: 'Baixo desempenho',
                    amb: 'Práticas insuficientes (<50%)',
                    eco: 'Margem baixa, controle informal',
                    soc: 'Infraestrutura limitada',
                    gq: 'Registros incompletos',
                  },
                  {
                    nota: '0,50', cor: '#eab308',
                    geral: 'Desempenho moderado',
                    amb: 'Conservação parcial (~50%)',
                    eco: 'Equilíbrio financeiro, média regional',
                    soc: 'Condições razoáveis, capacitação periódica',
                    gq: 'Planejamento parcial',
                  },
                  {
                    nota: '0,75', cor: '#84cc16',
                    geral: 'Bom desempenho',
                    amb: 'Boas práticas (>60%), monitoramento',
                    eco: 'Boa relação custo-benefício, diversificação',
                    soc: 'Boa qualidade de vida, envolvimento ativo',
                    gq: 'Sistema organizado, planejamento anual',
                  },
                  {
                    nota: '1,00', cor: '#16a34a',
                    geral: 'Excelente desempenho',
                    amb: '3+ práticas integradas, excelência',
                    eco: 'Alta eficiência, mercado premium',
                    soc: 'Sucessão estruturada, excelente QV',
                    gq: 'Digital + certificações múltiplas',
                  },
                ].map((r) => (
                  <TableRow key={r.nota} className="hover:bg-slate-50/80">
                    <TableCell>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold text-white font-mono shadow-2xs"
                        style={{ backgroundColor: r.cor }}
                      >
                        {r.nota}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-slate-900">{r.geral}</TableCell>
                    <TableCell className="text-xs text-slate-700">{r.amb}</TableCell>
                    <TableCell className="text-xs text-slate-700">{r.eco}</TableCell>
                    <TableCell className="text-xs text-slate-700">{r.soc}</TableCell>
                    <TableCell className="text-xs text-slate-700">{r.gq}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
            <h5 className="text-xs font-bold text-amber-900 tracking-tight mb-1.5">
              Notas importantes sobre pontuação
            </h5>
            <ul className="list-disc pl-4 space-y-1 text-xs text-amber-900/90 leading-relaxed">
              <li>Valores intermediários (ex: 0,35; 0,60; 0,85) são permitidos quando o desempenho está entre dois critérios.</li>
              <li>Sempre registre a justificativa para notas extremas (&lt; 0,25 ou &gt; 0,75) no campo de observação.</li>
              <li>Em caso de dúvida entre duas notas, opte pela mais conservadora (menor valor).</li>
              <li>A nota 0,50 representa o padrão mínimo aceitável para sustentabilidade moderada.</li>
              <li>Reavalie anualmente — o ICSR é sensível às mudanças de curto e médio prazo.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
