import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/apiServerClient';
import BeforeAfterCard from './BeforeAfterCard.jsx';

const BeforeAfterCarousel = ({ allLabel = 'Todos', emptyMessage = 'Nenhum resultado encontrado para este tema.' }) => {
  const [items, setItems] = useState([]);
  const [themes, setThemes] = useState([]);
  const [activeThemeId, setActiveThemeId] = useState('all');
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      // Não captura drag quando iniciado dentro de um BeforeAfterCard (data-no-drag)
      watchDrag: (_, event) => {
        const target = event.target;
        if (target && target.closest('[data-no-drag]')) return false;
        return true;
      },
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  // Pausa autoplay enquanto o usuário arrasta o slider do card
  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins()?.autoplay;
    if (!autoplay) return;

    const handlePointerDown = (e) => {
      if (e.target && e.target.closest('[data-no-drag]')) {
        autoplay.stop();
      }
    };
    const handlePointerUp = () => {
      autoplay.play();
    };

    const root = emblaApi.rootNode();
    root.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      root.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [emblaApi]);

  // Busca temas da galeria
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

  // Busca itens da galeria conforme tema
  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        let url = '/galeria?sort=-created';
        if (activeThemeId !== 'all') {
          url += `&tema_id=${encodeURIComponent(activeThemeId)}`;
        }
        const records = await api.fetch(url).then(r => r.json());
        setItems(Array.isArray(records) ? records : []);
      } catch (error) {
        console.error('Error fetching gallery:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [activeThemeId]);

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [items, emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Filtros: "Todos" + temas vindos da API
  const filters = [
    { id: 'all', label: allLabel },
    ...themes.map(t => ({ id: t.id, label: t.nome })),
  ];

  return (
    <div className="w-full">
      {/* FILTROS DINÂMICOS */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveThemeId(filter.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeThemeId === filter.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4"
            >
              <div className="aspect-[4/3] bg-muted rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        /* CAROUSEL */
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4"
                >
                  <BeforeAfterCard item={item} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-accent hover:text-primary transition-colors z-10 hidden md:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-accent hover:text-primary transition-colors z-10 hidden md:flex"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      ) : (
        /* EMPTY */
        <div className="text-center py-12 bg-muted rounded-2xl">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default BeforeAfterCarousel;