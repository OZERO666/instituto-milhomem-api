// src/pages/FaqPage.jsx
import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO.jsx';
import WhatsAppButton from '@/components/WhatsAppButton.jsx';
import api from '@/lib/apiServerClient';
import { useContatoConfig, buildWhatsappUrl } from '@/hooks/useContatoConfig';

// ─── Accordion item ───────────────────────────────────────────────────────────
const FaqItem = ({ item, isOpen, onToggle }) => (
  <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
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
      <div className="px-6 pb-6 pt-1 text-sm md:text-base text-muted-foreground leading-relaxed border-t border-border/40">
        {item.resposta}
      </div>
    )}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const FaqPage = () => {
  const { t } = useTranslation();
  const [faqItems, setFaqItems] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const config = useContatoConfig();
  const whatsappUrl = buildWhatsappUrl(
    config.whatsapp,
    t('faq.whatsapp_msg')
  );

  useEffect(() => {
    api.fetch('/faq')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setFaqItems(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SEO
        title={t('faq.page_title')}
        description={t('faq.meta_desc')}
        keywords={t('faq.meta_keywords')}
        type="website"
      />
      <WhatsAppButton />

      <main className="flex-grow">
        <section className="section-padding bg-muted">
          <div className="container-custom">

            {/* HEADER — padrão Serviços / Resultados */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary font-bold uppercase tracking-widest text-sm">{t('faq.badge')}</span>
                <div className="w-8 h-px bg-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-foreground">
                {t('faq.heading_1')} <span className="text-primary">{t('faq.heading_2')}</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('faq.subtitle')}
              </p>
            </div>

            {/* FAQ LIST */}
            <div className="max-w-3xl mx-auto">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 bg-card rounded-xl animate-pulse border border-border/40" />
                  ))}
                </div>
              ) : faqItems.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-border">
                  <p className="text-muted-foreground font-medium text-lg">{t('faq.empty')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqItems.map((item, i) => (
                    <FaqItem
                      key={item.id}
                      item={item}
                      isOpen={openIndex === i}
                      onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                    />
                  ))}
                </div>
              )}

              {/* CTA após as perguntas */}
              {!loading && faqItems.length > 0 && (
                <div className="mt-14 bg-secondary rounded-2xl p-8 text-center border border-primary/20">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {t('faq.cta_title')}
                  </h2>
                  <p className="text-white/60 text-sm mb-6">
                    {t('faq.cta_text')}
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl
                               bg-primary text-secondary font-bold text-sm uppercase tracking-widest
                               hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    {t('faq.cta_button')}
                  </a>
                </div>
              )}
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default FaqPage;
