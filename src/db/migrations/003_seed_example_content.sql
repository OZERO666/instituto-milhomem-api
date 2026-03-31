-- ============================================================
-- Migration 003 - Seed de conteudo de exemplo (Instituto Milhomem)
-- Objetivo: popular o site inteiro com conteudo inicial para demonstracao.
--
-- ATENCAO:
-- 1) Execute apos as migracoes estruturais (incluindo 002_fix_schema.sql).
-- 2) Este script substitui conteudo editorial principal em varias tabelas.
-- 3) Ajuste URLs de imagens e textos conforme necessidade.
-- ============================================================

START TRANSACTION;

SET @now = NOW();

-- ------------------------------------------------------------
-- 0) Limpeza controlada (ordem para evitar problemas de FK)
-- ------------------------------------------------------------
DELETE FROM galeria;
DELETE FROM artigos;
DELETE FROM depoimentos;
DELETE FROM servicos;
DELETE FROM blog_categorias;
DELETE FROM galeria_temas;            
DELETE FROM hero_presets;
DELETE FROM hero_config;
DELETE FROM estatisticas;
DELETE FROM contato_config;
DELETE FROM sobre_config;
DELETE FROM pages_config;
DELETE FROM seo_settings;

-- ------------------------------------------------------------
-- 1) Hero principal (home)
-- ------------------------------------------------------------
INSERT INTO hero_config (
  badge,
  titulo,
  subtitulo,
  cta_texto,
  cta_link,
  imagem_fundo,
  created_at,
  updated_at
) VALUES (
  'Referencia nacional em transplante capilar',
  'Instituto Milhomem',
  'Com Dr. Pablo Milhomem e equipe multidisciplinar para resultados naturais, seguros e definitivos.',
  'Agendar avaliacao',
  '/contato',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600',
  @now,
  @now
);

-- Presets de hero para o admin
INSERT INTO hero_presets (
  id, nome, titulo, subtitulo, cta_texto, cta_link, badge, created_at, updated_at
) VALUES
(
  '8f4dd6c8-1599-4a61-a1cd-f7df8e8f5001',
  'Padrao institucional',
  'Instituto Milhomem',
  'Excelencia medica em restauracao capilar com protocolo personalizado.',
  'Agendar avaliacao',
  '/contato',
  'Alta performance em transplante capilar',
  @now,
  @now
),
(
  '8f4dd6c8-1599-4a61-a1cd-f7df8e8f5002',
  'Campanha resultados',
  'Resultados Reais em Cada Caso',
  'Tecnica, planejamento e acompanhamento para devolver confianca.',
  'Ver resultados',
  '/resultados',
  'Antes e depois de pacientes reais',
  @now,
  @now
);

