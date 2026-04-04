
import React from 'react';
import { Award, Shield, Heart, Sparkles, CheckCircle2, Globe,
  Star, Zap, Target, Users, Clock, Leaf, Gem, TrendingUp, BadgeCheck,
  Stethoscope, Eye, Brain, Smile, Handshake, Lightbulb, Lock, Medal,
  Microscope, Ribbon, Sun, ThumbsUp, Trophy, Verified, Wallet, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import WhatsAppButton from '@/components/WhatsAppButton.jsx';
import SEO from '@/components/SEO.jsx';
import { useSobreConfig } from '@/hooks/useSobreConfig';
import { useTraducoes } from '@/hooks/useTraducoes';
import { parseJsonArray } from '@/features/admin/utils/sobreConfig.js';
import { SOBRE_DEFAULTS } from '@/config/site';

const VALUE_ICON_MAP = {
  Award, Shield, Heart, Sparkles, Star, Zap, Target, Users, Clock,
  Leaf, Gem, TrendingUp, BadgeCheck, Stethoscope, Eye, Brain, Smile,
  Globe, Handshake, Lightbulb, Lock, Medal, Microscope, Ribbon, Sun,
  ThumbsUp, Trophy, Verified, Wallet, Wind,
};
const FALLBACK_ICONS = [Award, Shield, Heart, Sparkles];

const SobrePage = () => {
  const rawConfig = useSobreConfig();
  const { apply } = useTraducoes('sobre_config', rawConfig?.id);
  const config = apply(rawConfig);
  const values = parseJsonArray(config.values).length ? parseJsonArray(config.values) : SOBRE_DEFAULTS.values;
  const team = parseJsonArray(config.team).length ? parseJsonArray(config.team) : SOBRE_DEFAULTS.team;
  const credentials = parseJsonArray(config.doctor_credentials);
  const bioParagraphs = (config.doctor_bio || '').split('\n').filter(Boolean);
  const techParagraphs = (config.technology_text || '').split('\n').filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SEO 
        title="Sobre a Clínica | Instituto Milhomem" 
        description="Conheça a infraestrutura premium, a equipe especializada e a filosofia de excelência do Instituto Milhomem em Goiânia."
      />

      <WhatsAppButton />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={config.hero_image || ''}
              alt="Clínica Premium"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-secondary/80 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>

          <div className="container-custom relative z-10 text-center pt-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm mb-4 block">
                {config.hero_badge}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6">
                {config.hero_title}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
                {config.hero_subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* DOCTOR SECTION */}
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-primary/20">
                  <img
                    src={config.doctor_image}
                    alt={config.doctor_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {config.doctor_experience_number && (
                  <div className="absolute -bottom-8 -right-8 bg-card p-6 rounded-xl shadow-xl border border-border hidden md:block">
                    <p className="text-4xl font-bold text-primary mb-1">{config.doctor_experience_number}</p>
                    <p className="text-sm font-bold text-secondary uppercase tracking-wider whitespace-pre-line">{config.doctor_experience_label}</p>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-2">{config.doctor_name}</h2>
                <p className="text-primary font-bold uppercase tracking-widest text-sm mb-8">{config.doctor_title}</p>
                
                <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                  {bioParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  {credentials.length > 0 && (
                    <ul className="space-y-3 mt-6">
                      {credentials.map((cred, i) => {
                        const label = typeof cred === 'string' ? cred : (cred.titulo || cred.title || '');
                        const detail = typeof cred === 'object' ? (cred.descricao || cred.description || '') : '';
                        return (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-secondary font-medium">{label}</span>
                              {detail && <p className="text-muted-foreground text-sm leading-snug">{detail}</p>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* WORLD FUE INSTITUTE SECTION */}
        <section className="section-padding bg-secondary text-white border-y-4 border-primary relative overflow-hidden">

          <div className="container-custom relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                  <span className="text-primary font-bold uppercase tracking-widest text-sm">{config.wfi_badge}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{config.wfi_title}</h2>
                <p className="text-white/80 leading-relaxed mb-8 text-lg">
                  {config.wfi_text}
                </p>
                {config.wfi_link && (
                  <a 
                    href={config.wfi_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-accent transition-colors uppercase tracking-wide"
                  >
                    Conheça o WFI
                  </a>
                )}
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center p-8 shadow-2xl border-4 border-primary">
                  <Globe className="w-full h-full text-secondary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT INTRO SECTION */}
        <section className="section-padding bg-muted">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-6">{config.about_title}</h2>
              <p className="text-lg text-muted-foreground">
                {config.about_text}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-border">
                  <img src={config.about_image} alt="Sobre a clínica" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>{config.about_detail_text}</p>
              </div>
            </div>
          </div>
        </section>

        {/* VALUES SECTION */}
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-4">{config.values_title}</h2>
              {config.values_subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">{config.values_subtitle}</p>
              )}
              <div className="w-16 h-1 bg-primary mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((val, idx) => {
                const Icon = VALUE_ICON_MAP[val.icon] || FALLBACK_ICONS[idx % FALLBACK_ICONS.length];
                return (
                  <motion.div 
                    key={idx}
                    className="bg-card border border-border p-8 rounded-xl shadow-sm hover:shadow-lg hover:border-primary/50 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Icon className="w-10 h-10 text-primary mb-6" />
                    <h3 className="text-xl font-bold mb-3 text-secondary">{val.title || val.titulo}</h3>
                    <p className="text-muted-foreground leading-relaxed">{val.description || val.descricao}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section className="section-padding bg-muted">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-secondary mb-6">{config.team_title}</h2>
              {config.team_subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {config.team_subtitle}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, idx) => (
                <motion.div 
                  key={idx}
                  className="card-elevated text-center group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-muted group-hover:border-primary transition-colors">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-1">{member.name}</h3>
                  <p className="text-primary font-bold text-sm uppercase tracking-wider mb-4">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TECHNOLOGY SECTION */}
        <section className="section-padding bg-background border-t border-border">
          <div className="container-custom">
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-secondary mb-6">{config.technology_title}</h2>
                <div className="space-y-6">
                  {techParagraphs.map((p, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full">
                <img 
                  src={config.technology_image}
                  alt={config.technology_title} 
                  className="rounded-xl shadow-lg w-full object-cover aspect-video"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default SobrePage;
