// Definição completa dos indicadores e critérios baseados na análise ISA-EPAMIG/INCAPER
const DIMENSOES = {
  economica: {
    codigo: 'economica',
    nome: 'Econômica',
    peso: 0.30,
    cor: '#2196F3',
    indicadores: [
      {
        codigo: 'eco_produtividade',
        nome: 'Produtividade',
        criterio: 'Sacas por hectare comparadas à média regional',
        criterios: [
          { nota: 0.00, descricao: 'Produtividade muito inferior à média regional' },
          { nota: 0.25, descricao: 'Até 25% abaixo da média regional' },
          { nota: 0.50, descricao: 'Próxima da média regional' },
          { nota: 0.75, descricao: 'Entre 10% e 25% acima da média regional' },
          { nota: 1.00, descricao: 'Superior a 25% da média regional' },
        ],
      },
      {
        codigo: 'eco_comercializacao',
        nome: 'Eficiência de Comercialização',
        criterio: 'Diversidade de canais e agregação de valor',
        criterios: [
          { nota: 0.00, descricao: 'Venda exclusivamente para atravessadores' },
          { nota: 0.25, descricao: 'Pouca diversificação de mercado' },
          { nota: 0.50, descricao: 'Comercialização regional organizada' },
          { nota: 0.75, descricao: 'Diversificação de canais de venda' },
          { nota: 1.00, descricao: 'Comercialização diferenciada e agregação de valor' },
        ],
      },
      {
        codigo: 'eco_diversidade_renda',
        nome: 'Diversidade de Renda',
        criterio: 'Número de fontes de renda da propriedade',
        criterios: [
          { nota: 0.00, descricao: 'Apenas uma fonte de renda' },
          { nota: 0.25, descricao: 'Duas fontes de renda' },
          { nota: 0.50, descricao: 'Três fontes de renda' },
          { nota: 0.75, descricao: 'Quatro fontes de renda' },
          { nota: 1.00, descricao: 'Cinco ou mais fontes de renda' },
        ],
      },
      {
        codigo: 'eco_custo_producao',
        nome: 'Custo de Produção',
        criterio: 'Relação custo/receita',
        criterios: [
          { nota: 0.00, descricao: 'Custos superiores à receita' },
          { nota: 0.25, descricao: 'Baixa margem econômica' },
          { nota: 0.50, descricao: 'Equilíbrio financeiro moderado' },
          { nota: 0.75, descricao: 'Boa relação custo-benefício' },
          { nota: 1.00, descricao: 'Alta eficiência econômica' },
        ],
      },
      {
        codigo: 'eco_patrimonio',
        nome: 'Evolução Patrimonial',
        criterio: 'Crescimento patrimonial nos últimos anos',
        criterios: [
          { nota: 0.00, descricao: 'Redução patrimonial' },
          { nota: 0.25, descricao: 'Estagnação patrimonial' },
          { nota: 0.50, descricao: 'Pequeno crescimento patrimonial' },
          { nota: 0.75, descricao: 'Crescimento consistente' },
          { nota: 1.00, descricao: 'Crescimento elevado e contínuo' },
        ],
      },
      {
        codigo: 'eco_qualidade_cafe',
        nome: 'Qualidade do Café',
        criterio: 'Percentual de cafés especiais ou classificados',
        criterios: [
          { nota: 0.00, descricao: 'Café sem classificação' },
          { nota: 0.25, descricao: 'Baixo padrão de qualidade' },
          { nota: 0.50, descricao: 'Café comercial padrão' },
          { nota: 0.75, descricao: 'Café superior' },
          { nota: 1.00, descricao: 'Café especial certificado' },
        ],
      },
      {
        codigo: 'eco_planejamento_financeiro',
        nome: 'Planejamento Financeiro',
        criterio: 'Existência de controle financeiro e fluxo de caixa',
        criterios: [
          { nota: 0.00, descricao: 'Não realiza controle financeiro' },
          { nota: 0.25, descricao: 'Controle informal' },
          { nota: 0.50, descricao: 'Controle parcial' },
          { nota: 0.75, descricao: 'Controle organizado' },
          { nota: 1.00, descricao: 'Planejamento financeiro completo' },
        ],
      },
    ],
  },

  ambiental: {
    codigo: 'ambiental',
    nome: 'Ambiental',
    peso: 0.35,
    cor: '#4CAF50',
    indicadores: [
      {
        codigo: 'amb_conservacao_solo',
        nome: 'Conservação do Solo',
        criterio: 'Uso de curvas de nível, cobertura e manejo conservacionista',
        criterios: [
          { nota: 0.00, descricao: 'Ausência de práticas conservacionistas' },
          { nota: 0.25, descricao: 'Práticas insuficientes' },
          { nota: 0.50, descricao: 'Conservação parcial' },
          { nota: 0.75, descricao: 'Boas práticas implantadas' },
          { nota: 1.00, descricao: 'Sistema conservacionista consolidado' },
        ],
      },
      {
        codigo: 'amb_manejo_agua',
        nome: 'Manejo da Água',
        criterio: 'Uso racional e proteção hídrica',
        criterios: [
          { nota: 0.00, descricao: 'Uso inadequado da água' },
          { nota: 0.25, descricao: 'Controle limitado' },
          { nota: 0.50, descricao: 'Uso moderadamente eficiente' },
          { nota: 0.75, descricao: 'Uso racional monitorado' },
          { nota: 1.00, descricao: 'Gestão hídrica eficiente e sustentável' },
        ],
      },
      {
        codigo: 'amb_app_rl',
        nome: 'APP e Reserva Legal',
        criterio: 'Percentual regularizado e conservado',
        criterios: [
          { nota: 0.00, descricao: 'Inexistência de regularização' },
          { nota: 0.25, descricao: 'Regularização inicial' },
          { nota: 0.50, descricao: 'Parcialmente regularizada' },
          { nota: 0.75, descricao: 'Regularizada e conservada' },
          { nota: 1.00, descricao: 'Integralmente protegida e manejada' },
        ],
      },
      {
        codigo: 'amb_residuos',
        nome: 'Gestão de Resíduos',
        criterio: 'Destinação adequada de resíduos sólidos e embalagens',
        criterios: [
          { nota: 0.00, descricao: 'Descarte inadequado' },
          { nota: 0.25, descricao: 'Destinação parcial' },
          { nota: 0.50, descricao: 'Destinação adequada de parte dos resíduos' },
          { nota: 0.75, descricao: 'Sistema organizado de gestão' },
          { nota: 1.00, descricao: 'Gestão completa e sustentável' },
        ],
      },
      {
        codigo: 'amb_defensivos',
        nome: 'Uso Racional de Defensivos',
        criterio: 'Receituário agronômico e redução de uso',
        criterios: [
          { nota: 0.00, descricao: 'Uso indiscriminado' },
          { nota: 0.25, descricao: 'Uso sem orientação técnica' },
          { nota: 0.50, descricao: 'Uso parcialmente controlado' },
          { nota: 0.75, descricao: 'Uso racional com receituário' },
          { nota: 1.00, descricao: 'Redução significativa e manejo sustentável' },
        ],
      },
      {
        codigo: 'amb_mip',
        nome: 'Manejo Integrado de Pragas',
        criterio: 'Aplicação de MIP e monitoramento',
        criterios: [
          { nota: 0.00, descricao: 'Não utiliza MIP' },
          { nota: 0.25, descricao: 'Controle exclusivamente químico' },
          { nota: 0.50, descricao: 'Monitoramento parcial' },
          { nota: 0.75, descricao: 'MIP implantado' },
          { nota: 1.00, descricao: 'MIP consolidado e eficiente' },
        ],
      },
      {
        codigo: 'amb_irrigacao',
        nome: 'Irrigação Eficiente',
        criterio: 'Uso de tecnologias eficientes e monitoramento',
        criterios: [
          { nota: 0.00, descricao: 'Irrigação inadequada' },
          { nota: 0.25, descricao: 'Baixa eficiência' },
          { nota: 0.50, descricao: 'Eficiência moderada' },
          { nota: 0.75, descricao: 'Sistema tecnificado' },
          { nota: 1.00, descricao: 'Irrigação altamente eficiente e monitorada' },
        ],
      },
      {
        codigo: 'amb_nascentes',
        nome: 'Proteção de Nascentes',
        criterio: 'Existência e conservação das nascentes',
        criterios: [
          { nota: 0.00, descricao: 'Nascentes degradadas' },
          { nota: 0.25, descricao: 'Proteção insuficiente' },
          { nota: 0.50, descricao: 'Proteção parcial' },
          { nota: 0.75, descricao: 'Nascentes protegidas' },
          { nota: 1.00, descricao: 'Recuperação e conservação completa' },
        ],
      },
      {
        codigo: 'amb_cobertura_vegetal',
        nome: 'Cobertura Vegetal',
        criterio: 'Percentual de cobertura vegetal na propriedade',
        criterios: [
          { nota: 0.00, descricao: 'Solo exposto predominante' },
          { nota: 0.25, descricao: 'Baixa cobertura vegetal' },
          { nota: 0.50, descricao: 'Cobertura moderada' },
          { nota: 0.75, descricao: 'Boa cobertura vegetal' },
          { nota: 1.00, descricao: 'Cobertura vegetal permanente' },
        ],
      },
    ],
  },

  social: {
    codigo: 'social',
    nome: 'Social',
    peso: 0.20,
    cor: '#FF9800',
    indicadores: [
      {
        codigo: 'soc_capacitacao',
        nome: 'Capacitação Técnica',
        criterio: 'Participação em cursos e treinamentos',
        criterios: [
          { nota: 0.00, descricao: 'Não participa de capacitações' },
          { nota: 0.25, descricao: 'Participação eventual' },
          { nota: 0.50, descricao: 'Capacitações periódicas' },
          { nota: 0.75, descricao: 'Capacitação frequente' },
          { nota: 1.00, descricao: 'Capacitação contínua e aplicada' },
        ],
      },
      {
        codigo: 'soc_seguranca_trabalho',
        nome: 'Segurança do Trabalho',
        criterio: 'Uso de EPI e adequação trabalhista',
        criterios: [
          { nota: 0.00, descricao: 'Ausência de práticas de segurança' },
          { nota: 0.25, descricao: 'Uso limitado de EPI' },
          { nota: 0.50, descricao: 'Uso parcial de medidas preventivas' },
          { nota: 0.75, descricao: 'Segurança adequadamente implantada' },
          { nota: 1.00, descricao: 'Sistema completo de segurança' },
        ],
      },
      {
        codigo: 'soc_sucessao_familiar',
        nome: 'Sucessão Familiar',
        criterio: 'Participação de jovens e continuidade da atividade',
        criterios: [
          { nota: 0.00, descricao: 'Não há sucessão prevista' },
          { nota: 0.25, descricao: 'Baixo interesse familiar' },
          { nota: 0.50, descricao: 'Participação parcial dos jovens' },
          { nota: 0.75, descricao: 'Envolvimento ativo' },
          { nota: 1.00, descricao: 'Sucessão estruturada e consolidada' },
        ],
      },
      {
        codigo: 'soc_qualidade_vida',
        nome: 'Qualidade de Vida',
        criterio: 'Acesso à saúde, educação e infraestrutura',
        criterios: [
          { nota: 0.00, descricao: 'Condições precárias' },
          { nota: 0.25, descricao: 'Infraestrutura limitada' },
          { nota: 0.50, descricao: 'Condições razoáveis' },
          { nota: 0.75, descricao: 'Boa qualidade de vida' },
          { nota: 1.00, descricao: 'Excelente qualidade de vida' },
        ],
      },
      {
        codigo: 'soc_organizacao',
        nome: 'Organização Produtiva',
        criterio: 'Participação em cooperativas e associações',
        criterios: [
          { nota: 0.00, descricao: 'Não participa de organizações' },
          { nota: 0.25, descricao: 'Participação ocasional' },
          { nota: 0.50, descricao: 'Participação moderada' },
          { nota: 0.75, descricao: 'Participação ativa' },
          { nota: 1.00, descricao: 'Liderança e forte integração coletiva' },
        ],
      },
      {
        codigo: 'soc_saneamento',
        nome: 'Infraestrutura Sanitária',
        criterio: 'Condições sanitárias da propriedade',
        criterios: [
          { nota: 0.00, descricao: 'Ausência de estrutura sanitária' },
          { nota: 0.25, descricao: 'Estrutura inadequada' },
          { nota: 0.50, descricao: 'Estrutura básica' },
          { nota: 0.75, descricao: 'Estrutura adequada' },
          { nota: 1.00, descricao: 'Estrutura sanitária completa' },
        ],
      },
      {
        codigo: 'soc_assistencia_tecnica',
        nome: 'Assistência Técnica',
        criterio: 'Frequência de acompanhamento técnico',
        criterios: [
          { nota: 0.00, descricao: 'Sem assistência técnica' },
          { nota: 0.25, descricao: 'Atendimento esporádico' },
          { nota: 0.50, descricao: 'Assistência periódica' },
          { nota: 0.75, descricao: 'Acompanhamento frequente' },
          { nota: 1.00, descricao: 'Assistência contínua e integrada' },
        ],
      },
    ],
  },

  gestao_qualidade: {
    codigo: 'gestao_qualidade',
    nome: 'Gestão e Qualidade',
    peso: 0.15,
    cor: '#9C27B0',
    indicadores: [
      {
        codigo: 'gq_rastreabilidade',
        nome: 'Rastreabilidade',
        criterio: 'Existência de registros produtivos e operacionais',
        criterios: [
          { nota: 0.00, descricao: 'Não possui registros' },
          { nota: 0.25, descricao: 'Registros incompletos' },
          { nota: 0.50, descricao: 'Registros básicos' },
          { nota: 0.75, descricao: 'Sistema organizado' },
          { nota: 1.00, descricao: 'Rastreabilidade completa' },
        ],
      },
      {
        codigo: 'gq_pos_colheita',
        nome: 'Pós-Colheita',
        criterio: 'Boas práticas de secagem e armazenamento',
        criterios: [
          { nota: 0.00, descricao: 'Manejo inadequado' },
          { nota: 0.25, descricao: 'Baixa padronização' },
          { nota: 0.50, descricao: 'Procedimentos básicos' },
          { nota: 0.75, descricao: 'Boas práticas implantadas' },
          { nota: 1.00, descricao: 'Pós-colheita tecnificada' },
        ],
      },
      {
        codigo: 'gq_armazenamento',
        nome: 'Armazenamento',
        criterio: 'Estrutura adequada e controle de qualidade',
        criterios: [
          { nota: 0.00, descricao: 'Armazenamento inadequado' },
          { nota: 0.25, descricao: 'Estrutura insuficiente' },
          { nota: 0.50, descricao: 'Estrutura básica' },
          { nota: 0.75, descricao: 'Armazenamento adequado' },
          { nota: 1.00, descricao: 'Estrutura tecnificada e segura' },
        ],
      },
      {
        codigo: 'gq_planejamento_produtivo',
        nome: 'Planejamento Produtivo',
        criterio: 'Planejamento anual das atividades',
        criterios: [
          { nota: 0.00, descricao: 'Não realiza planejamento' },
          { nota: 0.25, descricao: 'Planejamento informal' },
          { nota: 0.50, descricao: 'Planejamento parcial' },
          { nota: 0.75, descricao: 'Planejamento organizado' },
          { nota: 1.00, descricao: 'Planejamento estratégico consolidado' },
        ],
      },
      {
        codigo: 'gq_registros_tecnicos',
        nome: 'Registros Técnicos',
        criterio: 'Controle de aplicações, produtividade e custos',
        criterios: [
          { nota: 0.00, descricao: 'Ausência de registros' },
          { nota: 0.25, descricao: 'Registros esporádicos' },
          { nota: 0.50, descricao: 'Registros básicos' },
          { nota: 0.75, descricao: 'Registros sistematizados' },
          { nota: 1.00, descricao: 'Sistema completo de monitoramento' },
        ],
      },
      {
        codigo: 'gq_conformidade_ambiental',
        nome: 'Conformidade Ambiental',
        criterio: 'Atendimento às exigências legais',
        criterios: [
          { nota: 0.00, descricao: 'Irregularidade ambiental' },
          { nota: 0.25, descricao: 'Processo inicial de adequação' },
          { nota: 0.50, descricao: 'Parcialmente regularizado' },
          { nota: 0.75, descricao: 'Regularização adequada' },
          { nota: 1.00, descricao: 'Total conformidade ambiental' },
        ],
      },
      {
        codigo: 'gq_certificacoes',
        nome: 'Certificações',
        criterio: 'Participação em programas de certificação',
        criterios: [
          { nota: 0.00, descricao: 'Não possui certificações' },
          { nota: 0.25, descricao: 'Interesse inicial' },
          { nota: 0.50, descricao: 'Processo de adequação' },
          { nota: 0.75, descricao: 'Certificação parcial' },
          { nota: 1.00, descricao: 'Certificação consolidada' },
        ],
      },
    ],
  },
};

