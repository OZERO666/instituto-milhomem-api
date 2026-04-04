// src/pages/ServiceDetailPage.jsx
import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { WhatsappLogo } from '@phosphor-icons/react/dist/csr/WhatsappLogo';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import SEO from '@/components/SEO.jsx';
import WhatsAppButton from '@/components/WhatsAppButton.jsx';
import api from '@/lib/apiServerClient';
import { usePagesConfig } from '@/hooks/usePagesConfig';
import { useTraducoes } from '@/hooks/useTraducoes';

const ServiceDetailPage = () => {
  const pageConfig = usePagesConfig('service_detail');
  const { slug } = useParams();
  const [service, setService]       = useState(null);
  const [related, setRelated]       = useState([]);
  const [contact, setContact]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const { apply } = useTraducoes('servicos', service?.id);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const [serviceRes, allRes, contactRes] = await Promise.all([
          api.fetch(`/servicos/slug/${slug}`).then(r => {
            if (!r.ok) throw new Error('not_found');
            return r.json();
          }),
          api.fetch('/servicos').then(r => r.json()),
          api.fetch('/contato-config').then(r => r.json()),
        ]);

        setService(serviceRes);
        const c = Array.isArray(contactRes) ? contactRes[0] : contactRes;
        setContact(c);

        // Serviços relacionados (todos exceto o atual, até 3)
        const others = Array.isArray(allRes)
          ? allRes.filter(s => s.slug !== slug).slice(0, 3)
          : [];
        setRelated(others);
      } catch (err) {
        if (err.message === 'not_found') setNotFound(true);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  const displayService = apply(service);

  const benefitsList = useMemo(() => {
    if (!displayService?.beneficios) return [];
    const sep = displayService.beneficios.includes('\n') ? '\n' : ',';
    return displayService.beneficios.split(sep).map(b => b.trim()).filter(Boolean);
  }, [displayService]);

  const whatsappUrl = useMemo(() => {
    const num = contact?.whatsapp ?? '62981070937';
    const msg = contact?.mensagem_whatsapp
      ?? `Olá! Gostaria de mais informações sobre ${displayService?.nome ?? 'o serviço'}.`;
    return `https://api.whatsapp.com/send?l=pt-BR&phone=${num.replace(/\D/g, '')}&text=${encodeURIComponent(msg)}`;
  }, [contact, displayService]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">{pageConfig.loading_text}</p>
      </div>
    </div>
  );

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-background gap-6">
      <h1 className="text-4xl font-extrabold text-foreground">{pageConfig.not_found_title}</h1>
      <p className="text-muted-foreground">{pageConfig.not_found_subtitle}</p>
      <Link to="/servicos" className="btn-primary px-8 py-4 rounded-xl font-bold uppercase tracking-wide inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> {pageConfig.not_found_button}
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title={`${displayService.nome} em Goiânia | Instituto Milhomem`}
        description={displayService.descricao}
        keywords={[
          displayService.nome,
          'transplante capilar',
          'Goiânia',
          'Instituto Milhomem',
          ...benefitsList.slice(0, 3),
        ].filter(Boolean).join(', ')}
        ogImage={service.imagem || undefined}
        type="service"
        serviceData={{
          nome:      displayService.nome,
          descricao: displayService.descricao,
          imagem:    service.imagem,
          slug:      service.slug,
          beneficios: benefitsList,
        }}
      />
      <WhatsAppButton />

      <main className="flex-grow">

        {/* ── HERO ── */}
        <section className="relative bg-secondary overflow-hidden">
          {service.imagem && (
            <>
              <img
                src={service.imagem}
                alt={displayService.nome}
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/90 to-transparent" />
            </>
          )}
          <div className="container-custom relative z-10 py-12 md:py-24 mt-8 md:mt-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              {/* Breadcrumb */}
              <div className="flex flex-wrap items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest mb-6">
                <Link to="/" className="hover:text-primary transition-colors">{pageConfig.breadcrumb_home}</Link>
                <span>/</span>
                <Link to="/servicos" className="hover:text-primary transition-colors">{pageConfig.breadcrumb_services}</Link>
                <span>/</span>
                <span className="text-primary min-w-0 truncate">{displayService.nome}</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary font-bold uppercase tracking-[0.18em] text-[10px]">{pageConfig.hero_badge}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                {displayService.nome}
              </h1>

              {displayService.descricao && (
                <p className="text-lg text-white/75 max-w-2xl leading-relaxed mb-8">
                  {displayService.descricao}
                </p>
              )}

              <a
                href={whatsappUrl}
                target="_blank" rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold uppercase tracking-wide text-sm shadow-gold"
              >
                {pageConfig.hero_cta_text}
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── CONTEÚDO PRINCIPAL ── */}
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

              {/* Conteúdo Rich Text */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {displayService.conteudo ? (
                  <div
                    className="prose prose-lg max-w-none
                               prose-headings:text-foreground prose-headings:font-bold
                               prose-p:text-muted-foreground prose-p:leading-relaxed
                               prose-strong:text-foreground
                               prose-li:text-muted-foreground
                               prose-a:text-primary hover:prose-a:text-primary/70"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayService.conteudo || '') }}
                  />
                ) : (
                  <div className="text-muted-foreground text-base leading-relaxed">
                    <p>{displayService.descricao}</p>
                    {displayService.processo && (
                      <>
                        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Como funciona</h2>
                        <p>{displayService.processo}</p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Sidebar */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* Benefícios */}
                {benefitsList.length > 0 && (
                  <div className="bg-card border border-border/60 rounded-2xl p-6">
                    <h3 className="font-bold text-foreground uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                      <div className="w-5 h-px bg-primary" />
                      {pageConfig.benefits_title}
                    </h3>
                    <ul className="space-y-3">
                      {benefitsList.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Sidebar */}
                <div className="bg-secondary rounded-2xl p-6 border border-primary/20 text-center space-y-4">
                  <WhatsappLogo size={32} weight="fill" className="text-primary mx-auto" />
                  <h3 className="font-bold text-white text-base">{pageConfig.sidebar_title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {pageConfig.sidebar_text_prefix} {displayService.nome}.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank" rel="noopener noreferrer"
                    className="block w-full py-3 bg-primary text-secondary font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-accent transition-colors"
                  >
                    {pageConfig.sidebar_button}
                  </a>
                </div>

                {/* Link de volta */}
                <Link
                  to="/servicos"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {pageConfig.back_to_services}
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── SERVIÇOS RELACIONADOS ── */}
        {related.length > 0 && (
          <section className="section-padding bg-muted border-t border-border/40">
            <div className="container-custom">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary font-bold uppercase tracking-[0.18em] text-[10px]">{pageConfig.related_badge}</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-8">{pageConfig.related_title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(s => (
                  <Link
                    key={s.id}
                    to={`/servicos/${s.slug}`}
                    className="bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all duration-300 group"
                  >
                    {s.imagem && (
                      <img src={s.imagem} alt={s.nome} className="w-full h-36 object-cover rounded-xl mb-4 group-hover:opacity-90 transition-opacity" />
                    )}
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{s.nome}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{s.descricao}</p>
                    <span className="inline-flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-wider mt-3">
                      Saiba mais <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default ServiceDetailPage;