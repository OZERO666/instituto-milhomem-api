// src/config/site.js

export const LOGO_URL =
  'https://horizons-cdn.hostinger.com/386178fc-68a2-4ae9-99a1-df6a1385b4b9/1e20c7dbf245fee0e2ca926ad4054327.png';

export const FAVICON_URL = LOGO_URL;
export const SOBRE_HERO_URL = '';

export const NAV_ITEMS = [
  { name: 'Home',       path: '/',           key: 'home'     },
  { name: 'Serviços',   path: '/servicos',   key: 'services' },
  { name: 'Sobre',      path: '/sobre',      key: 'about'    },
  { name: 'Resultados', path: '/resultados', key: 'results'  },
  { name: 'Blog',       path: '/blog',       key: 'blog'     },
  { name: 'FAQ',        path: '/faq',        key: 'faq'      },
  { name: 'Contato',    path: '/contato',    key: 'contact'  },
];

export const CONTATO_DEFAULTS = {
  whatsapp:            '5562981070937',
  telefone:            '(62) 98107-0937',
  email:               'contato@institutomilhomem.com',
  endereco:            'R. T-52, 70 - St. Bueno, Goiânia - GO',
  maps_url:            'https://maps.app.goo.gl/YcVtP8yPgCn1XERv7',
  instagram:           'https://www.instagram.com/institutomilhomem',
  facebook:            'https://facebook.com/institutomilhomem',
  dias_funcionamento:  'Segunda a Sexta',
  horario:             '8h às 17h',
  mensagem_header:     'Olá! Gostaria de mais informações sobre o atendimento do Dr. Pablo Milhomem.',
  logo_url:            LOGO_URL,
  favicon_url:         FAVICON_URL,
  sobre_hero_image:    SOBRE_HERO_URL,
};

export const SOBRE_DEFAULTS = {
  // Hero
  hero_title: 'Conheça Nossa Clínica',
  hero_subtitle: 'Um ambiente onde a equipe especializada une tecnologia de ponta e acolhimento premium para resultados naturais.',
  hero_image: SOBRE_HERO_URL,
  hero_badge: 'Padrão Internacional',

  // Doctor
  doctor_name: 'Dr. Pablo Milhomem',
  doctor_title: 'Fundador & Cirurgião Chefe',
  doctor_image: '',
  doctor_bio: 'Especialista dedicado exclusivamente à arte e ciência do transplante capilar. Com formação rigorosa e constante atualização nos maiores centros de referência mundial, o Dr. Pablo construiu o Instituto Milhomem sobre o pilar da excelência absoluta.\n\nSua abordagem une a precisão cirúrgica a um apurado senso estético, garantindo que cada folículo seja posicionado para criar densidade, naturalidade e harmonia com os traços faciais do paciente.',
  doctor_credentials: [
    'Membro da International Society of Hair Restoration Surgery (ISHRS)',
    'Especialista em Técnica FUE e Preview Long Hair',
    'Milhares de procedimentos realizados com sucesso',
  ],
  doctor_experience_number: '15+',
  doctor_experience_label: 'Anos de Experiência',

  // WFI
  wfi_badge: 'Reconhecimento Global',
  wfi_title: 'World FUE Institute',
  wfi_text: 'O Dr. Pablo Milhomem é membro ativo e instrutor convidado do World FUE Institute (WFI), uma das mais prestigiadas organizações internacionais dedicadas ao avanço e ensino da técnica FUE. Este reconhecimento atesta o compromisso do Instituto Milhomem com os mais altos padrões globais de qualidade e inovação em restauração capilar.',
  wfi_link: 'https://wfiworkshops.com/',

  // About
  about_title: 'Uma jornada construída para transformar vidas',
  about_text: 'No Instituto Milhomem, cada caso é tratado com exclusividade. Nossa clínica combina protocolos avançados, atendimento humanizado e total transparência em todas as etapas do transplante capilar.',
  about_detail_text: 'Cada detalhe da nossa clínica foi projetado para oferecer conforto, segurança e resultados excepcionais. Da recepção acolhedora ao centro cirúrgico de última geração, tudo é pensado para proporcionar uma experiência premium ao paciente.',
  about_image: '',

  // Values
  values_title: 'Nossa Filosofia',
  values_subtitle: '',
  values: [
    { title: 'Excelência', description: 'Busca incessante pela perfeição em cada detalhe, com protocolos internacionais.' },
    { title: 'Discrição', description: 'Atendimento sigiloso e ambiente privativo para sua segurança e conforto.' },
    { title: 'Conforto', description: 'Infraestrutura premium pensada para tornar cada visita mais tranquila e acolhedora.' },
    { title: 'Inovação', description: 'Tecnologia de ponta e métodos modernos para resultados mais naturais e duradouros.' },
  ],

  // Team
  team_title: 'Equipe Multidisciplinar',
  team_subtitle: 'O sucesso de um transplante capilar depende de uma equipe perfeitamente sincronizada. Nossos profissionais são altamente treinados para garantir segurança e resultados impecáveis.',
  team: [
    { name: 'Dra. Ana Silva', role: 'Anestesiologista', image: '', desc: 'Especialista em conforto e segurança do paciente durante todo o procedimento.' },
    { name: 'Carlos Mendes', role: 'Enfermeiro Chefe', image: '', desc: 'Coordena a equipe de instrumentação com precisão cirúrgica e cuidado humanizado.' },
    { name: 'Mariana Costa', role: 'Tricologista Clínica', image: '', desc: 'Responsável pelos tratamentos complementares e preparo do couro cabeludo.' },
  ],

  // Technology
  technology_title: 'Tecnologia de Vanguarda',
  technology_text: 'Utilizamos microscópios de alta resolução para a lapidação dos folículos e extratores motorizados de precisão milimétrica. Isso garante a integridade de cada unidade folicular, maximizando a taxa de sobrevivência e o volume final do transplante.\n\nNossos protocolos de anestesia local computadorizada proporcionam um procedimento praticamente indolor, permitindo que você relaxe, assista a um filme ou ouça música durante a cirurgia.',
  technology_image: '',
};

