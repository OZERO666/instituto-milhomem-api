import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WhatsAppButton from '@/components/WhatsAppButton.jsx';
import BlogCard from '@/components/BlogCard.jsx';
import api from '@/lib/apiServerClient';
import SEO from '@/components/SEO.jsx';
import { usePagesConfig } from '@/hooks/usePagesConfig';
import { useTraducoesMulti } from '@/hooks/useTraducoesMulti';

const BlogPage = () => {
  const { t } = useTranslation();
  const pageConfig = usePagesConfig('blog');
  const labelsConfig = usePagesConfig('labels');
  const { applyList } = useTraducoesMulti('artigos');
  const { applyList: applyCategories } = useTraducoesMulti('blog_categorias');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const records = await api.fetch('/blog-categorias').then(r => r.json());
        const sorted = Array.isArray(records)
          ? records.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
          : [];
        setCategories(sorted);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch artigos
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/artigos?published=1&sort=-data_publicacao&expand=categoria';
      
      if (activeCategory !== 'all') {
        url += `&categoria=${activeCategory}`;
      }
      
      if (searchTerm.trim()) {
        url += `&titulo[contains]=${encodeURIComponent(searchTerm.trim())}`;
      }

      const records = await api.fetch(url).then(r => r.json());
      
      // Injeta nome da categoria no artigo para BlogCard
      const articlesWithCategory = Array.isArray(records)
        ? records.map(article => ({
            ...article,
            categoria: article.expand?.categoria?.nome || 'Sem categoria'
          }))
        : [];
      
      setArticles(articlesWithCategory);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filteredArticles = applyList(articles).filter(article =>
    article.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.resumo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.conteudo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return t('common.date_unavailable', 'Data não disponível');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SEO
        keywords="transplante capilar, blog capilar, saúde capilar, FUE, Goiânia, dicas capilares, queda de cabelo"
      />
      
      <WhatsAppButton />

      <main className="flex-grow">
        {/* HEADER SECTION */}
        <section className="section-padding bg-muted">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary"></div>
                <span className="text-primary font-bold uppercase tracking-widest text-sm">{pageConfig.header_badge}</span>
                <div className="w-8 h-px bg-primary"></div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-secondary">{pageConfig.header_title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {pageConfig.header_subtitle}
              </p>
            </div>

            {/* CATEGORIAS FILTER */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 active:scale-95 border ${
                  activeCategory === 'all'
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'bg-card text-foreground border-border hover:border-primary hover:text-primary'
                }`}
              >
                {pageConfig.all_categories_label}
              </button>
              {applyCategories(categories).map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 active:scale-95 border ${
                    activeCategory === category.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-card text-foreground border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {category.nome}
                </button>
              ))}
            </div>

            {/* SEARCH */}
            <div className="max-w-md mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={pageConfig.search_placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-card rounded-xl border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all duration-200 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ARTIGOS GRID */}
        <section className="section-padding bg-background">
          <div className="container-custom">
            {loading ? (
              // Skeleton Loading
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 border border-border shadow-sm">
                    <div className="aspect-video bg-muted rounded-lg animate-pulse mb-6"></div>
                    <div className="h-4 bg-muted rounded animate-pulse mb-3 w-3/4"></div>
                    <div className="h-6 bg-muted rounded animate-pulse mb-4 w-full"></div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-20 h-4 bg-muted rounded"></div>
                    </div>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2 w-full"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              // Empty State
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <p className="text-muted-foreground font-medium text-lg mb-4">{pageConfig.empty_title}</p>
                <p className="text-muted-foreground text-sm">{pageConfig.empty_subtitle}</p>
              </div>
            ) : (
              // Artigos
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map(article => (
                  <BlogCard
                    key={article.id}
                    article={article}
                    ctaLabel={labelsConfig.blog_card_cta}
                  />
                ))}
              </div>
            )}

            {/* Pagination pode ser adicionada aqui se necessário */}
            {filteredArticles.length > 0 && (
              <div className="text-center mt-16">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold hover:bg-accent transition-all duration-300 uppercase tracking-wide"
                >
                  Ver mais artigos <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

    </div>
  );
};

export default BlogPage;
