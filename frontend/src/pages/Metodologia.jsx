import {
  Box, Typography, Card, CardContent, Grid, Chip,
  Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Divider, LinearProgress,
} from '@mui/material';
import { FiChevronDown, FiInfo } from 'react-icons/fi';
import { MdOutlineEco } from 'react-icons/md';

const DIMENSOES = [
  {
    nome: 'Econômica', cor: '#2196F3', peso: 30,
    descricao: 'Avalia a viabilidade financeira, produtividade, diversidade de renda e planejamento econômico da propriedade.',
    indicadores: ['Produtividade', 'Eficiência de Comercialização', 'Diversidade de Renda', 'Custo de Produção', 'Evolução Patrimonial', 'Qualidade do Café', 'Planejamento Financeiro'],
  },
  {
    nome: 'Ambiental', cor: '#4CAF50', peso: 35,
    descricao: 'Analisa as práticas de conservação, manejo ambiental e conformidade legal da propriedade rural.',
    indicadores: ['Conservação do Solo', 'Manejo da Água', 'APP e Reserva Legal', 'Gestão de Resíduos', 'Uso Racional de Defensivos', 'Manejo Integrado de Pragas', 'Irrigação Eficiente', 'Proteção de Nascentes', 'Cobertura Vegetal'],
  },
  {
    nome: 'Social', cor: '#FF9800', peso: 20,
    descricao: 'Verifica as condições de trabalho, qualidade de vida, capacitação e organização social dos agricultores.',
    indicadores: ['Capacitação Técnica', 'Segurança do Trabalho', 'Sucessão Familiar', 'Qualidade de Vida', 'Organização Produtiva', 'Infraestrutura Sanitária', 'Assistência Técnica'],
  },
  {
    nome: 'Gestão e Qualidade', cor: '#9C27B0', peso: 15,
    descricao: 'Avalia o nível de rastreabilidade, conformidade, certificações e gestão operacional da produção de café.',
    indicadores: ['Rastreabilidade', 'Pós-Colheita', 'Armazenamento', 'Planejamento Produtivo', 'Registros Técnicos', 'Conformidade Ambiental', 'Certificações'],
  },
];

const ESCALA = [
  { faixa: '0,00 – 0,20', classificacao: 'Muito Baixa', cor: '#f44336', descricao: 'Situação crítica — intervenção urgente necessária' },
  { faixa: '0,21 – 0,40', classificacao: 'Baixa', cor: '#FF9800', descricao: 'Sustentabilidade comprometida — ações corretivas necessárias' },
  { faixa: '0,41 – 0,60', classificacao: 'Moderada', cor: '#FFC107', descricao: 'Em transição — práticas sustentáveis em implantação' },
  { faixa: '0,61 – 0,80', classificacao: 'Boa', cor: '#8BC34A', descricao: 'Bom desempenho sustentável — manter e aprimorar' },
  { faixa: '0,81 – 1,00', classificacao: 'Alta', cor: '#4CAF50', descricao: 'Excelência em sustentabilidade — referência regional' },
];