const ESCALA_IGS = [
  { min: 0.00, max: 0.20, classificacao: 'Muito Baixa', cor: '#f44336', descricao: 'Muito baixa sustentabilidade' },
  { min: 0.21, max: 0.40, classificacao: 'Baixa', cor: '#FF9800', descricao: 'Baixa sustentabilidade' },
  { min: 0.41, max: 0.60, classificacao: 'Moderada', cor: '#FFEB3B', descricao: 'Sustentabilidade moderada' },
  { min: 0.61, max: 0.80, classificacao: 'Boa', cor: '#8BC34A', descricao: 'Boa sustentabilidade' },
  { min: 0.81, max: 1.00, classificacao: 'Alta', cor: '#4CAF50', descricao: 'Alta sustentabilidade' },
];

function calcularIGS(ie, ia, is_, igq) {
  const igs = (ie * 0.30) + (ia * 0.35) + (is_ * 0.20) + (igq * 0.15);
  const faixa = ESCALA_IGS.find(e => igs <= e.max) || ESCALA_IGS[ESCALA_IGS.length - 1];
  return { igs: parseFloat(igs.toFixed(4)), classificacao: faixa.classificacao };
}

function calcularIndiceDimensao(respostas) {
  if (!respostas || respostas.length === 0) return 0;
  const soma = respostas.reduce((acc, r) => acc + parseFloat(r.nota), 0);
  return parseFloat((soma / respostas.length).toFixed(4));
}

module.exports = { DIMENSOES, ESCALA_IGS, calcularIGS, calcularIndiceDimensao };