export const PAGE_CONFIG_DEFAULTS = {
  home: {
    services: {
      badge: 'Especialidades',
      title: 'Tratamentos capilares de alta performance',
      subtitle: 'Do transplante FUE a terapias complementares - cada protocolo pensado para o seu caso.',
      cta_text: 'Ver todos os serviços',
    },
    journey: {
      badge: 'Processo',
      title: 'A Jornada do Paciente',
      cta_text: 'Iniciar minha jornada',
      steps: [
        { step: 1, title: 'Avaliação', desc: 'Análise detalhada do couro cabeludo e definição da estratégia.' },
        { step: 2, title: 'Planejamento', desc: 'Desenho da linha capilar e cálculo preciso de enxertos.' },
        { step: 3, title: 'Procedimento', desc: 'Realização com anestesia local, conforto e segurança máxima.' },
        { step: 4, title: 'Acompanhamento', desc: 'Suporte contínuo até o resultado final definitivo.' },
      ],
    },
    about: {
      badge: 'O Instituto',
      title: 'Excelência e dedicação',
      highlight: 'em cada folículo',
      paragraph_1: 'O Instituto Milhomem nasceu para devolver algo maior do que cabelo: a segurança de se olhar no espelho e se reconhecer de novo. Unimos tecnologia de ponta com um olhar estético cuidadoso em cada caso.',
      paragraph_2: 'Aqui você é acompanhado pelo mesmo time do começo ao fim — com transparência, previsibilidade de resultados e suporte completo no pré e pós-operatório.',
      cta_text: 'Conheça nossa clínica',
      images: [],
      card_text: 'Avaliação\nsem compromisso',
      card_button_text: 'Agendar agora',
    },
    results: {
      badge: 'Galeria',
      title: 'Resultados que transformam',
      subtitle: 'Acompanhe a evolução real de nossos pacientes. Passe o mouse para ver o antes e depois.',
      cta_text: 'Ver galeria completa',
    },
    testimonials: {
      badge: 'Depoimentos',
      title: 'O que dizem nossos pacientes',
      subtitle: 'Histórias reais de pessoas que recuperaram a autoestima com o Instituto Milhomem.',
    },
    blog: {
      badge: 'Conteúdo',
      title: 'Últimas do Blog',
      cta_text: 'Ver todos os artigos',
      empty_title: 'Nenhum artigo publicado ainda.',
      empty_subtitle: 'Volte em breve!',
    },
    final_cta: {
      badge: 'Agendamento',
      title: 'Pronto para dar o primeiro passo?',
      subtitle: 'Agende uma avaliação com o time do Instituto Milhomem e receba um plano personalizado para o seu caso, sem compromisso de realização do procedimento.',
      primary_cta_text: 'Agendar pelo WhatsApp',
      secondary_cta_text: 'Ver todas as formas de contato',
    },
  },
  servicos: {
    header_badge: 'Especialidades',
    header_title: 'Nossos Serviços',
    header_subtitle: 'Oferecemos as técnicas mais modernas e seguras do mundo para restauração capilar, sempre com foco em resultados naturais, definitivos e atendimento personalizado.',
  },
  blog: {
    header_badge: 'Conteúdo',
    header_title: 'Blog',
    header_subtitle: 'Informações, dicas e novidades sobre transplante capilar, saúde dos fios e tratamentos avançados.',
    all_categories_label: 'Todos',
    search_placeholder: 'Pesquisar artigos...',
    empty_title: 'Nenhum artigo encontrado nesta categoria.',
    empty_subtitle: 'Tente ajustar os filtros ou pesquisar por outro termo.',
  },
  contato: {
    header_badge: 'Atendimento',
    header_title: 'Entre em',
    header_highlight: 'Contato',
    header_subtitle: 'Agende sua avaliação gratuita e tire todas as suas dúvidas sobre nossos tratamentos capilares.',
    form_title: 'Envie uma mensagem',
    info_title: 'Informações de Contato',
  },
  resultados: {
    header_badge: 'Galeria',
    header_title: 'Resultados Reais',
    header_subtitle: 'Acompanhe a transformação de nossos pacientes através de fotos antes e depois e depoimentos autênticos.',
    testimonials_badge: 'Depoimentos',
    testimonials_title: 'O que nossos pacientes dizem',
  },
  footer: {
    description: 'Especialista em procedimentos estéticos e cirurgias plásticas com excelência, segurança e resultados naturais.',
    rights_text: 'Instituto Milhomem. Todos os direitos reservados.',
    credits_text: 'Desenvolvido com excelencia para o Dr. Pablo Milhomem',
  },
  service_detail: {
    breadcrumb_home: 'Início',
    breadcrumb_services: 'Serviços',
    loading_text: 'Carregando...',
    not_found_title: 'Serviço não encontrado',
    not_found_subtitle: 'O serviço que você procura não existe ou foi removido.',
    not_found_button: 'Ver todos os serviços',
    hero_badge: 'Serviço',
    hero_cta_text: 'Agendar Avaliação',
    benefits_title: 'Benefícios',
    sidebar_title: 'Quer saber mais?',
    sidebar_text_prefix: 'Fale com nossa equipe e tire todas as suas dúvidas sobre',
    sidebar_button: 'Falar no WhatsApp',
    back_to_services: 'Ver todos os serviços',
    related_badge: 'Veja também',
    related_title: 'Outros Serviços',
  },
  blog_post: {
    loading_text: 'Carregando artigo...',
    not_found_title: 'Artigo não encontrado',
    back_to_blog: 'Voltar para o blog',
    related_title: 'Artigos Relacionados',
    related_cta: 'Ler artigo',
  },
  labels: {
    service_card_cta: 'Saiba mais',
    blog_card_cta: 'Ler artigo',
    before_after_empty: 'Nenhum resultado encontrado para este tema.',
    testimonials_empty: 'Nenhum depoimento cadastrado ainda.',
  },
};
