/**
 * Glossário de termos técnicos do ICSR para tooltips contextuais.
 * Chave: substring que aparece no nome ou critério do indicador.
 */
export const GLOSSARIO = {
  'APP': 'Área de Preservação Permanente — faixa obrigatória de vegetação nativa em margens de rios, encostas e topos de morro (Código Florestal, Lei 12.651/2012).',
  'Reserva Legal': 'Área de vegetação nativa obrigatória na propriedade rural, com percentual definido por bioma (Código Florestal, Lei 12.651/2012).',
  'CAR': 'Cadastro Ambiental Rural — registro público eletrônico obrigatório para todas as propriedades rurais (SiCAR).',
  'MIP': 'Manejo Integrado de Pragas — estratégia que combina métodos preventivos, biológicos e químicos para controle eficiente e sustentável de pragas.',
  'EPI': 'Equipamento de Proteção Individual — itens obrigatórios para proteger o trabalhador rural (capacete, luvas, botas, óculos, respirador).',
  'Due Diligence': 'Processo de mapeamento e avaliação de riscos socioambientais na cadeia de fornecedores, exigido pela CSDDD da União Europeia (Diretiva 2024/1760).',
  'FPIC': 'Free, Prior and Informed Consent — Consentimento Livre, Prévio e Informado: direito das comunidades tradicionais de serem consultadas antes de atividades que as afetem (OIT Convenção 169, Banco Mundial).',
  'Stakeholders': 'Partes interessadas: trabalhadores, família, comunidade local, comunidades tradicionais e outros grupos afetados pelas atividades da propriedade.',
  'GRI': 'Global Reporting Initiative — padrão internacional de relatórios de sustentabilidade corporativa.',
  'CSDDD': 'Corporate Sustainability Due Diligence Directive — Diretiva da UE que exige avaliação de riscos socioambientais nas cadeias de fornecimento a partir de 2024/2025.',
};

/**
 * Retorna a definição glossário para um texto, ou null se não encontrar.
 */
export function getDefinicao(texto) {
  if (!texto) return null;
  for (const [termo, def] of Object.entries(GLOSSARIO)) {
    if (texto.includes(termo)) return { termo, def };
  }
  return null;
}