-- ------------------------------------------------------------
-- 2) Sobre a clinica
-- ------------------------------------------------------------
INSERT INTO sobre_config (
  id,
  hero_title,
  hero_subtitle,
  hero_image,
  hero_badge,
  doctor_name,
  doctor_title,
  doctor_image,
  doctor_bio,
  doctor_credentials,
  doctor_experience_number,
  doctor_experience_label,
  about_title,
  about_text,
  about_detail_text,
  about_image,
  wfi_badge,
  wfi_title,
  wfi_text,
  wfi_link,
  values_title,
  values_subtitle,
  `values`,
  team_title,
  team_subtitle,
  `team`,
  technology_title,
  technology_text,
  technology_image,
  created,
  updated
) VALUES (
  '0f0f0f0f-0000-4000-8000-000000000001',
  'Conheca Nossa Clinica',
  'Instituto especializado em transplante capilar premium, com equipe altamente treinada e foco total em naturalidade.',
  'https://images.unsplash.com/photo-1666056445151-57949bacdd60?w=1600',
  'Padrao internacional em restauracao capilar',
  'Dr. Pablo Milhomem',
  'Cirurgiao especialista em transplante capilar',
  'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=800',
  'Dr. Pablo Milhomem e referencia em transplante capilar, combinando precisao tecnica, visao estetica e atendimento humanizado em cada caso.',
  '["Membro da ISHRS","Especialista em tecnica FUE","Atualizacao continua em congressos internacionais"]',
  '15+',
  'Anos de experiencia',
  'Uma jornada focada no paciente',
  'Cada protocolo e planejado de forma individual, respeitando anatomia, objetivo estetico e previsao de evolucao.',
  'Da consulta inicial ao acompanhamento final, o Instituto Milhomem entrega seguranca, transparencia e padrao elevado de qualidade.',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
  'Reconhecimento global',
  'World FUE Institute',
  'A participacao em instituicoes internacionais reforca o compromisso da clinica com tecnologia, ciencia e resultados consistentes.',
  'https://wfiworkshops.com/',
  'Nossa filosofia',
  'Pilares que sustentam cada atendimento',
  '[{"title":"Excelencia","description":"Precisao tecnica, protocolos modernos e melhoria continua."},{"title":"Seguranca","description":"Ambiente adequado, equipe experiente e monitoramento em todas as etapas."},{"title":"Naturalidade","description":"Planejamento do desenho capilar respeitando tracos e proporcoes do paciente."},{"title":"Acolhimento","description":"Atendimento humanizado com acompanhamento proximo no pre e pos-procedimento."}]',
  'Equipe multidisciplinar',
  'Dr. Pablo Milhomem atua com enfermeiros, tricologista e anestesiologista para garantir previsibilidade e conforto.',
  '[{"name":"Dra. Ana Ribeiro","role":"Anestesiologista","image":"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800","desc":"Responsavel por conforto e seguranca do paciente durante o procedimento."},{"name":"Carlos Mendes","role":"Enfermeiro chefe","image":"https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800","desc":"Coordena instrumentacao, assepsia e padrao tecnico no centro cirurgico."},{"name":"Marina Souza","role":"Tricologista","image":"https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800","desc":"Conduz avaliacao capilar e protocolos complementares ao transplante."}]',
  'Tecnologia de vanguarda',
  'Utilizamos equipamentos de alta precisao para extracao e implantacao folicular, com foco em taxa de sobrevivencia dos enxertos e resultado final harmonico.',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
  @now,
  @now
);

-- ------------------------------------------------------------
-- 3) Servicos
-- ------------------------------------------------------------
INSERT INTO servicos (
  id, nome, slug, descricao, beneficios, processo, imagem, icon, ordem, conteudo, created, updated
) VALUES
(
  '10000000-0000-4000-8000-000000000001',
  'Transplante Capilar FUE',
  'transplante-capilar-fue',
  'Tecnica moderna para restauracao capilar com alta naturalidade.',
  'Sem cicatriz linear, retorno progressivo e resultado definitivo.',
  'Avaliacao, planejamento da linha capilar, extracao folicular e implantacao estrategica.',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1400',
  'Scissors',
  1,
  '<h2>Transplante Capilar FUE</h2><p>Procedimento com extracao individual de foliculos e implantacao personalizada para densidade e naturalidade.</p>',
  @now,
  @now
),
(
  '10000000-0000-4000-8000-000000000002',
  'Transplante de Barba',
  'transplante-de-barba',
  'Correcao de falhas e aumento de densidade da barba.',
  'Desenho personalizado, harmonizacao facial e acabamento natural.',
  'Definicao do desenho, extracao da area doadora e implantacao por angulacao.',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1400',
  'User',
  2,
  '<h2>Transplante de Barba</h2><p>Ideal para preencher falhas e reforcar contornos com resultados discretos e naturais.</p>',
  @now,
  @now
),
(
  '10000000-0000-4000-8000-000000000003',
  'Tratamentos Complementares',
  'tratamentos-complementares',
  'Protocolos clinicos para potencializar o resultado do transplante.',
  'Fortalecimento capilar, manutencao e suporte no pos-operatorio.',
  'Consulta tricologica, plano individual e acompanhamento da evolucao.',
  'https://images.unsplash.com/photo-1576671496345-cb0f6f9c2c81?w=1400',
  'Activity',
  3,
  '<h2>Tratamentos Complementares</h2><p>Abordagem integrada com foco em saude capilar de longo prazo.</p>',
  @now,
  @now
);

-- ------------------------------------------------------------
-- 4) Resultados (galeria + temas)
-- ------------------------------------------------------------
INSERT INTO galeria_temas (id, nome, descricao, created, updated) VALUES
(
  '20000000-0000-4000-8000-000000000001',
  'Transplante FUE',
  'Casos de restauracao capilar com tecnica FUE.',
  @now,
  @now
),
(
  '20000000-0000-4000-8000-000000000002',
  'Transplante de Barba',
  'Casos de definicao e preenchimento de barba.',
  @now,
  @now
);

