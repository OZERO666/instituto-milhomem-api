import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, MapPin, Phone, Mail, Clock,
  Star, Shield, Award, ChevronRight, Gem,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTraducoes } from '@/hooks/useTraducoes';
import { useTraducoesMulti } from '@/hooks/useTraducoesMulti';
import SEO               from '@/components/SEO.jsx';
import WhatsAppButton    from '@/components/WhatsAppButton.jsx';
import ServiceCard       from '@/components/ServiceCard.jsx';
import BlogCard          from '@/components/BlogCard.jsx';
import BeforeAfterCarousel  from '@/components/BeforeAfterCarousel.jsx';
import TestimonialsCarousel from '@/components/TestimonialsCarousel.jsx';
import { usePagesConfig } from '@/hooks/usePagesConfig';
import api from '@/lib/apiServerClient';

// ─── Constantes ───────────────────────────────────────────────────────────────
const DEFAULTS = {
  whatsapp:           '62981070937',
  mensagem_whatsapp:  'Olá! Gostaria de mais informações sobre o atendimento do Dr. Pablo Milhomem.',
  telefone:           '(62) 98107-0937',
  email:              'contato@institutomilhomem.com',
  endereco:           'Setor Bueno\nGoiânia - GO',
  dias_funcionamento: 'Segunda a Sexta',
  horario:            '8h às 18h',
  latitude:           '-16.6982156',
  longitude:          '-49.2703605',
};

const DEFAULT_STATS = {
  procedimentos: 3500,
  satisfacao:    98,
  experiencia:   15,
};

// ─── Animações ────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0  },
  viewport:    { once: true        },
  transition:  { duration: 0.6, ease: 'easeOut', delay },
});
const fadeLeft = (delay = 0) => ({
  initial:     { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0   },
  viewport:    { once: true         },
  transition:  { duration: 0.6, ease: 'easeOut', delay },
});
const fadeRight = (delay = 0) => ({
  initial:     { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0  },
  viewport:    { once: true        },
  transition:  { duration: 0.6, ease: 'easeOut', delay },
});

// ─── Sub-componentes ──────────────────────────────────────────────────────────
const SectionBadge = ({ label, center = false }) => (
  <div className={`flex items-center gap-3 mb-4 ${center ? 'justify-center' : ''}`}>
    <div className="w-8 h-px bg-primary" />
    <span className="text-primary font-bold uppercase tracking-[0.18em] text-[10px]">
      {label}
    </span>
    {center && <div className="w-8 h-px bg-primary" />}
  </div>
);

const GoldDivider = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
    <Gem className="w-3 h-3 text-primary/60" />
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
  </div>
);

const ContactInfoCard = ({ icon: Icon, title, children }) => (
  <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border/60 shadow-sm
                  hover:border-primary/30 hover:shadow-md group
                  transition-all duration-300 flex flex-col gap-3 min-w-0 overflow-hidden">
    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center
                    text-primary border border-primary/15 shrink-0
                    group-hover:bg-primary/20 transition-colors duration-300">
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0 overflow-hidden">
      <h3 className="font-bold text-xs text-foreground mb-1 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  </div>
);

const BlogSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="skeleton h-48 w-full" />
        <div className="p-6 space-y-3">
          <div className="skeleton h-3 w-1/3 rounded" />
          <div className="skeleton h-5 w-full rounded" />
          <div className="skeleton h-3 w-5/6 rounded" />
          <div className="skeleton h-3 w-2/3 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Componente Principal ─────────────────────────────────────────────────────
