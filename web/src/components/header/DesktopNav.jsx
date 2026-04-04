// src/components/header/DesktopNav.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from '@/config/site';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const DesktopNav = ({ isActive, whatsappUrl, isAuthenticated }) => {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const navItems = settings?.blog_disabled === 'true'
    ? NAV_ITEMS.filter(item => item.key !== 'blog')
    : NAV_ITEMS;

  return (
    <>
      <nav className="hidden lg:flex items-center gap-6">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-sm font-semibold tracking-wide transition-colors relative group ${
              isActive(item.path) ? 'text-primary' : 'text-white/80 hover:text-white'
            }`}
          >
            {t(`nav.${item.key}`, item.name)}
            <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
              isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'
            }`} />
          </Link>
        ))}
      </nav>

      <div className="hidden lg:flex items-center gap-3">

        <LanguageSwitcher />

        {/* Link admin — só aparece se logado */}
        {isAuthenticated && (
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-white/40 hover:text-primary
                       transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <UserCircle className="w-4 h-4" />
            {t('header.admin_panel', 'Painel')}
          </Link>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-primary text-secondary font-bold text-sm
                     uppercase tracking-widest px-5 py-2.5 rounded-full
                     hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          {t('header.schedule_cta', 'Agendar Consulta')}
        </a>
      </div>
    </>
  );
};

export default DesktopNav;
