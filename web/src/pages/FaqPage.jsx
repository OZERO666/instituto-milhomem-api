// src/pages/FaqPage.jsx
import React, { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO.jsx';
import WhatsAppButton from '@/components/WhatsAppButton.jsx';
import api from '@/lib/apiServerClient';
import { useContatoConfig, buildWhatsappUrl } from '@/hooks/useContatoConfig';

// ─── Accordion item ───────────────────────────────────────────────────────────
const FaqItem = ({ item, isOpen, onToggle, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    className="bg-card border border-border/60 rounded-xl overflow-hidden"
  >
    <button
      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-muted/40 transition-colors"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <span className="font-bold text-foreground text-sm md:text-base leading-snug">
        {item.pergunta}
      </span>
      <ChevronDown
        className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="px-6 pb-6 pt-1 text-sm md:text-base text-muted-foreground leading-relaxed border-t border-border/40"
      >
        {item.resposta}
      </motion.div>
    )}
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const FaqPage = () => {
  const [faqItems, setFaqItems] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const config = useContatoConfig();
  const whatsappUrl = buildWhatsappUrl(
    config.whatsapp,
    'Olá! Gostaria de tirar uma dúvida sobre os procedimentos do Instituto Milhomem.'
  );

  useEffect(() => {
    api.fetch('/faq')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setFaqItems(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const faqData = faqItems.map(f => ({ question: f.pergunta, answer: f.resposta }));

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Perguntas Frequentes | Instituto Milhomem"
        description="Tire suas dúvidas sobre transplante capilar, transplante de barba e tratamentos capilares no Instituto Milhomem em Goiânia."
        keywords="transplante capilar dúvidas, FAQ transplante capilar, perguntas frequentes transplante, Instituto Milhomem FAQ"
        type="website"
        faqData={faqData}
      />
      <WhatsAppButton />

      {/* ── HERO ── */}
      <section className="relative bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--primary)/0.12_0%,transparent_60%)]" />
        <div className="container-custom relative z-10 py-16 md:py-28 mt-8 md:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span className="text-primary font-bold uppercase tracking-[0.18em] text-[10px]">
                Tire suas dúvidas
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Perguntas<br />
              <span className="text-primary">Frequentes</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl leading-relaxed">
              Tudo o que você precisa saber antes de dar o primeiro passo rumo
              à transformação capilar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ LIST ── */}
      <main className="flex-grow section-padding bg-background">
        <div className="container-custom max-w-3xl">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : faqItems.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Nenhuma pergunta cadastrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <FaqItem
                  key={item.id}
                  item={item}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>
          )}

          {/* CTA após as perguntas */}
          {!loading && faqItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-14 bg-secondary rounded-2xl p-8 text-center border border-primary/20"
            >
              <h2 className="text-xl font-bold text-white mb-2">
                Ainda ficou alguma dúvida?
              </h2>
              <p className="text-white/60 text-sm mb-6">
                Fale com nossa equipe pelo WhatsApp — respondemos rapidamente.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl
                           bg-primary text-secondary font-bold text-sm uppercase tracking-widest
                           hover:bg-accent transition-colors shadow-lg"
              >
                Falar com Especialista
              </a>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FaqPage;
