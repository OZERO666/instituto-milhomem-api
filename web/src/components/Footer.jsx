// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useContatoConfig, buildWhatsappUrl, formatTelHref } from '@/hooks/useContatoConfig';
import { usePagesConfig } from '@/hooks/usePagesConfig';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useTraducoes } from '@/hooks/useTraducoes';
import { NAV_ITEMS, LOGO_URL } from '@/config/site';

// ─── Ícone WhatsApp SVG (lucide não tem) ──────────────────────────────────────
const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = ({ siteConfig }) => {
  const { t }        = useTranslation();
  const config       = useContatoConfig();
  const { apply: applyConfigTrad } = useTraducoes('contato_config', config.id);
  const translatedConfig = applyConfigTrad(config);
  const footerConfig = usePagesConfig('footer');
  const { settings } = useSiteSettings();
  const blogDisabled = settings?.blog_disabled === 'true';
  const navItems     = blogDisabled ? NAV_ITEMS.filter(item => item.key !== 'blog') : NAV_ITEMS;
  const logoUrl      = siteConfig?.logo_url || LOGO_URL;
  const logoHeight   = Number(settings?.logo_size_footer) || 48;
  const currentYear  = new Date().getFullYear();
  const whatsappUrl = buildWhatsappUrl(config.whatsapp, config.mensagem_header);
  const mapSearchQuery = config.nome_local ? encodeURIComponent(config.nome_local) : (config.endereco ? encodeURIComponent(config.endereco) : 'Instituto+Milhomem+Goiânia');
  const mapLink     = config.maps_url || `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`;

  const CONTACT_ITEMS = [
    {
      icon:     MapPin,
      label:    t('footer.location_label', 'Localização'),
      content:  config.endereco,
      href:     mapLink,
      external: true,
    },
    {
      icon:    Phone,
      label:   t('footer.phone_label', 'Telefone'),
      content: config.telefone,
      href:    formatTelHref(config.telefone),
    },
    {
      icon:    Mail,
      label:   t('footer.email_label', 'E-mail'),
      content: config.email,
      href:    `mailto:${config.email}`,
    },
  ];

  const SOCIAL_LINKS = [
    { href: config.instagram, label: 'Instagram', icon: Instagram },
    { href: config.facebook,  label: 'Facebook',  icon: Facebook  },
    { href: whatsappUrl,      label: 'WhatsApp',  icon: WhatsAppIcon },
  ];

  return (
    <footer className="bg-secondary text-white">

      {/* ── CORPO ── */}
      <div className="container-custom py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">

        {/* Coluna 1 — Logo + descrição */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <Link to="/">
            <img src={logoUrl} alt="Instituto Milhomem" style={{ height: logoHeight }} className="object-contain" />
          </Link>
          <p className="text-white/50 text-sm leading-relaxed">
            {footerConfig.description}
          </p>
          {/* Redes sociais */}
          <div className="flex items-center gap-3 mt-2">
            {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center
                           text-white/50 hover:text-primary hover:border-primary/50 transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Coluna 2 — Navegação */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-5">
            {t('footer.navigation', 'Navegação')}
          </h4>
          <ul className="flex flex-col gap-3">
            {navItems.map(({ path, key }) => (
              <li key={path}>
                <Link
                  to={path}
                  className="text-sm text-white/50 hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 3 — Contato */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-5">
            {t('footer.contact_section', 'Contato')}
          </h4>
          <ul className="flex flex-col gap-4">
            {CONTACT_ITEMS.map(({ icon: Icon, label, content, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex items-start gap-3 text-sm text-white/50 hover:text-primary transition-colors group"
                >
                  <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{content}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 4 — Horário + CTA */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-5">
            {t('footer.schedule_section', 'Atendimento')}
          </h4>
          <p className="text-sm text-white/50 mb-1">{translatedConfig.dias_funcionamento}</p>
          <p className="text-sm font-bold text-white mb-6">{translatedConfig.horario}</p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-secondary font-bold text-xs
                       uppercase tracking-widest px-5 py-3 rounded-full
                       hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-md"
          >
            <WhatsAppIcon className="w-4 h-4" />
            {t('footer.schedule_cta', 'Agendar Consulta')}
          </a>
        </div>

      </div>

      {/* ── RODAPÉ ── */}
      <div className="border-t border-white/5">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <span>© {currentYear} {footerConfig.rights_text}</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link to="/politica-de-privacidade" className="hover:text-primary transition-colors">
              {t('footer.privacy_policy', 'Política de Privacidade')}
            </Link>
            <span className="text-white/10">|</span>
            <Link to="/termos-de-uso" className="hover:text-primary transition-colors">
              {t('footer.terms_of_use', 'Termos de Uso')}
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
