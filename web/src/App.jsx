// src/App.jsx
import React, { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router, Link, useLocation, Navigate } from 'react-router-dom';
import { useContatoConfig } from '@/hooks/useContatoConfig';
import { useTheme }         from '@/hooks/useTheme';
import { useSiteSettings }  from '@/hooks/useSiteSettings';
import { useTranslation }   from 'react-i18next';
import { Toaster } from '@/components/ui/sonner.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import CookieBanner from '@/components/CookieBanner.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { LOGO_URL } from '@/config/site';

// ─── Lazy Pages ───────────────────────────────────────────────────────────────
const HomePage         = lazy(() => import('@/pages/HomePage.jsx'));
const SobrePage        = lazy(() => import('@/pages/SobrePage.jsx'));
const ServicosPage     = lazy(() => import('@/pages/ServicosPage.jsx'));
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage.jsx'));
const ResultadosPage   = lazy(() => import('@/pages/ResultadosPage.jsx'));
const BlogPage         = lazy(() => import('@/pages/BlogPage.jsx'));
const BlogPostPage     = lazy(() => import('@/pages/BlogPostPage.jsx'));
const ContatoPage      = lazy(() => import('@/pages/ContatoPage.jsx'));
const AdminLoginPage   = lazy(() => import('@/pages/AdminLoginPage.jsx'));
const AdminDashboard   = lazy(() => import('@/pages/AdminDashboard.jsx'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage.jsx'));
const PrivacidadePage  = lazy(() => import('@/pages/PrivacidadePage.jsx'));
const TermosUsoPage    = lazy(() => import('@/pages/TermosUsoPage.jsx'));
const FaqPage          = lazy(() => import('@/pages/FaqPage.jsx'));

// ─── Layout padrão (Header + Footer) ─────────────────────────────────────────
const MainLayout = ({ children, siteConfig }) => (
  <>
    <Header siteConfig={siteConfig} />
    <main>{children}</main>
    <Footer siteConfig={siteConfig} />
  </>
);

// ─── Page Loader ──────────────────────────────────────────────────────────────
const PageLoader = ({ logoUrl }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-6"
    >
      <img
        src={logoUrl || LOGO_URL}
        alt="Instituto Milhomem"
        className="w-20 h-20 object-contain opacity-80"
      />

      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div
          className="absolute inset-1 rounded-full border-4 border-t-transparent border-r-primary/40 border-b-transparent border-l-transparent animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}
        />
      </div>

      <p className="text-secondary font-bold uppercase tracking-widest text-xs">
        Carregando...
      </p>
    </motion.div>
  </div>
);

// ─── 404 Page ─────────────────────────────────────────────────────────────────
const NotFoundPage = ({ logoUrl }) => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-background to-muted relative overflow-hidden">

    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.07_0%,transparent_60%)]" />

    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-10 space-y-8 max-w-lg"
    >
      <img
        src={logoUrl || LOGO_URL}
        alt="Instituto Milhomem"
        className="w-20 h-20 object-contain mx-auto opacity-70"
      />

      <div>
        <motion.h1
          className="text-[8rem] md:text-[10rem] font-extrabold text-primary/20 leading-none select-none"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          404
        </motion.h1>
        <h2 className="text-2xl md:text-3xl font-bold text-secondary -mt-6">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          A página que você está procurando não existe ou foi movida.
          Volte para o início e continue navegando.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:bg-secondary hover:text-white transition-all duration-300 uppercase tracking-wide shadow-lg hover:shadow-primary/30 active:scale-95"
        >
          <Home className="w-4 h-4" />
          Voltar ao Início
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 border border-border px-8 py-4 rounded-xl font-bold text-foreground hover:bg-muted hover:border-primary/30 transition-all duration-300 uppercase tracking-wide active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Página Anterior
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Animated Routes ──────────────────────────────────────────────────────────
const AnimatedRoutes = ({ siteConfig }) => {
  const location = useLocation();
  const { settings } = useSiteSettings();
  const blogDisabled  = settings?.blog_disabled === 'true';

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Públicas — com Header e Footer */}
        <Route
          path="/"
          element={<MainLayout siteConfig={siteConfig}><HomePage /></MainLayout>}
        />
        <Route
          path="/sobre"
          element={<MainLayout siteConfig={siteConfig}><SobrePage /></MainLayout>}
        />
        <Route
          path="/servicos"
          element={<MainLayout siteConfig={siteConfig}><ServicosPage /></MainLayout>}
        />
        <Route
          path="/servicos/:slug"
          element={<MainLayout siteConfig={siteConfig}><ServiceDetailPage /></MainLayout>}
        />
        <Route
          path="/resultados"
          element={<MainLayout siteConfig={siteConfig}><ResultadosPage /></MainLayout>}
        />
        <Route
          path="/blog"
          element={blogDisabled ? <Navigate to="/" replace /> : <MainLayout siteConfig={siteConfig}><BlogPage /></MainLayout>}
        />
        <Route
          path="/blog/:slug"
          element={blogDisabled ? <Navigate to="/" replace /> : <MainLayout siteConfig={siteConfig}><BlogPostPage /></MainLayout>}
        />
        <Route
          path="/contato"
          element={<MainLayout siteConfig={siteConfig}><ContatoPage /></MainLayout>}
        />
        <Route
          path="/faq"
          element={<MainLayout siteConfig={siteConfig}><FaqPage /></MainLayout>}
        />

        {/* Sem Header/Footer */}
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute siteConfig={siteConfig} requiredPermission="dashboard:read">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* LGPD — com Header e Footer */}
        <Route
          path="/politica-de-privacidade"
          element={<MainLayout siteConfig={siteConfig}><PrivacidadePage /></MainLayout>}
        />
        <Route
          path="/termos-de-uso"
          element={<MainLayout siteConfig={siteConfig}><TermosUsoPage /></MainLayout>}
        />

        {/* 404 — sem Header/Footer para não quebrar o layout */}
        <Route path="*" element={<NotFoundPage logoUrl={siteConfig?.logo_url} />} />

      </Routes>
    </AnimatePresence>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const siteConfig = useContatoConfig();
  useTheme(); // aplica cores da tabela site_settings como CSS vars no :root
  const { i18n } = useTranslation();

  // ── <html lang> dinâmico consoante idioma ativo ─────────────────────────
  useEffect(() => {
    document.documentElement.lang = i18n.language || 'pt-BR';
  }, [i18n.language]);
  useEffect(() => {
    const onDoubleClick = (e) => e.preventDefault();
    document.addEventListener('dblclick', onDoubleClick, { passive: false });

    return () => {
      document.removeEventListener('dblclick', onDoubleClick);
    };
  }, []);

  useEffect(() => {
    if (!siteConfig?.favicon_url) return;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    link.href = siteConfig.favicon_url;
  }, [siteConfig?.favicon_url]);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoader logoUrl={siteConfig?.logo_url} />}>
          <AnimatedRoutes siteConfig={siteConfig} />
        </Suspense>
        <CookieBanner />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            className: 'font-semibold',
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;