INSERT INTO galeria (
  id, titulo, tema_id, meses_pos_operatorio, foto_antes, foto_depois, created, updated
) VALUES
(
  '21000000-0000-4000-8000-000000000001',
  'Paciente A - entradas frontais',
  '20000000-0000-4000-8000-000000000001',
  8,
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=1000',
  @now,
  @now
),
(
  '21000000-0000-4000-8000-000000000002',
  'Paciente B - recuo temporal',
  '20000000-0000-4000-8000-000000000001',
  10,
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1000',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000',
  @now,
  @now
),
(
  '21000000-0000-4000-8000-000000000003',
  'Paciente C - densidade de barba',
  '20000000-0000-4000-8000-000000000002',
  7,
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1000',
  @now,
  @now
);

-- ------------------------------------------------------------
-- 5) Depoimentos
-- ------------------------------------------------------------
INSERT INTO depoimentos (
  id, nome, cargo, mensagem, foto, created, updated
) VALUES
(
  '30000000-0000-4000-8000-000000000001',
  'Ricardo Almeida',
  'Empresario - Goiania/GO',
  'Escolhi o Instituto Milhomem pela confianca no Dr. Pablo. O resultado ficou natural e a equipe foi extremamente atenciosa em todo o processo.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  @now,
  @now
),
(
  '30000000-0000-4000-8000-000000000002',
  'Felipe Costa',
  'Advogado - Brasilia/DF',
  'Minha autoestima mudou completamente. O acompanhamento pos-procedimento foi diferencial e o resultado superou minha expectativa.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  @now,
  @now
),
(
  '30000000-0000-4000-8000-000000000003',
  'Henrique Souza',
  'Medico - Anapolis/GO',
  'Atendimento premium, estrutura excelente e equipe multidisciplinar muito bem alinhada. Recomendo sem duvidas.',
  'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=400',
  @now,
  @now
);

-- ------------------------------------------------------------
-- 6) Blog (categorias + artigos)
-- ------------------------------------------------------------
INSERT INTO blog_categorias (
  id, nome, descricao, created, updated
) VALUES
(
  '40000000-0000-4000-8000-000000000001',
  'Transplante Capilar',
  'Conteudos sobre tecnica, indicacoes e resultados.',
  @now,
  @now
),
(
  '40000000-0000-4000-8000-000000000002',
  'Saude Capilar',
  'Cuidados, prevencao e rotina para manter os fios.',
  @now,
  @now
),
(
  '40000000-0000-4000-8000-000000000003',
  'Pos-Operatorio',
  'Orientacoes para uma recuperacao segura e eficiente.',
  @now,
  @now
);

INSERT INTO artigos (
  id, titulo, slug, autor, categoria, categoria_id, conteudo, resumo, imagem_destaque, data_publicacao, created, updated
) VALUES
(
  '41000000-0000-4000-8000-000000000001',
  'Transplante Capilar FUE: como funciona na pratica',
  'transplante-capilar-fue-como-funciona',
  'Dr. Pablo Milhomem',
  'Transplante Capilar',
  '40000000-0000-4000-8000-000000000001',
  '<h2>O que e FUE?</h2><p>A tecnica FUE realiza a extracao individual dos foliculos, com alto nivel de precisao e naturalidade no resultado final.</p><h3>Etapas</h3><ul><li>Avaliacao</li><li>Planejamento</li><li>Procedimento</li><li>Acompanhamento</li></ul>',
  'Entenda as etapas do transplante capilar FUE e por que a tecnica e referencia em naturalidade.',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1400',
  @now,
  @now,
  @now
),
(
  '41000000-0000-4000-8000-000000000002',
  'Quando procurar um tricologista?',
  'quando-procurar-um-tricologista',
  'Equipe Instituto Milhomem',
  'Saude Capilar',
  '40000000-0000-4000-8000-000000000002',
  '<h2>Sinais de alerta</h2><p>Queda acentuada, afinamento progressivo e alteracoes do couro cabeludo merecem avaliacao especializada.</p>',
  'Saiba identificar os principais sinais para buscar ajuda especializada em saude capilar.',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400',
  @now,
  @now,
  @now
),
(
  '41000000-0000-4000-8000-000000000003',
  'Pos-operatorio do transplante: 10 cuidados essenciais',
  'pos-operatorio-transplante-10-cuidados',
  'Equipe Instituto Milhomem',
  'Pos-Operatorio',
  '40000000-0000-4000-8000-000000000003',
  '<h2>Recuperacao inteligente</h2><p>Seguir orientacoes medicas no pos-operatorio e fundamental para preservar enxertos e otimizar resultado.</p>',
  'Checklist pratico para um pos-operatorio seguro e com melhor evolucao dos enxertos.',
  'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1400',
  @now,
  @now,
  @now
);

