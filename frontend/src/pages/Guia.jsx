import {
  FiCalendar, FiUser, FiSearch, FiEdit3, FiMessageCircle, FiInfo, FiClock,
  FiCheckCircle, FiAlertTriangle,
} from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';
import PageHeaderCard from '../components/Common/PageHeaderCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';

const ETAPAS = [
  {
    titulo: 'Preparação',
    cor: '#1565C0',
    icon: FiCalendar,
    tempo: '30 minutos (escritório)',
    itens: [
      'Agende a visita com o produtor com antecedência mínima de 3 dias.',
      'Solicite documentação prévia: CAR, notas fiscais, registros de colheita, certificados.',
      'Prepare equipamentos: câmera, GPS, planilha impressa (backup), questionário.',
      'Consulte médias regionais de produtividade (CONAB/EMATER) antes da visita.',
    ],
  },
  {
    titulo: 'Entrevista Inicial',
    cor: '#2E7D32',
    icon: FiUser,
    tempo: '1-2 horas',
    itens: [
      'Preencha os dados da propriedade na etapa “Informações” da Nova Avaliação.',
      'Explique o objetivo da avaliação e obtenha consentimento do produtor.',
      'Colete documentos e registros disponíveis (mínimo 30 minutos).',
    ],
  },
  {
    titulo: 'Inspeção de Campo',
    cor: '#EF6C00',
    icon: FiSearch,
    tempo: '2-3 horas',
    itens: [
      'Percorra toda a propriedade: áreas produtivas, nascentes, APPs, armazenamento, moradia.',
      'Documente com fotografias: erosão, práticas conservacionistas, estruturas.',
      'Verifique evidências objetivas para cada indicador (campo “Evidência Esperada”).',
      'Entreviste trabalhadores (se houver) sobre segurança e condições.',
    ],
  },
  {
    titulo: 'Pontuação',
    cor: '#6A1B9A',
    icon: FiEdit3,
    tempo: '1 hora',
    itens: [
      'Para cada indicador, atribua nota de 0,00 a 1,00 conforme os critérios descritivos.',
      'Use 0,25 / 0,50 / 0,75 ou valores intermediários quando o desempenho estiver entre dois níveis.',
      'Registre a justificativa de notas extremas (0,00 ou 1,00) no campo de observação.',
      'O sistema calcula automaticamente os subíndices e o ICSR final.',
    ],
  },
  {
    titulo: 'Feedback',
    cor: '#00695C',
    icon: FiMessageCircle,
    tempo: '30-45 minutos',
    itens: [
      'Apresente os resultados ao produtor de forma didática usando a classificação por cores.',
      'Identifique 2-3 pontos fortes e 2-3 pontos de melhoria prioritários.',
      'Registre compromissos do produtor e próximos passos.',
      'Agende visita de acompanhamento (recomendado: 12 meses).',
    ],
  },
];

const TEMPO_TOTAL = [
  ['Preparação', '30 minutos (escritório)'],
  ['Entrevista inicial', '1-2 horas'],
  ['Inspeção de campo', '2-3 horas'],
  ['Pontuação e tabulação', '1 hora'],
  ['Feedback ao produtor', '30-45 minutos'],
  ['Total', '4-6 horas (pode ser dividido em 2 visitas)'],
];

const DICAS = [
  'Não altere as fórmulas do sistema: apenas preencha as notas dos indicadores.',
  'Em caso de dúvida entre duas notas, opte sempre pela mais conservadora (a menor).',
  'Documente todas as evidências com fotos para auditoria futura.',
  'As médias regionais de produtividade devem ser atualizadas anualmente.',
  'O instrumento é sensível à subjetividade do avaliador — o treinamento é essencial.',
  'As notas devem refletir a realidade atual da propriedade, não potencialidades futuras.',
];

