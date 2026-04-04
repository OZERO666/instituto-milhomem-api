// src/components/header/MobileMenu.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from '@/config/site';
import { formatTelHref } from '@/hooks/useContatoConfig';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const MobileMenu = ({ open, isActive, config, whatsappUrl }) => {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const navItems = settings?.blog_disabled === 'true'
    ? NAV_ITEMS.filter(item => item.key !== 'blog')
    : NAV_ITEMS;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden bg-secondary border-t border-white/10 overflow-hidden"
        >
          <div className="container-custom py-6 flex flex-col gap-1">

            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-semibold py-3 px-2 border-b border-white/5 transition-colors flex items-center justify-between ${
                  isActive(item.path) ? 'text-primary' : 'text-white/80 hover:text-primary'
                }`}
              >
                {t(`nav.${item.key}`, item.name)}
                {isActive(item.path) && <ChevronRight className="w-4 h-4 text-primary" />}
              </Link>
            ))}

            <a href={formatTelHref(config.telefone)}
               className="flex items-center gap-2 text-white/50 text-sm py-3 px-2 border-b border-white/5">
              <Phone className="w-4 h-4 text-primary" />
              {config.telefone}
            </a>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
               className="mt-5 flex items-center justify-center gap-2 bg-primary text-secondary
                          font-bold text-sm uppercase tracking-widest px-6 py-4 rounded-full
                          hover:bg-primary/90 transition-colors shadow-md w-full">
              <MessageCircle className="w-4 h-4" />
              {t('header.schedule_cta', 'Agendar Consulta')}
            </a>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