-- ------------------------------------------------------------
-- 7) Estatisticas da home
-- ------------------------------------------------------------
INSERT INTO estatisticas (
  id, experiencia, pacientes, procedimentos, satisfacao, created, updated
) VALUES (
  '50000000-0000-4000-8000-000000000001',
  15,
  3200,
  5400,
  98,
  @now,
  @now
);

-- ------------------------------------------------------------
-- 8) Contato e identidade visual
-- ------------------------------------------------------------
INSERT INTO contato_config (
  id,
  email,
  telefone,
  whatsapp,
  instagram,
  facebook,
  mensagem_header,
  mensagem_whatsapp,
  endereco,
  dias_funcionamento,
  horario,
  latitude,
  longitude,
  zoom,
  logo_url,
  favicon_url,
  sobre_hero_image,
  created,
  updated
) VALUES (
  '60000000-0000-4000-8000-000000000001',
  'contato@institutomilhomem.com.br',
  '(62) 98107-0937',
  '5562981070937',
  'https://www.instagram.com/institutomilhomem',
  'https://facebook.com/institutomilhomem',
  'Ola! Gostaria de mais informacoes sobre avaliacao com o Dr. Pablo Milhomem.',
  'Ola! Vim pelo site e quero agendar minha avaliacao capilar.',
  'Setor Bueno, Goiania - GO',
  'Segunda a Sexta',
  '08h as 18h',
  '-16.6982156',
  '-49.2703605',
  16,
  'https://horizons-cdn.hostinger.com/386178fc-68a2-4ae9-99a1-df6a1385b4b9/1e20c7dbf245fee0e2ca926ad4054327.png',
  'https://horizons-cdn.hostinger.com/386178fc-68a2-4ae9-99a1-df6a1385b4b9/1e20c7dbf245fee0e2ca926ad4054327.png',
  'https://images.unsplash.com/photo-1666056445151-57949bacdd60?w=1600',
  @now,
  @now
);

