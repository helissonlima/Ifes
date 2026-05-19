import {
  Box, Typography, Card, CardContent, Grid, Stepper, Step, StepLabel, StepContent,
  Paper, Chip, List, ListItem, ListItemIcon, ListItemText, Divider, Alert,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import {
  FiCalendar, FiUser, FiSearch, FiEdit3, FiMessageCircle, FiInfo, FiClock,
  FiCheckCircle, FiAlertTriangle,
} from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';

const ETAPAS = [
  {
    titulo: 'Preparação',
    cor: '#1565C0',
    icon: <FiCalendar />,
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
    icon: <FiUser />,
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
    icon: <FiSearch />,
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
    icon: <FiEdit3 />,
    tempo: '1 hora',
    itens: [
      'Para cada indicador, atribua nota de 0,00 a 1,00 conforme os critérios descritivos.',
      'Use 0,25 / 0,50 / 0,75 ou valores intermediários quando o desempenho estiver entre dois níveis.',
      'Registre a justificativa de notas extremas (0,00 ou 1,00) no campo de observação.',
      'O sistema calcula automaticamente os subíndices e o IGS final.',
    ],
  },
  {
    titulo: 'Feedback',
    cor: '#00695C',
    icon: <FiMessageCircle />,
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
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} color="primary.dark">Guia de Aplicação</Typography>
        <Typography variant="body2" color="text.secondary">
          Passo a passo para aplicar o ICSR em uma propriedade rural — adaptado da metodologia ISA-EPAMIG/INCAPER.
        </Typography>
      </Box>

      {/* Apresentação */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <MdOutlineEco size={42} color="rgba(255,255,255,0.9)" />
            <Box>
              <Typography variant="h6" fontWeight={800}>Como aplicar o ICSR em campo</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>
                A avaliação completa leva entre <strong>4 e 6 horas</strong> e pode ser dividida em duas visitas.
                Siga as cinco etapas abaixo para garantir uma avaliação consistente, transparente e útil
                ao produtor.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Etapas */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Etapas da Aplicação</Typography>
          <Stepper orientation="vertical" activeStep={-1} sx={{ '& .MuiStepConnector-line': { minHeight: 16 } }}>
            {ETAPAS.map((e, i) => (
              <Step key={e.titulo} expanded>
                <StepLabel
                  slots={{
                    stepIcon: () => (
                      <Box
                        sx={{
                          width: 32, height: 32, borderRadius: '50%',
                          bgcolor: e.cor, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800,
                        }}
                      >
                        {i + 1}
                      </Box>
                    ),
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography fontWeight={700} color={e.cor}>{e.titulo}</Typography>
                    <Chip
                      icon={<FiClock size={12} />}
                      label={e.tempo}
                      size="small"
                      sx={{ bgcolor: `${e.cor}22`, color: e.cor, fontWeight: 700 }}
                    />
                  </Box>
                </StepLabel>
                <StepContent>
                  <List dense disablePadding>
                    {e.itens.map((t) => (
                      <ListItem key={t} disableGutters sx={{ alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 26, mt: 0.5, color: e.cor }}>
                          <FiCheckCircle size={14} />
                        </ListItemIcon>
                        <ListItemText
                          primary={t}
                          slotProps={{ primary: { variant: 'body2' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Tempo total */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Tempo Estimado</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Etapa</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Duração</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TEMPO_TOTAL.map(([etapa, tempo], i) => (
                    <TableRow key={etapa} sx={{ bgcolor: i === TEMPO_TOTAL.length - 1 ? 'primary.50' : 'inherit' }}>
                      <TableCell sx={{ fontWeight: i === TEMPO_TOTAL.length - 1 ? 700 : 500 }}>{etapa}</TableCell>
                      <TableCell sx={{ fontWeight: i === TEMPO_TOTAL.length - 1 ? 700 : 500 }}>{tempo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Materiais */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Materiais Necessários</Typography>
              <List dense>
                {[
                  'Questionário padronizado (este sistema)',
                  'Câmera fotográfica',
                  'GPS ou aplicativo de georreferenciamento',
                  'Tabela de médias regionais (produtividade, preços)',
                  'Planilha impressa como backup',
                  'Documentação do produtor: CAR, notas fiscais, certificados',
                ].map((m) => (
                  <ListItem key={m} disableGutters>
                    <ListItemIcon sx={{ minWidth: 26, color: 'primary.main' }}>
                      <FiCheckCircle size={14} />
                    </ListItemIcon>
                    <ListItemText primary={m} slotProps={{ primary: { variant: 'body2' } }} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                Perfil do aplicador
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Técnico agrícola, engenheiro agrônomo ou assistente social com formação em desenvolvimento
                rural. Treinamento mínimo de 8-16 horas no instrumento ICSR.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dicas */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FiAlertTriangle size={18} color="#EF6C00" />
            <Typography variant="h6" fontWeight={700}>Dicas Importantes</Typography>
          </Box>
          <Grid container spacing={1.5}>
            {DICAS.map((d, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Paper variant="outlined" sx={{ p: 1.25, borderColor: '#FFE0B2', bgcolor: '#FFF8E1', display: 'flex', gap: 1 }}>
                  <FiInfo color="#EF6C00" size={14} style={{ marginTop: 4, flexShrink: 0 }} />
                  <Typography variant="body2">{d}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Alert severity="success" sx={{ mt: 2 }}>
            A boa aplicação do ICSR depende de evidências objetivas. Sempre fotografe, anote e documente
            as situações observadas no campo de <strong>observação</strong> de cada indicador.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