const HomePage = () => {
  const { t } = useTranslation();
  const homePageConfig = usePagesConfig('home');
  const labelsConfig = usePagesConfig('labels');

  // Traduções dinâmicas do banco
  const { applyList: applyServices }     = useTraducoesMulti('servicos');
  const { applyList: applyTestimonials } = useTraducoesMulti('depoimentos');
  const { applyList: applyArticles }     = useTraducoesMulti('artigos');

  const [recentArticles, setRecentArticles] = useState([]);
  const [services,       setServices]       = useState([]);
  const [stats,          setStats]          = useState(DEFAULT_STATS);
  const [contactConfig,  setContactConfig]  = useState(null);
  const [testimonials,   setTestimonials]   = useState([]);
  const [blogLoading,    setBlogLoading]    = useState(true);
  const [heroLoading,    setHeroLoading]    = useState(true);
  const [heroConfig,     setHeroConfig]     = useState(null);
  const { apply: applyHeroTrad } = useTraducoes('hero_config', heroConfig?.id);
  const { apply: applyContactTrad } = useTraducoes('contato_config', contactConfig?.id);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [
          articlesRes,
          servicesRes,
          statsRes,
          configRes,
          testimonialsRes,
          heroRes,
        ] = await Promise.all([
          api.fetch('/artigos').then(r => r.json()),
          api.fetch('/servicos').then(r => r.json()),
          api.fetch('/estatisticas').then(r => r.json()),
          api.fetch('/contato-config').then(r => r.json()),
          api.fetch('/depoimentos').then(r => r.json()),
          api.fetch('/hero-config').then(r => r.json()).catch(() => null),
        ]);

        if (cancelled) return;

        setRecentArticles(
          Array.isArray(articlesRes)
            ? articlesRes
                .sort((a, b) => new Date(b.data_publicacao) - new Date(a.data_publicacao))
                .slice(0, 3)
            : []
        );
        setServices(
          Array.isArray(servicesRes)
            ? servicesRes.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)).slice(0, 4)
            : []
        );
        const s = Array.isArray(statsRes) ? statsRes[0] : statsRes;
        if (s) setStats(s);
        const c = Array.isArray(configRes) ? configRes[0] : configRes;
        if (c) setContactConfig(c);
        setTestimonials(Array.isArray(testimonialsRes) ? testimonialsRes : []);

        const hc = Array.isArray(heroRes) ? heroRes[0] : heroRes;
        if (hc && hc.id) setHeroConfig(hc);
      } catch (err) {
        if (!cancelled) console.error('Erro ao buscar dados da homepage:', err);
      } finally {
        if (!cancelled) {
          setBlogLoading(false);
          setHeroLoading(false);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const get = useCallback(
    (field) => (applyContactTrad(contactConfig) ?? {})[field] ?? DEFAULTS[field],
    [contactConfig, applyContactTrad]
  );

  const whatsappUrl = `https://api.whatsapp.com/send?l=pt-BR&phone=${get('whatsapp').replace(/\D/g, '')}&text=${encodeURIComponent(get('mensagem_whatsapp'))}`;
  const homeJourneySteps = homePageConfig?.journey?.steps || [];
  const aboutGalleryImages = homePageConfig?.about?.images || [];
  const aboutCardText = homePageConfig?.about?.card_text || '';

  // ─── Helpers do Hero dinâmico ─────────────────────────────────────────────
  const translatedHero = applyHeroTrad(heroConfig);
  const heroBadge      = translatedHero?.badge?.trim() || 'Referência em Transplante Capilar — Goiânia';
  const heroTitle      = translatedHero?.titulo?.trim() || 'Transplante capilar natural e definitivo em Goiânia';
  const heroSubtitle   = translatedHero?.subtitulo?.trim()
    || 'Técnica FUE de última geração, sem cicatriz linear, com planejamento personalizado para cada paciente.';
  const heroCtaText    = translatedHero?.cta_texto?.trim() || 'Agendar Avaliação';
  const heroCtaLink    = heroConfig?.cta_link?.trim() || whatsappUrl;

  return (
    <div className="flex flex-col min-h-screen">
      <SEO />
      <WhatsAppButton />

      <main className="flex-grow">

        {/* ══════════════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[calc(100svh-72px)] flex flex-col overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={heroConfig?.imagem_fundo?.trim() || ''}
              alt="Homem confiante após transplante capilar"
              className="w-full h-full object-cover object-top scale-[1.03]"
              fetchPriority="high"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/30 to-transparent" />
          <div
            aria-hidden
            className="absolute left-[52%] top-0 bottom-0 w-px opacity-[0.08]"
            style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--primary)), transparent)' }}
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-[0.06] border border-primary"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)' }}
          />

          <div className="container-custom relative z-10 flex-1 flex flex-col justify-center py-8 md:py-20">
            {heroLoading ? (
              /* ── Skeleton enquanto carrega ── */
              <div className="max-w-3xl space-y-6 animate-pulse">
                <div className="h-8 w-80 bg-white/10 rounded-full" />
                <div className="space-y-3">
                  <div className="h-14 w-full bg-white/10 rounded-xl" />
                  <div className="h-14 w-4/5 bg-white/10 rounded-xl" />
                </div>
                <div className="h-px w-36 bg-primary/30" />
                <div className="space-y-2">
                  <div className="h-5 w-full bg-white/8 rounded" />
                  <div className="h-5 w-4/5 bg-white/8 rounded" />
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="h-12 w-48 bg-primary/20 rounded-xl" />
                  <div className="h-12 w-48 bg-white/8 rounded-xl" />
                </div>
              </div>
            ) : (
              <motion.div
                className="max-w-3xl"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              >
                {/* Badge */}
                <motion.div
                  className="inline-flex items-center gap-2.5 bg-primary/10 border border-primary/25
                             text-primary px-5 py-2 rounded-full text-[10px] font-bold uppercase
                             tracking-[0.1em] mb-6 md:mb-10 backdrop-blur-sm"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Star className="w-3 h-3 fill-primary" />
                  {heroBadge}
                </motion.div>

                {/* Título */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold text-white
                               mb-6 leading-[1.1] tracking-tight uppercase">
                  {heroTitle}
                </h1>

                <div className="flex items-center gap-4 mb-4 md:mb-8 max-w-xs">
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/60 to-transparent" />
                  <Gem className="w-3.5 h-3.5 text-primary/70" />
                </div>

                <p className="text-base md:text-xl text-white/80 mb-4 md:mb-10 leading-relaxed max-w-xl font-light">
                  {heroSubtitle}
                </p>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-4 md:mb-10
                                text-white/70 text-[10px] font-bold uppercase tracking-[0.15em]">
                  {[
                    { icon: Shield, label: t('hero.trust_team',    'Equipe médica especializada')  },
                    { icon: Award,  label: t('hero.trust_results', 'Resultados naturais comprovados') },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={heroCtaLink}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center justify-center gap-3
                               px-8 py-4 text-sm rounded-xl shadow-gold uppercase tracking-wide font-bold"
                  >
                    {heroCtaText}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#resultados"
                    className="inline-flex items-center justify-center gap-3
                               border border-white/20 text-white bg-white/5 backdrop-blur-sm
                               px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wide
                               hover:bg-white/10 hover:border-primary/50
                               transition-all duration-300 active:scale-[0.98]"
                  >
                    {t('hero.see_results', 'Ver Resultados')}
                  </a>
                </div>
              </motion.div>
            )}
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <span className="text-[9px] uppercase tracking-[0.3em]">{t('hero.scroll', 'Role')}</span>
            <motion.div
              className="w-5 h-8 border border-white/15 rounded-full flex items-start justify-center p-1"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
            >
              <div className="w-1 h-2 bg-primary rounded-full" />
            </motion.div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SERVIÇOS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <motion.div className="max-w-2xl" {...fadeLeft()}>
                <SectionBadge label={homePageConfig.services.badge} />
                <h2 className="heading-lg text-foreground mb-2">
                  {homePageConfig.services.title}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mt-2">
                  {homePageConfig.services.subtitle}
                </p>
                <GoldDivider className="mt-5 max-w-[200px]" />
              </motion.div>
              <motion.div {...fadeRight(0.2)}>
                <Link
                  to="/servicos"
                  className="inline-flex items-center gap-2 text-primary font-bold
                             hover:text-primary/70 transition-colors duration-300
                             uppercase tracking-widest text-xs group"
                >
                  {homePageConfig.services.cta_text}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {applyServices(services).map((service, index) => (
                <ServiceCard
                  key={service.id}
                  {...service}
                  index={index}
                  icon={service.icon}
                  ctaLabel={labelsConfig.service_card_cta}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            JORNADA DO PACIENTE
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-padding bg-muted border-t border-border/40 relative overflow-hidden">
          <div className="container-custom">
            <motion.div className="text-center mb-14" {...fadeUp()}>
              <SectionBadge label={homePageConfig.journey.badge} center />
              <h2 className="heading-lg text-foreground mb-3">{homePageConfig.journey.title}</h2>
              <GoldDivider className="max-w-[160px] mx-auto" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 max-w-5xl mx-auto">
              {homeJourneySteps.map(({ step, title, desc }, i) => (
                <motion.div
                  key={step}
                  className="flex flex-col items-center text-center relative"
                  {...fadeUp(i * 0.12)}
                >
                  {i < homeJourneySteps.length - 1 && (
                    <div
                      aria-hidden
                      className="hidden md:block absolute top-8 left-1/2 w-full h-px
                                 bg-gradient-to-r from-primary/40 to-primary/10 z-0"
                    />
                  )}
                  <div className="relative z-10 w-16 h-16 bg-primary text-primary-foreground
                                  rounded-full flex items-center justify-center font-extrabold
                                  text-2xl mb-5 shadow-lg shadow-primary/30 ring-4 ring-primary/10">
                    {step}
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2 uppercase tracking-wide">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[180px]">
                    {desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div className="text-center mt-14" {...fadeUp(0.5)}>
              <a
                href={whatsappUrl}
                target="_blank" rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-3 rounded-xl px-8 py-4 text-sm"
              >
                {homePageConfig.journey.cta_text}
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SOBRE
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-padding bg-background relative overflow-hidden">
          <div
            aria-hidden
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-40
                       bg-gradient-to-b from-transparent via-primary to-transparent rounded-full"
          />

          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              <motion.div {...fadeLeft()}>
                <SectionBadge label={homePageConfig.about.badge} />
                <h2 className="heading-lg text-foreground mb-3">
                  {homePageConfig.about.title}<br />
                  <span className="text-primary">{homePageConfig.about.highlight}</span>
                </h2>
                <GoldDivider className="mb-8 max-w-[180px]" />

                <p className="text-base text-muted-foreground leading-relaxed mb-5">
                  {homePageConfig.about.paragraph_1}
                </p>
                <p className="text-base text-muted-foreground leading-relaxed mb-10">
                  {homePageConfig.about.paragraph_2}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                  {[
                    {
                      num:   stats.procedimentos ? `+${Number(stats.procedimentos).toLocaleString('pt-BR')}` : '+3.500',
                      label: 'Procedimentos realizados',
                    },
                    {
                      num:   stats.satisfacao ? `${stats.satisfacao}%` : '98%',
                      label: 'Pacientes satisfeitos',
                    },
                    {
                      num:   stats.experiencia ? `+${stats.experiencia}` : '+15',
                      label: 'Anos de experiência',
                    },
                  ].map(({ num, label }) => (
                    <div
                      key={label}
                      className="bg-card border border-border/60 rounded-xl p-3 sm:p-4 text-center
                                 hover:border-primary/40 hover:shadow-md
                                 transition-all duration-300 group"
                    >
                      <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary mb-1
                                      group-hover:scale-105 transition-transform duration-300">
                        {num}
                      </div>
                      <div className="w-5 h-px bg-primary/30 mx-auto my-1.5
                                      group-hover:w-8 group-hover:bg-primary
                                      transition-all duration-500" />
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-medium leading-tight">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/sobre"
                  className="btn-primary inline-flex items-center gap-3 rounded-xl px-7 py-3.5 text-sm"
                >
                  {homePageConfig.about.cta_text}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Foto collage */}
              <motion.div className="grid grid-cols-2 gap-4" {...fadeRight(0.15)}>
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden h-56 border border-border/40 shadow-lg">
                    <img
                      src={aboutGalleryImages[0]}
                      alt="Clínica Instituto Milhomem"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden h-36 border border-border/40 shadow-lg">
                    <img
                      src={aboutGalleryImages[1]}
                      alt="Equipamentos avançados"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden h-36 border border-border/40 shadow-lg">
                    <img
                      src={aboutGalleryImages[2]}
                      alt="Atendimento personalizado"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="rounded-2xl bg-secondary border border-primary/30 shadow-lg
                                  p-6 flex flex-col items-center justify-center text-center h-56 gap-3">
                    <Gem className="w-8 h-8 text-primary" />
                    <p className="text-white font-bold text-sm leading-snug">
                      {aboutCardText.split('\n').map((line, idx) => (
                        <React.Fragment key={`${line}-${idx}`}>
                          {line}
                          {idx < aboutCardText.split('\n').length - 1 ? <br /> : null}
                        </React.Fragment>
                      ))}
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-1 text-[10px] font-bold uppercase tracking-widest
                                 text-primary border border-primary/30 px-4 py-2 rounded-lg
                                 hover:bg-primary hover:text-secondary transition-all duration-300"
                    >
                      {homePageConfig.about.card_button_text}
                    </a>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            RESULTADOS
        ══════════════════════════════════════════════════════════════════ */}
        <section id="resultados" className="section-padding bg-muted relative overflow-hidden">
          <div
            aria-hidden
            className="absolute right-0 top-0 w-72 h-72 rounded-full opacity-[0.03]
                       -translate-y-16 translate-x-16 border border-primary"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2), transparent 70%)' }}
          />
          <div className="container-custom relative z-10">
            <motion.div className="text-center mb-16" {...fadeUp()}>
              <SectionBadge label={homePageConfig.results.badge} center />
              <h2 className="heading-lg text-foreground mb-4">{homePageConfig.results.title}</h2>
              <GoldDivider className="mb-6 max-w-[160px] mx-auto" />
              <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
                {homePageConfig.results.subtitle}
              </p>
            </motion.div>

            <BeforeAfterCarousel
              allLabel="Todos"
              emptyMessage={labelsConfig.before_after_empty}
            />

            <motion.div className="text-center mt-14" {...fadeUp(0.2)}>
              <Link
                to="/resultados"
                className="btn-primary inline-flex items-center gap-3 rounded-xl px-8 py-4 text-sm"
              >
                {homePageConfig.results.cta_text}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            DEPOIMENTOS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-padding bg-background overflow-hidden relative">
          <div
            aria-hidden
            className="absolute left-0 top-0 w-full h-px
                       bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          />
          <div className="container-custom mb-14">
            <motion.div className="text-center" {...fadeUp()}>
              <SectionBadge label={homePageConfig.testimonials.badge} center />
              <h2 className="heading-lg text-foreground mb-3">{homePageConfig.testimonials.title}</h2>
              <GoldDivider className="mb-5 max-w-[140px] mx-auto" />
              <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
                {homePageConfig.testimonials.subtitle}
              </p>
            </motion.div>
          </div>
          <TestimonialsCarousel testimonials={applyTestimonials(testimonials)} emptyMessage={labelsConfig.testimonials_empty} />
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            BLOG
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-padding bg-muted border-t border-border/40">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
              <motion.div className="max-w-xl" {...fadeLeft()}>
                <SectionBadge label={homePageConfig.blog.badge} />
                <h2 className="heading-lg text-foreground">{homePageConfig.blog.title}</h2>
                <GoldDivider className="mt-4 max-w-[160px]" />
              </motion.div>
              <motion.div {...fadeRight(0.2)}>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-primary font-bold
                             hover:text-primary/70 transition-colors duration-300
                             uppercase tracking-widest text-xs group"
                >
                  {homePageConfig.blog.cta_text}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </motion.div>
            </div>

            {blogLoading ? (
              <BlogSkeleton />
            ) : recentArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {applyArticles(recentArticles).map((article, i) => (
                  <motion.div key={article.id} {...fadeUp(i * 0.1)}>
                    <BlogCard article={article} ctaLabel={labelsConfig.blog_card_cta} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
                <p className="text-muted-foreground font-medium">{homePageConfig.blog.empty_title}</p>
                <p className="text-sm text-muted-foreground/50 mt-1">{homePageConfig.blog.empty_subtitle}</p>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            CTA FINAL — CONTATO SIMPLIFICADO
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-padding bg-background border-t border-border/40">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

              <motion.div {...fadeLeft()}>
                <SectionBadge label={homePageConfig.final_cta.badge} />
                <h2 className="heading-lg text-foreground mb-3">
                  {homePageConfig.final_cta.title}
                </h2>
                <GoldDivider className="mb-6 max-w-[160px]" />
                <p className="text-base text-muted-foreground mb-8 leading-relaxed max-w-md">
                  {homePageConfig.final_cta.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={whatsappUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center justify-center gap-3
                               px-8 py-4 text-sm rounded-xl shadow-gold uppercase tracking-wide font-bold"
                  >
                    {homePageConfig.final_cta.primary_cta_text}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    to="/contato"
                    className="inline-flex items-center justify-center gap-2
                               border border-border text-foreground bg-card
                               px-8 py-4 rounded-xl font-semibold text-sm
                               hover:border-primary/60 hover:text-primary
                               transition-all duration-300"
                  >
                    {homePageConfig.final_cta.secondary_cta_text}
                  </Link>
                </div>
              </motion.div>

              <motion.div {...fadeRight(0.2)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ContactInfoCard icon={MapPin} title="Endereço">
                    <a
                      href={get('maps_url') || `https://www.google.com/maps/search/?api=1&query=${get('nome_local') ? encodeURIComponent(get('nome_local')) : encodeURIComponent(get('endereco'))}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium whitespace-pre-wrap"
                    >
                      {get('endereco')}
                    </a>
                  </ContactInfoCard>
                  <ContactInfoCard icon={Clock} title="Horário">
                    <p className="text-sm text-muted-foreground font-medium">{get('dias_funcionamento')}</p>
                    <p className="text-sm text-foreground font-bold">{get('horario')}</p>
                  </ContactInfoCard>
                  <ContactInfoCard icon={Phone} title="Telefone">
                    <a
                      href={`tel:${get('telefone').replace(/\D/g, '')}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                      {get('telefone')}
                    </a>
                  </ContactInfoCard>
                  <ContactInfoCard icon={Mail} title="E-mail">
                    <a
                      href={`mailto:${get('email')}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium break-all"
                    >
                      {get('email')}
                    </a>
                  </ContactInfoCard>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default HomePage;