-- ------------------------------------------------------------
-- 9) Configuracoes textuais por pagina (CMS)
-- ------------------------------------------------------------
INSERT INTO pages_config (id, page_key, data, created, updated) VALUES
(
  '70000000-0000-4000-8000-000000000001',
  'home',
  JSON_OBJECT(
    'services', JSON_OBJECT(
      'badge', 'Especialidades',
      'title', 'Tratamentos capilares de alta performance',
      'subtitle', 'Do transplante FUE a terapias complementares, com protocolos personalizados.',
      'cta_text', 'Ver todos os servicos'
    ),
    'journey', JSON_OBJECT(
      'badge', 'Processo',
      'title', 'A jornada do paciente',
      'cta_text', 'Iniciar minha jornada',
      'steps', JSON_ARRAY(
        JSON_OBJECT('step', 1, 'title', 'Avaliacao', 'desc', 'Analise capilar detalhada e definicao de metas realistas.'),
        JSON_OBJECT('step', 2, 'title', 'Planejamento', 'desc', 'Desenho da linha capilar e estrategia de distribuicao dos enxertos.'),
        JSON_OBJECT('step', 3, 'title', 'Procedimento', 'desc', 'Execucao com foco em seguranca, conforto e precisao.'),
        JSON_OBJECT('step', 4, 'title', 'Acompanhamento', 'desc', 'Suporte continuo ate consolidacao do resultado final.')
      )
    ),
    'about', JSON_OBJECT(
      'badge', 'O Instituto',
      'title', 'Excelencia e dedicacao',
      'highlight', 'em cada foliculo',
      'paragraph_1', 'No Instituto Milhomem, cada caso e planejado para unir naturalidade e previsibilidade.',
      'paragraph_2', 'A equipe acompanha voce do pre ao pos-procedimento com transparencia total.',
      'cta_text', 'Conheca nossa clinica',
      'images', JSON_ARRAY(
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400'
      ),
      'card_text', 'Avaliacao sem compromisso',
      'card_button_text', 'Agendar agora'
    ),
    'results', JSON_OBJECT(
      'badge', 'Galeria',
      'title', 'Resultados que transformam',
      'subtitle', 'A evolucao de pacientes reais acompanhados pela nossa equipe.',
      'cta_text', 'Ver galeria completa'
    ),
    'testimonials', JSON_OBJECT(
      'badge', 'Depoimentos',
      'title', 'O que dizem nossos pacientes',
      'subtitle', 'Relatos de quem confiou no Instituto Milhomem para recuperar autoestima.'
    ),
    'blog', JSON_OBJECT(
      'badge', 'Conteudo',
      'title', 'Ultimas do blog',
      'cta_text', 'Ver todos os artigos',
      'empty_title', 'Nenhum artigo publicado ainda.',
      'empty_subtitle', 'Volte em breve.'
    ),
    'final_cta', JSON_OBJECT(
      'badge', 'Agendamento',
      'title', 'Pronto para dar o primeiro passo?',
      'subtitle', 'Agende uma avaliacao com o Instituto Milhomem e receba um plano personalizado.',
      'primary_cta_text', 'Agendar pelo WhatsApp',
      'secondary_cta_text', 'Ver todas as formas de contato'
    )
  ),
  @now,
  @now
),
(
  '70000000-0000-4000-8000-000000000002',
  'servicos',
  JSON_OBJECT(
    'header_badge', 'Especialidades',
    'header_title', 'Nossos Servicos',
    'header_subtitle', 'Tecnicas modernas de restauracao capilar com foco em resultado natural e duradouro.'
  ),
  @now,
  @now
),
(
  '70000000-0000-4000-8000-000000000003',
  'blog',
  JSON_OBJECT(
    'header_badge', 'Conteudo',
    'header_title', 'Blog',
    'header_subtitle', 'Artigos sobre transplante capilar, saude dos fios e cuidados pos-procedimento.',
    'all_categories_label', 'Todos',
    'search_placeholder', 'Pesquisar artigos...',
    'empty_title', 'Nenhum artigo encontrado nesta categoria.',
    'empty_subtitle', 'Tente outro filtro ou termo de busca.'
  ),
  @now,
  @now
),
(
  '70000000-0000-4000-8000-000000000004',
  'contato',
  JSON_OBJECT(
    'header_badge', 'Atendimento',
    'header_title', 'Entre em',
    'header_highlight', 'Contato',
    'header_subtitle', 'Solicite sua avaliacao e tire duvidas com nossa equipe.',
    'form_title', 'Envie uma mensagem',
    'info_title', 'Informacoes de contato'
  ),
  @now,
  @now
),
(
  '70000000-0000-4000-8000-000000000005',
  'resultados',
  JSON_OBJECT(
    'header_badge', 'Galeria',
    'header_title', 'Resultados Reais',
    'header_subtitle', 'Acompanhe a transformacao de pacientes do Instituto Milhomem.',
    'testimonials_badge', 'Depoimentos',
    'testimonials_title', 'O que nossos pacientes dizem'
  ),
  @now,
  @now
),
(
  '70000000-0000-4000-8000-000000000006',
  'footer',
  JSON_OBJECT(
    'description', 'Clinica especializada em transplante capilar com excelencia tecnica e atendimento premium.',
    'rights_text', 'Instituto Milhomem. Todos os direitos reservados.',
    'credits_text', 'Desenvolvido para Dr. Pablo Milhomem'
  ),
  @now,
  @now
),
(
  '70000000-0000-4000-8000-000000000007',
  'service_detail',
  JSON_OBJECT(
    'breadcrumb_home', 'Inicio',
    'breadcrumb_services', 'Servicos',
    'loading_text', 'Carregando...',
    'not_found_title', 'Servico nao encontrado',
    'not_found_subtitle', 'O servico que voce procura nao existe ou foi removido.',
    'not_found_button', 'Ver todos os servicos',
    'hero_badge', 'Servico',
    'hero_cta_text', 'Agendar avaliacao',
    'benefits_title', 'Beneficios',
    'sidebar_title', 'Quer saber mais?',
    'sidebar_text_prefix', 'Fale com nossa equipe e tire duvidas sobre',
    'sidebar_button', 'Falar no WhatsApp',
    'back_to_services', 'Ver todos os servicos',
    'related_badge', 'Veja tambem',
    'related_title', 'Outros servicos'
  ),
  @now,
  @now
),
(
  '70000000-0000-4000-8000-000000000008',
  'blog_post',
  JSON_OBJECT(
    'loading_text', 'Carregando artigo...',
    'not_found_title', 'Artigo nao encontrado',
    'back_to_blog', 'Voltar para o blog',
    'related_title', 'Artigos relacionados',
    'related_cta', 'Ler artigo'
  ),
  @now,
  @now
),
(
  '70000000-0000-4000-8000-000000000009',
  'labels',
  JSON_OBJECT(
    'service_card_cta', 'Saiba mais',
    'blog_card_cta', 'Ler artigo',
    'before_after_empty', 'Nenhum resultado encontrado para este tema.',
    'testimonials_empty', 'Nenhum depoimento cadastrado ainda.'
  ),
  @now,
  @now
);

