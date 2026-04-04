// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useContatoConfig, buildWhatsappUrl } from '@/hooks/useContatoConfig';
import { LOGO_URL } from '@/config/site';
import DesktopNav from '@/components/header/DesktopNav';
import MobileMenu from '@/components/header/MobileMenu';

const Header = ({ siteConfig }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const location                            = useLocation();
  const { isAuthenticated }                 = useAuth();
  const config                              = useContatoConfig();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const isActive    = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  const whatsappUrl = buildWhatsappUrl(config.whatsapp, config.mensagem_header);
  const logoUrl = siteConfig?.logo_url || LOGO_URL;

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'bg-secondary/95 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-secondary'
    }`}>
      <div className="container-custom flex items-center justify-between py-4">

        {/* Logo — aumentada para h-14 */}
        <Link to="/" className="flex-shrink-0">
          <img
            src={logoUrl}
            alt="Instituto Milhomem"
            className="h-14 object-contain"
          />
        </Link>

        <DesktopNav isActive={isActive} whatsappUrl={whatsappUrl} isAuthenticated={isAuthenticated} />

        <button
          className="lg:hidden text-white/80 hover:text-white p-2 transition-colors"
          onClick={() => setMobileMenuOpen(v => !v)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      <MobileMenu
        open={mobileMenuOpen}
        isActive={isActive}
        config={config}
        whatsappUrl={whatsappUrl}
      />
    </header>
  );
};

export default Header;
