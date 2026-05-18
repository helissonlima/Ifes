// Definição completa dos indicadores e critérios baseados no ICSR (ISA-EPAMIG / INCAPER)
const DIMENSOES = {
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
        evidencia_esperada: 'Visual: erosão, curvas de nível, cobertura vegetal, croqui, projeto topográfico',
        criterios: [
          { nota: 0.00, descricao: 'Ausência total; solo exposto em toda a área produtiva' },
          { nota: 0.25, descricao: 'Práticas insuficientes; curvas em menos de 30% da área' },
          { nota: 0.50, descricao: 'Conservação parcial; curvas em 30-60% da área' },
          { nota: 0.75, descricao: 'Boas práticas; curvas em mais de 60%, cobertura permanente em 50%+' },
          { nota: 1.00, descricao: 'Sistema consolidado; 3+ práticas integradas em toda a área cafeeira' },
        ],
      },
      {
        codigo: 'amb_manejo_agua',
        nome: 'Manejo da Água',
        criterio: 'Uso racional e proteção hídrica',
        evidencia_esperada: 'Medidor de água, sistema de reuso, tratamento de efluentes, laudo de eficiência hídrica',
        criterios: [
          { nota: 0.00, descricao: 'Uso inadequado; desperdício e contaminação de corpos hídricos' },
          { nota: 0.25, descricao: 'Controle limitado; sem monitoramento de volume' },
          { nota: 0.50, descricao: 'Uso moderado; controle visual, reuso parcial' },
          { nota: 0.75, descricao: 'Uso racional monitorado; medição, reuso, tratamento de efluentes' },
          { nota: 1.00, descricao: 'Gestão hídrica eficiente; monitoramento contínuo, reuso integral' },
        ],
      },
      {
        codigo: 'amb_app_rl',
        nome: 'APP e Reserva Legal',
        criterio: 'Percentual regularizado e conservado',
        evidencia_esperada: 'CAR ativo, imagem de satélite, cercamento das APPs, plano de manejo',
        criterios: [
          { nota: 0.00, descricao: 'Sem regularização; CAR não iniciado, desmatamento de APP' },
          { nota: 0.25, descricao: 'Regularização iniciada; CAR em ativação' },
          { nota: 0.50, descricao: 'Parcial; CAR ativo mas com pendências em RL ou APP' },
          { nota: 0.75, descricao: 'Regularizada; CAR ativo, APPs e RL demarcadas' },
          { nota: 1.00, descricao: 'Integralmente protegida; manejo ativo e monitoramento' },
        ],
      },
      {
        codigo: 'amb_residuos',
        nome: 'Gestão de Resíduos',
        criterio: 'Destinação adequada de resíduos sólidos e embalagens',
        evidencia_esperada: 'Composteira, comprovante Campo Limpo, registros de destinação, certificação',
        criterios: [
          { nota: 0.00, descricao: 'Descarte inadequado; queima ou enterro incorreto' },
          { nota: 0.25, descricao: 'Parcial; apenas resíduos orgânicos compostados' },
          { nota: 0.50, descricao: 'Destinação adequada de parte; coleta seletiva parcial' },
          { nota: 0.75, descricao: 'Sistema organizado; Campo Limpo, reciclagem' },
          { nota: 1.00, descricao: 'Gestão completa; zero resíduos para aterro, economia circular' },
        ],
      },
      {
        codigo: 'amb_defensivos',
        nome: 'Uso Racional de Defensivos',
        criterio: 'Receituário agronômico e redução de uso',
        evidencia_esperada: 'Receituário atualizado, caderneta de campo, registros, controle biológico',
        criterios: [
          { nota: 0.00, descricao: 'Uso indiscriminado; sem receituário, superdosagem' },
          { nota: 0.25, descricao: 'Sem orientação técnica; aplicação por experiência própria' },
          { nota: 0.50, descricao: 'Parcialmente controlado; receituário desatualizado' },
          { nota: 0.75, descricao: 'Racional com receituário; registros das aplicações' },
          { nota: 1.00, descricao: 'Redução significativa (50%+ em 5 anos); manejo integrado' },
        ],
      },
      {
        codigo: 'amb_mip',
        nome: 'Manejo Integrado de Pragas (MIP)',
        criterio: 'Aplicação de MIP e monitoramento sistemático',
        evidencia_esperada: 'Armadilhas, registros semanais, plano MIP, laudo técnico',
        criterios: [
          { nota: 0.00, descricao: 'Sem MIP; controle exclusivamente reativo' },
          { nota: 0.25, descricao: 'Só químico; aplicação por calendário' },
          { nota: 0.50, descricao: 'Monitoramento parcial; inspeções ocasionais' },
          { nota: 0.75, descricao: 'MIP implantado; armadilhas, contagens, níveis de ação' },
          { nota: 1.00, descricao: 'MIP consolidado (3+ anos); predadores naturais e redução química' },
        ],
      },
      {
        codigo: 'amb_irrigacao',
        nome: 'Irrigação Eficiente',
        criterio: 'Uso de tecnologias eficientes e monitoramento',
        evidencia_esperada: 'Sistema de gotejamento, tensiômetros, fertirrigação, registros de eficiência',
        criterios: [
          { nota: 0.00, descricao: 'Inadequada; alagamento, erosão, desperdício' },
          { nota: 0.25, descricao: 'Baixa eficiência; aspersão sem controle' },
          { nota: 0.50, descricao: 'Moderada; aspersão com controle ou gotejamento parcial' },
          { nota: 0.75, descricao: 'Tecnificada; gotejamento + monitoramento de umidade' },
          { nota: 1.00, descricao: 'Altamente eficiente; automatizada, fertirrigação, reuso' },
        ],
      },
      {
        codigo: 'amb_nascentes',
        nome: 'Proteção de Nascentes',
        criterio: 'Existência e conservação das nascentes',
        evidencia_esperada: 'Cercamento, replantio nativo, laudo de qualidade da água',
        criterios: [
          { nota: 0.00, descricao: 'Degradadas; poluição, assoreamento' },
          { nota: 0.25, descricao: 'Proteção insuficiente; cercamento <50% do raio' },
          { nota: 0.50, descricao: 'Parcial; cercada mas sem revegetação' },
          { nota: 0.75, descricao: 'Protegidas; cercamento + replantio nativo' },
          { nota: 1.00, descricao: 'Recuperação completa; monitoramento e manejo ativo' },
        ],
      },
      {
        codigo: 'amb_cobertura_vegetal',
        nome: 'Cobertura Vegetal',
        criterio: 'Percentual de cobertura vegetal na propriedade',
        evidencia_esperada: 'Mapa de uso do solo, imagem de satélite, inventário vegetal',
        criterios: [
          { nota: 0.00, descricao: 'Solo exposto; cobertura < 10%' },
          { nota: 0.25, descricao: 'Baixa cobertura; 10-25%' },
          { nota: 0.50, descricao: 'Cobertura moderada; 25-50%' },
          { nota: 0.75, descricao: 'Boa cobertura; 50-75% com diversidade' },
          { nota: 1.00, descricao: 'Cobertura permanente; >75%, fragmentos conectados' },
        ],
      },
    ],
  },

  economica: {
    codigo: 'economica',
    nome: 'Econômica',
    peso: 0.30,
    cor: '#2196F3',
    indicadores: [
      {
        codigo: 'eco_produtividade',
        nome: 'Produtividade',
        criterio: 'Sacas por hectare comparadas à média regional (CONAB/EMATER)',
        evidencia_esperada: 'Registros de colheita, dados regionais CONAB/EMATER',
        criterios: [
          { nota: 0.00, descricao: 'Muito inferior à média; menos de 50% da média regional' },
          { nota: 0.25, descricao: 'Entre 50-75% da média regional' },
          { nota: 0.50, descricao: 'Próxima da média; entre 75-100%' },
          { nota: 0.75, descricao: 'Entre 110-125% da média regional' },
          { nota: 1.00, descricao: 'Superior; mais de 125% da média regional' },
        ],
      },
      {
        codigo: 'eco_comercializacao',
        nome: 'Eficiência de Comercialização',
        criterio: 'Diversidade de canais e agregação de valor',
        evidencia_esperada: 'Contratos, notas fiscais, certificações',
        criterios: [
          { nota: 0.00, descricao: 'Só atravessadores; sem contrato' },
          { nota: 0.25, descricao: '1-2 compradores, sem diferenciação' },
          { nota: 0.50, descricao: 'Comercialização regional organizada' },
          { nota: 0.75, descricao: 'Canais diversificados (direta, cooperativa, local)' },
          { nota: 1.00, descricao: 'Diferenciada/premium; especial, marca própria, exportação' },
        ],
      },
      {
        codigo: 'eco_diversidade_renda',
        nome: 'Diversidade de Renda',
        criterio: 'Número de fontes de renda da propriedade',
        evidencia_esperada: 'Registros de venda de produtos secundários, CNPJ',
        criterios: [
          { nota: 0.00, descricao: 'Apenas 1 fonte (exclusivamente café)' },
          { nota: 0.25, descricao: '2 fontes (café + 1 atividade)' },
          { nota: 0.50, descricao: '3 fontes (café + 2 atividades complementares)' },
          { nota: 0.75, descricao: '4 fontes incluindo serviços/agroturismo' },
          { nota: 1.00, descricao: '5+ fontes; renda extra-rural diversificada' },
        ],
      },
      {
        codigo: 'eco_custo_producao',
        nome: 'Custo de Produção',
        criterio: 'Relação custo/receita (C/R)',
        evidencia_esperada: 'Demonstrativo de resultado, fluxo de caixa',
        criterios: [
          { nota: 0.00, descricao: 'Prejuízo; custos superiores à receita' },
          { nota: 0.25, descricao: 'C/R > 0,85; baixa margem' },
          { nota: 0.50, descricao: 'C/R entre 0,60 e 0,85; equilíbrio moderado' },
          { nota: 0.75, descricao: 'C/R entre 0,40 e 0,60; boa relação' },
          { nota: 1.00, descricao: 'C/R < 0,40; margem líquida > 30%' },
        ],
      },
      {
        codigo: 'eco_patrimonio',
        nome: 'Evolução Patrimonial',
        criterio: 'Crescimento patrimonial nos últimos 5 anos',
        evidencia_esperada: 'Declaração, registro de aquisições, laudo de avaliação',
        criterios: [
          { nota: 0.00, descricao: 'Redução patrimonial; venda de bens, endividamento' },
          { nota: 0.25, descricao: 'Estagnação; sem crescimento real em 5 anos' },
          { nota: 0.50, descricao: 'Pequeno crescimento; até 10% em 5 anos' },
          { nota: 0.75, descricao: 'Crescimento consistente; 10-25% em 5 anos' },
          { nota: 1.00, descricao: 'Crescimento elevado; > 25% em 5 anos' },
        ],
      },
      {
        codigo: 'eco_qualidade_cafe',
        nome: 'Qualidade do Café',
        criterio: 'Classificação e certificação do café produzido',
        evidencia_esperada: 'Laudo de classificação, Q-Grader, certificação de origem',
        criterios: [
          { nota: 0.00, descricao: 'Sem classificação; granel' },
          { nota: 0.25, descricao: 'Tipo 7/8; sem bebida especial' },
          { nota: 0.50, descricao: 'Tipo 6/7; bebida dura, comercialização organizada' },
          { nota: 0.75, descricao: 'Tipo 5/6, bebida mole; programa de qualidade' },
          { nota: 1.00, descricao: 'Especial certificado; > 80 pontos SCA, certificação' },
        ],
      },
      {
        codigo: 'eco_planejamento_financeiro',
        nome: 'Planejamento Financeiro',
        criterio: 'Existência de controle financeiro e fluxo de caixa',
        evidencia_esperada: 'Planilha estruturada, orçamento, análise de cenários',
        criterios: [
          { nota: 0.00, descricao: 'Sem controle; decisões intuitivas' },
          { nota: 0.25, descricao: 'Informal; anotações em caderno' },
          { nota: 0.50, descricao: 'Parcial; registro de receitas e despesas principais' },
          { nota: 0.75, descricao: 'Organizado; fluxo de caixa mensal, análise por atividade' },
          { nota: 1.00, descricao: 'Completo; orçamento anual, cenários, reserva' },
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
        evidencia_esperada: 'Certificados, registros de participação, mentoria',
        criterios: [
          { nota: 0.00, descricao: 'Não participa; ausência de registros' },
          { nota: 0.25, descricao: '1 evento em 3 anos' },
          { nota: 0.50, descricao: '1 curso por ano nos últimos 3 anos' },
          { nota: 0.75, descricao: '2+ cursos por ano, dias de campo' },
          { nota: 1.00, descricao: 'Contínua; mentoria e transferência de tecnologia' },
        ],
      },
      {
        codigo: 'soc_seguranca_trabalho',
        nome: 'Segurança do Trabalho',
        criterio: 'Uso de EPI e adequação trabalhista',
        evidencia_esperada: 'Estoque EPI, certificados de treinamento, registros',
        criterios: [
          { nota: 0.00, descricao: 'Sem práticas; trabalhadores sem EPI' },
          { nota: 0.25, descricao: 'EPI limitado a alguns trabalhadores' },
          { nota: 0.50, descricao: 'EPI parcial; sem treinamento formal' },
          { nota: 0.75, descricao: 'Adequada; EPI completo, treinamento anual' },
          { nota: 1.00, descricao: 'Sistema completo; CIPA rural, near misses' },
        ],
      },
      {
        codigo: 'soc_sucessao_familiar',
        nome: 'Sucessão Familiar',
        criterio: 'Participação de jovens e continuidade da atividade',
        evidencia_esperada: 'Entrevista família, documento de sucessão, observação',
        criterios: [
          { nota: 0.00, descricao: 'Sem sucessão prevista' },
          { nota: 0.25, descricao: 'Baixo interesse familiar' },
          { nota: 0.50, descricao: 'Participação parcial; jovens trabalham mas sem decisão' },
          { nota: 0.75, descricao: 'Envolvimento ativo; decisões em áreas específicas' },
          { nota: 1.00, descricao: 'Estruturada; jovens como principais gestores' },
        ],
      },
      {
        codigo: 'soc_qualidade_vida',
        nome: 'Qualidade de Vida',
        criterio: 'Acesso à saúde, educação e infraestrutura',
        evidencia_esperada: 'Visual moradia, entrevista, acesso a serviços',
        criterios: [
          { nota: 0.00, descricao: 'Precária; sem água tratada, energia, saneamento' },
          { nota: 0.25, descricao: 'Limitada; moradia básica, energia irregular' },
          { nota: 0.50, descricao: 'Razoável; moradia, água tratada, escola/saúde até 10km' },
          { nota: 0.75, descricao: 'Boa; internet, serviços até 5km, lazer' },
          { nota: 1.00, descricao: 'Excelente; todos os serviços, cultura, esporte' },
        ],
      },
      {
        codigo: 'soc_organizacao',
        nome: 'Organização Produtiva',
        criterio: 'Participação em cooperativas e associações',
        evidencia_esperada: 'Carteira de associado, registros de assembleias, cargos',
        criterios: [
          { nota: 0.00, descricao: 'Isolado; trabalho individual' },
          { nota: 0.25, descricao: 'Participação ocasional' },
          { nota: 0.50, descricao: 'Associado moderado; participa de assembleias' },
          { nota: 0.75, descricao: 'Ativo em comissões e negociações' },
          { nota: 1.00, descricao: 'Liderança + representação em instâncias regionais' },
        ],
      },
      {
        codigo: 'soc_saneamento',
        nome: 'Infraestrutura Sanitária',
        criterio: 'Condições sanitárias da propriedade',
        evidencia_esperada: 'Visual banheiros, fossa, sistema de tratamento',
        criterios: [
          { nota: 0.00, descricao: 'Ausente; banheiro ao ar livre' },
          { nota: 0.25, descricao: 'Inadequada; fossa rudimentar' },
          { nota: 0.50, descricao: 'Básica; banheiro com fossa séptica' },
          { nota: 0.75, descricao: 'Adequada; fossa séptica + sumidouro' },
          { nota: 1.00, descricao: 'Completa; tratamento de esgoto + trabalhadores' },
        ],
      },
      {
        codigo: 'soc_assistencia_tecnica',
        nome: 'Assistência Técnica',
        criterio: 'Frequência de acompanhamento técnico',
        evidencia_esperada: 'Registro de visitas, plano técnico, projetos',
        criterios: [
          { nota: 0.00, descricao: 'Sem assistência nos últimos 3 anos' },
          { nota: 0.25, descricao: '1 visita por ano' },
          { nota: 0.50, descricao: '2-3 visitas por ano' },
          { nota: 0.75, descricao: 'Mensal/bimestral, com plano técnico' },
          { nota: 1.00, descricao: 'Contínua + projetos pesquisa-extensão' },
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
        criterio: 'Registros produtivos e operacionais por lote',
        evidencia_esperada: 'Caderno de campo, sistema digital, QR code',
        criterios: [
          { nota: 0.00, descricao: 'Sem registros produtivos' },
          { nota: 0.25, descricao: 'Registros incompletos; sem identificação de lotes' },
          { nota: 0.50, descricao: 'Básicos; identificação de lotes e datas' },
          { nota: 0.75, descricao: 'Organizado; rastreabilidade até a secagem' },
          { nota: 1.00, descricao: 'Completo; sistema digital, QR code, do campo à xícara' },
        ],
      },
      {
        codigo: 'gq_pos_colheita',
        nome: 'Pós-Colheita',
        criterio: 'Boas práticas de secagem e benefício',
        evidencia_esperada: 'Terreiro, secador, monitoramento de umidade',
        criterios: [
          { nota: 0.00, descricao: 'Inadequado; secagem ao solo' },
          { nota: 0.25, descricao: 'Baixa padronização; sem controle de umidade' },
          { nota: 0.50, descricao: 'Básico; terreiro suspenso, controle visual' },
          { nota: 0.75, descricao: 'Boas práticas; terreiro + secador, separação de lotes' },
          { nota: 1.00, descricao: 'Tecnificado; secagem 100% controlada, silos monitorados' },
        ],
      },
      {
        codigo: 'gq_armazenamento',
        nome: 'Armazenamento',
        criterio: 'Estrutura adequada e controle de qualidade',
        evidencia_esperada: 'Barracão, silos, monitoramento de pragas',
        criterios: [
          { nota: 0.00, descricao: 'Inadequado; sacas no solo' },
          { nota: 0.25, descricao: 'Insuficiente; barracão simples, sem piso' },
          { nota: 0.50, descricao: 'Básico; piso, cobertura, ventilação' },
          { nota: 0.75, descricao: 'Adequado; paletização, controle de pragas' },
          { nota: 1.00, descricao: 'Tecnificado; controle de temperatura e umidade, aeração' },
        ],
      },
      {
        codigo: 'gq_planejamento_produtivo',
        nome: 'Planejamento Produtivo',
        criterio: 'Planejamento anual das atividades',
        evidencia_esperada: 'Calendário anual, orçamento, metas, revisão',
        criterios: [
          { nota: 0.00, descricao: 'Sem planejamento; decisões imediatas' },
          { nota: 0.25, descricao: 'Informal; calendário mental' },
          { nota: 0.50, descricao: 'Parcial; calendário sem orçamento' },
          { nota: 0.75, descricao: 'Organizado; calendário + orçamento + metas' },
          { nota: 1.00, descricao: 'Estratégico; cenários e revisão trimestral' },
        ],
      },
      {
        codigo: 'gq_registros_tecnicos',
        nome: 'Registros Técnicos',
        criterio: 'Controle de aplicações, produtividade e custos',
        evidencia_esperada: 'Caderneta, planilhas, sistema digital',
        criterios: [
          { nota: 0.00, descricao: 'Ausentes; nenhum controle' },
          { nota: 0.25, descricao: 'Esporádicos; anotações ocasionais' },
          { nota: 0.50, descricao: 'Básicos; caderneta de aplicações sem análise' },
          { nota: 0.75, descricao: 'Sistematizados; planilhas + análise por área' },
          { nota: 1.00, descricao: 'Digital + benchmarking; integração com técnico' },
        ],
      },
      {
        codigo: 'gq_conformidade_ambiental',
        nome: 'Conformidade Ambiental',
        criterio: 'Atendimento às exigências legais',
        evidencia_esperada: 'CAR, licenças, certificação ambiental',
        criterios: [
          { nota: 0.00, descricao: 'Irregularidade; autuação ou desmatamento recente' },
          { nota: 0.25, descricao: 'Processo inicial de adequação' },
          { nota: 0.50, descricao: 'Parcial; CAR ativo com pendências' },
          { nota: 0.75, descricao: 'Adequada; CAR + licenças em dia' },
          { nota: 1.00, descricao: 'Total + certificação ambiental contínua' },
        ],
      },
      {
        codigo: 'gq_certificacoes',
        nome: 'Certificações',
        criterio: 'Participação em programas de certificação',
        evidencia_esperada: 'Certificados vigentes (Orgânico, Fair Trade, etc.)',
        criterios: [
          { nota: 0.00, descricao: 'Nenhuma certificação' },
          { nota: 0.25, descricao: 'Interesse inicial; sem processo' },
          { nota: 0.50, descricao: 'Processo de adequação em andamento' },
          { nota: 0.75, descricao: 'Parcial; uma certificação obtida' },
          { nota: 1.00, descricao: 'Múltiplas certificações consolidadas' },
        ],
      },
    ],
  },
};

const ESCALA_IGS = [
  { min: 0.00, max: 0.20, classificacao: 'Muito Baixa', cor: '#f44336', descricao: 'Situação crítica; intervenção urgente em múltiplas dimensões' },
  { min: 0.21, max: 0.40, classificacao: 'Baixa', cor: '#FF9800', descricao: 'Fragilidades significativas; programa de assistência intensiva' },
  { min: 0.41, max: 0.60, classificacao: 'Moderada', cor: '#FFEB3B', descricao: 'Propriedade em transição; fortalecer dimensões específicas' },
  { min: 0.61, max: 0.80, classificacao: 'Boa', cor: '#8BC34A', descricao: 'Boa performance; manter e potencial para certificações' },
  { min: 0.81, max: 1.00, classificacao: 'Alta', cor: '#4CAF50', descricao: 'Excelência; referência regional, mercados premium' },
];

// Status de avaliação por nota (usado no diagnóstico automático)
const STATUS_INDICADOR = [
  { max: 0.25, status: 'CRÍTICO', cor: '#f44336', prazo: 'Imediato (0-3 meses)', recomendacao: 'Intervenção urgente necessária. Consultoria especializada recomendada.' },
  { max: 0.50, status: 'ATENÇÃO', cor: '#FF9800', prazo: 'Curto prazo (3-6 meses)', recomendacao: 'Plano de melhoria estruturado. Capacitação técnica indicada.' },
  { max: 0.75, status: 'BOM',     cor: '#8BC34A', prazo: 'Médio prazo (6-12 meses)', recomendacao: 'Boas práticas consolidadas. Buscar aprimoramento contínuo.' },
  { max: 1.01, status: 'EXCELENTE', cor: '#2E7D32', prazo: 'Manter (12+ meses)', recomendacao: 'Desempenho exemplar. Servir de referência para outros produtores.' },
];

function avaliarStatusIndicador(nota) {
  const n = Number(nota);
  return STATUS_INDICADOR.find((s) => n <= s.max) || STATUS_INDICADOR[STATUS_INDICADOR.length - 1];
}

function calcularIGS(ie, ia, is_, igq) {
  const igs = (ie * 0.30) + (ia * 0.35) + (is_ * 0.20) + (igq * 0.15);
  const faixa = ESCALA_IGS.find((e) => igs <= e.max) || ESCALA_IGS[ESCALA_IGS.length - 1];
  return { igs: parseFloat(igs.toFixed(4)), classificacao: faixa.classificacao };
}

function calcularIndiceDimensao(respostas) {
  if (!respostas || respostas.length === 0) return 0;
  const soma = respostas.reduce((acc, r) => acc + parseFloat(r.nota), 0);
  return parseFloat((soma / respostas.length).toFixed(4));
}

// Encontra a definição do indicador a partir de seu código
function localizarIndicador(codigo) {
  for (const dim of Object.values(DIMENSOES)) {
    const ind = dim.indicadores.find((i) => i.codigo === codigo);
    if (ind) return { ...ind, dimensao: dim.codigo, dimensao_nome: dim.nome, peso_dimensao: dim.peso };
  }
  return null;
}

// Calcula impacto potencial no IGS: peso_dimensao / total_indicadores_dimensao * (1 - nota)
function calcularImpactoIGS(codigo, nota) {
  const ind = localizarIndicador(codigo);
  if (!ind) return 0;
  const dim = DIMENSOES[ind.dimensao];
  const peso = dim.peso / dim.indicadores.length;
  return parseFloat((peso * (1 - Number(nota))).toFixed(4));
}

module.exports = {
  DIMENSOES,
  ESCALA_IGS,
  STATUS_INDICADOR,
  avaliarStatusIndicador,
  calcularIGS,
  calcularIndiceDimensao,
  localizarIndicador,
  calcularImpactoIGS,
};