export default function Metodologia() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800} color="primary.dark">Metodologia</Typography>
        <Typography variant="body2" color="text.secondary">
          Análise comparativa ISA-EPAMIG / INCAPER — Sistema Integrado de Sustentabilidade Rural
        </Typography>
      </Box>

      {/* Apresentação */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <MdOutlineEco size={48} color="rgba(255,255,255,0.9)" />
            <Box>
              <Typography variant="h6" fontWeight={800} color="white">
                Sistema Integrado de Avaliação de Sustentabilidade
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>
                Proposta híbrida baseada na análise comparativa entre o <strong>ISA-EPAMIG</strong> (Minas Gerais)
                e o <strong>Sistema de Indicadores da Cafeicultura Sustentável INCAPER</strong> (Espírito Santo).
                Combina a robustez metodológica quantitativa do ISA com a aplicabilidade prática e foco
                na cafeicultura do INCAPER.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Instrumentos base */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #1565C0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} color="#1565C0">ISA – EPAMIG</Typography>
              <Typography variant="caption" color="text.secondary">Minas Gerais · Índice de Sustentabilidade em Agroecossistemas</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Abordagem ampla e multidimensional. Forte uso de ponderações, indicadores compostos e análise quantitativa.
                Ênfase na evolução patrimonial, análise histórica e sustentabilidade sistêmica.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {['Quantitativa', 'Multiculturas', 'Patrimonial', 'Alta precisão'].map((t) => (
                  <Chip key={t} label={t} size="small" sx={{ bgcolor: '#1565C022', color: '#1565C0', fontWeight: 600 }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #2E7D32' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} color="#2E7D32">INCAPER</Typography>
              <Typography variant="caption" color="text.secondary">Espírito Santo · Sistema de Indicadores da Cafeicultura Sustentável</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enfoque setorial voltado à cafeicultura. Avaliação qualitativa com escalas ordinais, forte aderência
                às Boas Práticas Agrícolas (BPA) e alta aplicabilidade extensionista.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {['Qualitativa', 'Cafeicultura', 'BPA', 'Extensionista'].map((t) => (
                  <Chip key={t} label={t} size="small" sx={{ bgcolor: '#2E7D3222', color: '#2E7D32', fontWeight: 600 }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fórmula IGS */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Fórmula do Índice Geral de Sustentabilidade (IGS)
          </Typography>
          <Paper
            sx={{
              p: 2.5, bgcolor: '#F1F8E9', border: '1px solid #A5D6A7',
              borderRadius: 2, textAlign: 'center', mb: 2,
            }}
          >
            <Typography variant="h5" fontWeight={800} color="primary.dark" fontFamily="monospace">
              IGS = (IE × 0,30) + (IA × 0,35) + (IS × 0,20) + (IGQ × 0,15)
            </Typography>
          </Paper>
          <Grid container spacing={2}>
            {DIMENSOES.map((d) => (
              <Grid size={{ xs: 6, md: 3 }} key={d.nome}>
                <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: `${d.cor}11`, border: `1px solid ${d.cor}33` }}>
                  <Typography variant="h4" fontWeight={900} color={d.cor}>{d.peso}%</Typography>
                  <Typography variant="caption" fontWeight={700} color={d.cor}>{d.nome}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Escala de classificação */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Escala de Classificação</Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Faixa do IGS</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Classificação</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Descrição</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Nível</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ESCALA.map((e) => (
                <TableRow key={e.classificacao} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell><Typography variant="body2" fontFamily="monospace" fontWeight={700}>{e.faixa}</Typography></TableCell>
                  <TableCell>
                    <Chip label={e.classificacao} size="small" sx={{ bgcolor: e.cor, color: '#fff', fontWeight: 700 }} />
                  </TableCell>
                  <TableCell><Typography variant="body2">{e.descricao}</Typography></TableCell>
                  <TableCell sx={{ width: 100 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(ESCALA.indexOf(e) * 25 + 15, 100)}
                      sx={{ height: 8, borderRadius: 4, bgcolor: '#eee', '& .MuiLinearProgress-bar': { bgcolor: e.cor } }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dimensões - Accordions */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Dimensões e Indicadores</Typography>
      {DIMENSOES.map((d) => (
        <Accordion key={d.nome} sx={{ mb: 1, borderLeft: `4px solid ${d.cor}`, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<FiChevronDown />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
              <Box>
                <Typography fontWeight={700} color={d.cor}>{d.nome}</Typography>
                <Typography variant="caption" color="text.secondary">{d.indicadores.length} indicadores · peso {d.peso}%</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Chip label={`${d.peso}%`} size="small" sx={{ bgcolor: d.cor, color: '#fff', fontWeight: 700 }} />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{d.descricao}</Typography>
            <Grid container spacing={1}>
              {d.indicadores.map((ind, i) => (
                <Grid size={{ xs: 12, sm: 6 }} key={ind}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: `${d.cor}09`, borderRadius: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: d.cor, flexShrink: 0 }} />
                    <Typography variant="body2">{ind}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Escala de notas */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            <FiInfo style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Escala Padronizada de Notas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Cada indicador é avaliado em uma escala padronizada de 0 a 1 com cinco níveis de desempenho:
          </Typography>
          <Grid container spacing={1}>
            {[
              { nota: '0,00', desc: 'Condição inexistente ou inadequada', cor: '#f44336' },
              { nota: '0,25', desc: 'Baixo desempenho', cor: '#FF9800' },
              { nota: '0,50', desc: 'Desempenho moderado', cor: '#FFC107' },
              { nota: '0,75', desc: 'Bom desempenho', cor: '#8BC34A' },
              { nota: '1,00', desc: 'Excelente desempenho', cor: '#4CAF50' },
            ].map((n) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={n.nota}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${n.cor}11`, border: `1px solid ${n.cor}44`, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={800} color={n.cor} fontFamily="monospace">{n.nota}</Typography>
                  <Typography variant="caption" color="text.secondary">{n.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