-- ------------------------------------------------------------
-- 10) SEO para paginas principais
-- ------------------------------------------------------------
INSERT INTO seo_settings (
  id, page_name, meta_title, meta_description, keywords, og_image, created, updated
) VALUES
(
  'seo_home_0001',
  'home',
  'Instituto Milhomem | Transplante Capilar em Goiania',
  'Clinica especializada em transplante capilar com Dr. Pablo Milhomem e equipe multidisciplinar.',
  'transplante capilar, dr pablo milhomem, fue goiania, instituto milhomem',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200',
  @now,
  @now
),
(
  'seo_srv_0002',
  'servicos',
  'Servicos | Instituto Milhomem',
  'Conheca os servicos de transplante capilar, transplante de barba e protocolos complementares.',
  'servicos transplante capilar, transplante barba, clinica capilar goiania',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1200',
  @now,
  @now
),
(
  'seo_sob_0003',
  'sobre',
  'Sobre o Instituto Milhomem | Dr. Pablo Milhomem',
  'Conheca a historia, estrutura e equipe especializada do Instituto Milhomem.',
  'sobre instituto milhomem, dr pablo milhomem, equipe transplante capilar',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
  @now,
  @now
),
(
  'seo_res_0004',
  'resultados',
  'Resultados Reais | Instituto Milhomem',
  'Veja antes e depois de pacientes e depoimentos reais sobre transplante capilar.',
  'resultados transplante capilar, antes e depois, depoimentos',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200',
  @now,
  @now
),
(
  'seo_blog_0005',
  'blog',
  'Blog | Instituto Milhomem',
  'Artigos sobre transplante capilar, saude dos fios e cuidados pos-procedimento.',
  'blog transplante capilar, saude capilar, pos operatorio',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200',
  @now,
  @now
),
(
  'seo_cont_0006',
  'contato',
  'Contato | Instituto Milhomem',
  'Agende sua avaliacao capilar com o Instituto Milhomem em Goiania.',
  'contato instituto milhomem, agendar avaliacao capilar, goiania',
  'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1200',
  @now,
  @now
) ON DUPLICATE KEY UPDATE
  page_name = VALUES(page_name),
  meta_title = VALUES(meta_title),
  meta_description = VALUES(meta_description),
  keywords = VALUES(keywords),
  og_image = VALUES(og_image),
  updated = VALUES(updated);

-- ------------------------------------------------------------
-- 11) Agendamentos de exemplo (painel admin)
-- ------------------------------------------------------------
INSERT INTO agendamentos (
  id, nome, email, telefone, tipo_servico, mensagem, lido, created, updated
) VALUES
(
  '90000000-0000-4000-8000-000000000001',
  'Joao Pereira',
  'joao.pereira@email.com',
  '(62) 99999-1111',
  'Transplante Capilar FUE',
  'Gostaria de agendar uma avaliacao para entender quantidade de enxertos e valores.',
  0,
  @now,
  @now
),
(
  '90000000-0000-4000-8000-000000000002',
  'Marcos Silva',
  'marcos.silva@email.com',
  '(62) 98888-2222',
  'Transplante de Barba',
  'Tenho falhas na barba e quero saber se sou candidato ao procedimento.',
  0,
  @now,
  @now
);

COMMIT;
