import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import WhatsAppButton from '@/components/WhatsAppButton.jsx';
import BeforeAfterCard from '@/components/BeforeAfterCard.jsx';
import TestimonialCard from '@/components/TestimonialCard.jsx';
import api from '@/lib/apiServerClient';
import SEO from '@/components/SEO.jsx';
import { usePagesConfig } from '@/hooks/usePagesConfig';
import { useTraducoesMulti } from '@/hooks/useTraducoesMulti';

const ResultadosPage = () => {
  const { t } = useTranslation();
  const pageConfig = usePagesConfig('resultados');
  const { applyList: applyTestimonials } = useTraducoesMulti('depoimentos');
  const [galleryItems, setGalleryItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [themes, setThemes] = useState([]);
  const [activeThemeId, setActiveThemeId] = useState('all');
  const [loading, setLoading] = useState(true);

  // Busca temas da API
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await api.fetch('/galeria-temas').then(r => r.json());
        setThemes(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error('Error fetching galeria-temas:', error);
        setThemes([]);
      }
    };
    fetchThemes();
  }, []);

  // Busca galeria + depoimentos conforme tema ativo
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let galleryUrl = '/galeria?sort=-created';
        if (activeThemeId !== 'all') {
          galleryUrl += `&tema_id=${encodeURIComponent(activeThemeId)}`;
        }

        const [galleryRes, testimonialsRes] = await Promise.all([
          api.fetch(galleryUrl).then(r => r.json()),
          api.fetch('/depoimentos?sort=-created').then(r => r.json()),
        ]);

        setGalleryItems(Array.isArray(galleryRes) ? galleryRes : []);
        setTestimonials(Array.isArray(testimonialsRes) ? testimonialsRes : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeThemeId]);

  // Filtros: "Todos" + temas da API
  const filters = [
    { id: 'all', label: 'Todos' },
    ...themes.map(t => ({ id: t.id, label: t.nome })),
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Resultados - Antes e Depois | Instituto Milhomem"
        description="Veja os resultados reais de transplante capilar do Instituto Milhomem. Galeria de fotos antes e depois e depoimentos de pacientes."
      />

      <WhatsAppButton />

      <main className="flex-grow">
        <section className="section-padding bg-muted">

          <div className="container-custom relative z-10">

            {/* HEADER */}
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary font-bold uppercase tracking-widest text-sm">{pageConfig.header_badge}</span>
                <div className="w-8 h-px bg-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-foreground">
                {pageConfig.header_title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {pageConfig.header_subtitle}
              </p>
            </div>

            {/* FILTROS DINÂMICOS */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveThemeId(filter.id)}
                  className={`px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 active:scale-95 border ${
                    activeThemeId === filter.id
                      ? 'bg-primary text-[#181B1E] border-primary shadow-lg'
                      : 'bg-white text-foreground border-primary/30 hover:border-primary hover:text-primary'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* GALERIA */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-primary/20 shadow-sm">
                    <div className="aspect-[4/3] bg-muted rounded-lg animate-pulse mb-4" />
                    <div className="h-5 bg-muted rounded animate-pulse mb-3 w-3/4" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                ))}
              </div>
            ) : galleryItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                {galleryItems.map((item) => (
                  <BeforeAfterCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-primary/20 shadow-sm mb-24">
                <p className="text-muted-foreground font-medium text-lg">
                  {t('resultados.empty_text', 'Nenhum resultado encontrado para este tema.')}
                </p>
              </div>
            )}

            {/* DEPOIMENTOS */}
            {testimonials.length > 0 && (
              <div className="mt-24 pt-20 border-t border-primary/30">
                <div className="text-center mb-16">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-8 h-px bg-primary" />
                    <span className="text-primary font-bold uppercase tracking-widest text-sm">{pageConfig.testimonials_badge}</span>
                    <div className="w-8 h-px bg-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    {pageConfig.testimonials_title}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {applyTestimonials(testimonials).slice(0, 6).map((testimonial) => (
                    <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                  ))}
                </div>
              </div>
            )}

            {/* CTA INSTAGRAM */}
            <div className="mt-12 md:mt-24 bg-[#181B1E] rounded-2xl p-6 sm:p-12 text-center border border-primary shadow-2xl relative overflow-hidden">

              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4 text-white">{t('resultados.videos_title', 'Vídeos de Depoimentos')}</h3>
                <p className="text-white/80 mb-8 text-lg max-w-2xl mx-auto">
                  {t('resultados.videos_subtitle', 'Acompanhe nossos pacientes no Instagram e veja depoimentos em vídeo sobre a experiência no Instituto Milhomem.')}
                </p>
                <a
                  href="https://www.instagram.com/institutomilhomem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-primary text-[#181B1E] px-8 py-4 rounded-lg font-bold hover:bg-secondary hover:text-white transition-all duration-300 active:scale-95 uppercase tracking-wide"
                >
                  {t('resultados.instagram_cta', 'Ver no Instagram')}
                </a>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default ResultadosPage;