export default function Guia() {
  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Guia de Aplicação"
        subtitle="Passo a passo para aplicar o ICSR em uma propriedade rural — adaptado da metodologia referência regional."
      />

      {/* Apresentação */}
      <div className="rounded-xl border border-caparao-200 bg-caparao-50 p-6 shadow-xs">
        <div className="flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-white text-caparao-700 shrink-0 border border-caparao-200">
            <MdOutlineEco size={36} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Como aplicar o ICSR em campo
            </h2>
            <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
              A avaliação completa leva entre <strong className="text-slate-900 font-semibold">4 e 6 horas</strong> e pode ser dividida em duas visitas.
              Siga as cinco etapas abaixo para garantir uma avaliação consistente, transparente e útil
              ao produtor.
            </p>
          </div>
        </div>
      </div>

      {/* Etapas */}
      <Card>
        <CardHeader>
          <CardTitle>Etapas da Aplicação</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-3 md:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {ETAPAS.map((e, i) => {
              const IconComp = e.icon;
              return (
                <div key={e.titulo} className="relative">
                  {/* Marcador de etapa */}
                  <div
                    className="absolute -left-6 md:-left-8 top-0 w-6 h-6 md:w-8 md:h-8 rounded-full text-white font-bold text-xs md:text-sm flex items-center justify-center shadow-xs ring-4 ring-white"
                    style={{ backgroundColor: e.cor }}
                  >
                    {i + 1}
                  </div>

                  {/* Conteúdo da etapa */}
                  <div className="pl-3 md:pl-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <IconComp size={18} style={{ color: e.cor }} />
                        <h4 className="text-sm md:text-base font-bold" style={{ color: e.cor }}>
                          {e.titulo}
                        </h4>
                      </div>
                      <Badge
                        size="sm"
                        className="font-bold flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${e.cor}15`,
                          color: e.cor,
                          borderColor: `${e.cor}30`,
                        }}
                      >
                        <FiClock size={12} />
                        {e.tempo}
                      </Badge>
                    </div>

                    <ul className="space-y-1.5">
                      {e.itens.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs md:text-sm text-slate-700">
                          <FiCheckCircle
                            size={14}
                            className="mt-1 shrink-0"
                            style={{ color: e.cor }}
                          />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Grid: Tempo e Materiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tempo total */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Tempo Estimado</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-1">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Duração</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TEMPO_TOTAL.map(([etapa, tempo], i) => {
                    const isTotal = i === TEMPO_TOTAL.length - 1;
                    return (
                      <TableRow
                        key={etapa}
                        className={isTotal ? 'bg-emerald-50/70 hover:bg-emerald-50' : 'hover:bg-slate-50/80'}
                      >
                        <TableCell className={isTotal ? 'font-bold text-emerald-950' : 'font-medium text-slate-800'}>
                          {etapa}
                        </TableCell>
                        <TableCell className={isTotal ? 'font-bold text-emerald-950' : 'font-medium text-slate-700'}>
                          {tempo}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Materiais */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Materiais Necessários</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col justify-between space-y-4">
            <ul className="space-y-2">
              {[
                'Questionário padronizado (este sistema)',
                'Câmera fotográfica',
                'GPS ou aplicativo de georreferenciamento',
                'Tabela de médias regionais (produtividade, preços)',
                'Planilha impressa como backup',
                'Documentação do produtor: CAR, notas fiscais, certificados',
              ].map((m) => (
                <li key={m} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700">
                  <FiCheckCircle size={15} className="mt-0.5 text-caparao-700 shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-slate-100 space-y-1">
              <p className="text-xs font-bold text-slate-800">
                Perfil do aplicador
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Técnico agrícola, engenheiro agrônomo ou assistente social com formação em desenvolvimento
                rural. Treinamento mínimo de 8-16 horas no instrumento ICSR.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiAlertTriangle className="text-amber-600" size={18} />
            Dicas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DICAS.map((d, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-2.5 text-xs text-amber-950 leading-relaxed"
              >
                <FiInfo className="text-amber-600 shrink-0 mt-0.5" size={15} />
                <span>{d}</span>
              </div>
            ))}
          </div>

          <Alert variant="success" className="mt-2">
            A boa aplicação do ICSR depende de evidências objetivas. Sempre fotografe, anote e documente
            as situações observadas no campo de <strong className="font-semibold">observação</strong> de cada indicador.
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
