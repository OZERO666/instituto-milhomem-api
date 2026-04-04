// src/pages/ContatoPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input }    from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select.jsx';
import { Label }    from '@/components/ui/label.jsx';
import SEO          from '@/components/SEO.jsx';
import WhatsAppButton from '@/components/WhatsAppButton.jsx';
import api          from '@/lib/apiServerClient';
import { useContatoConfig, buildWhatsappUrl, formatTelHref } from '@/hooks/useContatoConfig';
import { usePagesConfig } from '@/hooks/usePagesConfig';
import { useTraducoes } from '@/hooks/useTraducoes';
import { useTraducoesMulti } from '@/hooks/useTraducoesMulti';
import { LOGO_URL } from '@/config/site';

const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12.004 2C6.477 2 2 6.477 2 12.004c0 1.771.463 3.432 1.27 4.876L2 22l5.273-1.233A9.953 9.953 0 0012.004 22C17.527 22 22 17.527 22 12.004 22 6.477 17.527 2 12.004 2zm0 18.214a8.21 8.21 0 01-4.186-1.144l-.3-.178-3.129.731.748-3.047-.196-.313a8.214 8.214 0 1114.888-4.259 8.22 8.22 0 01-7.825 8.21z"/>
  </svg>
);

const ContatoPage = () => {
  const { t }       = useTranslation();
  const pageConfig  = usePagesConfig('contato');
  const config      = useContatoConfig();
  const { apply: applyConfigTrad } = useTraducoes('contato_config', config.id);
  const { applyList: applyServicesTrad } = useTraducoesMulti('servicos');
  const translatedConfig = applyConfigTrad(config);
  const whatsappUrl = buildWhatsappUrl(config.whatsapp, config.mensagem_header);
  const mapQuery    = config.latitude && config.longitude ? `${config.latitude},${config.longitude}` : (config.nome_local ? encodeURIComponent(config.nome_local) : '-16.6981381,-49.2703892');
  const mapSearchQuery = config.nome_local ? encodeURIComponent(config.nome_local) : (config.endereco ? encodeURIComponent(config.endereco) : 'Instituto+Milhomem+Goiânia');
  const mapLink     = config.maps_url || `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`;

  const [services,       setServices]       = useState([]);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [submitted,      setSubmitted]      = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    api.fetch('/servicos')
      .then(r => r.json())
      .then(d => setServices(Array.isArray(d) ? d.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)) : []))
      .catch(() => {});
  }, []);

  const onSubmit = useCallback(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.fetch('/agendamentos', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome:         data.nome,
          email:        data.email,
          telefone:     data.telefone,
          mensagem:     data.mensagem,
          tipo_servico: data.tipo_servico,
        }),
      });
      if (!res.ok) throw new Error('server');
      toast.success(t('contact_form.toast_success', 'Mensagem enviada! Entraremos em contato em breve.'));
      setSubmitted(true);
      reset();
      setPrivacyChecked(false);
    } catch (err) {
      const isOffline = !navigator.onLine || err?.name === 'TypeError';
      if (isOffline) {
        toast.error(t('contact_form.toast_offline', 'Sem conexão com a internet. Fale conosco pelo WhatsApp.'), {
          action: {
            label: 'WhatsApp',
            onClick: () => window.open(whatsappUrl, '_blank', 'noopener'),
          },
          duration: 8000,
        });
      } else {
        toast.error(t('contact_form.toast_error', 'Erro ao enviar. Por favor, tente novamente ou fale pelo WhatsApp.'), {
          action: {
            label: 'WhatsApp',
            onClick: () => window.open(whatsappUrl, '_blank', 'noopener'),
          },
          duration: 8000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [reset, whatsappUrl]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SEO page="contato" />
      <WhatsAppButton />

      <main className="flex-grow">
        <section className="section-padding bg-muted relative overflow-hidden">

          <div className="container-custom relative z-10">

            {/* HEADER — mesmo padrão de ServicosPage / ResultadosPage */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-px bg-primary" />
                <span className="text-primary font-bold uppercase tracking-widest text-sm">
                  {pageConfig.header_badge}
                </span>
                <div className="w-8 h-px bg-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-foreground">
                {pageConfig.header_title}{' '}
                <span className="text-primary">{pageConfig.header_highlight}</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {pageConfig.header_subtitle}
              </p>
            </div>

            {/* GRID PRINCIPAL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

              {/* ── FORMULÁRIO ── */}
              <div>
                {submitted ? (
                  /* Estado de sucesso */
                  <div className="bg-card rounded-xl border border-border shadow-sm p-8 sm:p-10 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{t('contact_form.success_title', 'Mensagem enviada!')}</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                      {t('contact_form.success_text', 'Recebemos seu contato e retornaremos em breve. Você também pode nos chamar diretamente pelo WhatsApp.')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
                      <button
                        onClick={() => setSubmitted(false)}
                        className="flex-1 h-11 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        {t('contact_form.send_another', 'Enviar outro')}
                      </button>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-11 rounded-lg bg-[#25D366] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1ebe5d] transition-colors"
                      >
                        <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                      </a>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                  >
                    {/* Cabeçalho do form */}
                    <div className="px-6 sm:px-8 py-5 border-b border-border">
                      <h2 className="text-lg font-bold text-foreground">
                        {pageConfig.form_title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('contact_form.subtitle', 'Preencha os campos abaixo e entraremos em contato')}
                      </p>
                    </div>

                    <div className="px-6 sm:px-8 py-6 space-y-5">

                      {/* Nome + Telefone lado a lado no sm+ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                            {t('contact_form.name_label', 'Nome completo')} {t('common.required', '*')}
                          </Label>
                          <Input
                            id="nome"
                            {...register('nome', { required: t('errors.name_required', 'Nome é obrigatório') })}
                            className={`mt-1.5 h-11 ${errors.nome ? 'border-destructive' : ''}`}
                            placeholder={t('contact_form.name_placeholder', 'Seu nome')}
                          />
                          {errors.nome && (
                            <p className="text-xs text-destructive mt-1 font-medium">{errors.nome.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="telefone" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                            {t('contact_form.phone_label', 'WhatsApp / Telefone')} {t('common.required', '*')}
                          </Label>
                          <Input
                            id="telefone"
                            {...register('telefone', { required: t('errors.phone_required', 'Telefone é obrigatório') })}
                            className={`mt-1.5 h-11 ${errors.telefone ? 'border-destructive' : ''}`}
                            placeholder={t('contact_form.phone_placeholder', '(62) 99999-9999')}
                          />
                          {errors.telefone && (
                            <p className="text-xs text-destructive mt-1 font-medium">{errors.telefone.message}</p>
                          )}
                        </div>
                      </div>

                      {/* E-mail */}
                      <div>
                        <Label htmlFor="email" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                          {t('contact_form.email_label', 'E-mail')} {t('common.required', '*')}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email', {
                            required: t('errors.email_required', 'E-mail é obrigatório'),
                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t('errors.email_invalid', 'E-mail inválido') },
                          })}
                          className={`mt-1.5 h-11 ${errors.email ? 'border-destructive' : ''}`}
                          placeholder="seu@email.com"
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
                        )}
                      </div>

                      {/* Serviço */}
                      <div>
                        <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                          {t('contact_form.service_label', 'Serviço de interesse')}
                        </Label>
                        <Select onValueChange={(v) => setValue('tipo_servico', v)}>
                          <SelectTrigger className="mt-1.5 h-11">
                            <SelectValue placeholder={t('contact_form.service_placeholder', 'Selecione um serviço')} />
                          </SelectTrigger>
                          <SelectContent>
                            {applyServicesTrad(services).map(s => (
                              <SelectItem key={s.id} value={s.nome}>{s.nome}</SelectItem>
                            ))}
                            <SelectItem value="outro">{t('contact_form.service_other', 'Outro / Não sei ainda')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Mensagem */}
                      <div>
                        <Label htmlFor="mensagem" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                          {t('contact_form.message_label', 'Mensagem')}{' '}
                          <span className="font-normal normal-case tracking-normal">{t('contact_form.message_optional', '(opcional)')}</span>
                        </Label>
                        <Textarea
                          id="mensagem"
                          {...register('mensagem')}
                          className="mt-1.5 resize-none"
                          rows={3}
                          placeholder={t('contact_form.message_placeholder', 'Conte brevemente sobre seu caso ou dúvidas…')}
                        />
                      </div>

                      {/* Privacidade */}
                      <div className="flex items-start gap-3 bg-muted rounded-lg p-3">
                        <input
                          id="privacy"
                          type="checkbox"
                          checked={privacyChecked}
                          onChange={(e) => setPrivacyChecked(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary cursor-pointer"
                        />
                        <label htmlFor="privacy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                          {t('contact_form.privacy_pre', 'Li e concordo com a')}{' '}
                          <Link to="/politica-de-privacidade" className="text-primary font-semibold hover:underline underline-offset-2">
                            {t('contact_form.privacy_link', 'Política de Privacidade')}
                          </Link>{' '}
                          {t('contact_form.privacy_post', 'e autorizo o uso dos meus dados para contato.')} {t('common.required', '*')}
                        </label>
                      </div>

                      {/* Botão enviar */}
                      <button
                        type="submit"
                        disabled={isSubmitting || !privacyChecked}
                        className="btn-primary w-full h-12 flex items-center justify-center gap-2
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                            {t('contact_form.sending', 'Enviando…')}
                          </>
                        ) : t('contact_form.send_button', 'Enviar Mensagem')}
                      </button>

                    </div>
                  </form>
                )}
              </div>

              {/* ── INFORMAÇÕES + MAPA ── */}
              <div className="space-y-6">

                {/* Card de informações de contato */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-bold text-foreground">
                      {pageConfig.info_title}
                    </h2>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { icon: MapPin, label: t('footer.location_label', 'Endereço'),  value: config.endereco,                                     href: mapLink,                        external: true },
                      { icon: Phone,  label: t('footer.phone_label',    'Telefone'),  value: config.telefone,                                     href: formatTelHref(config.telefone),  external: false },
                      { icon: Mail,   label: t('footer.email_label',    'E-mail'),    value: config.email,                                        href: `mailto:${config.email}`,        external: false },
                      { icon: Clock,  label: t('footer.schedule_label', 'Horário'),   value: `${translatedConfig.dias_funcionamento} · ${translatedConfig.horario}`,  href: null },
                    ].map(({ icon: Icon, label, value, href, external }) => (
                      <div key={label} className="px-6 py-4 flex items-start gap-4 group">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                          {href ? (
                            <a
                              href={href}
                              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                              className="text-sm text-foreground hover:text-primary transition-colors break-words"
                            >
                              {value}
                            </a>
                          ) : (
                            <p className="text-sm text-foreground break-words">{value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Redes sociais */}
                {(config.instagram || config.facebook) && (
                  <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">{t('contact_form.follow_us', 'Siga-nos')}</p>
                    <div className="flex gap-3">
                      {config.instagram && (
                        <a
                          href={config.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-border
                                     text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground
                                     hover:border-primary transition-all"
                        >
                          <Instagram className="w-4 h-4" /> Instagram
                        </a>
                      )}
                      {config.facebook && (
                        <a
                          href={config.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-border
                                     text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground
                                     hover:border-primary transition-all"
                        >
                          <Facebook className="w-4 h-4" /> Facebook
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Mapa — Estética Clínica Premium */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-primary/20" style={{ aspectRatio: '4/3' }}>

                  {/* Iframe com filtro quente e suave */}
                  <iframe
                    src={`https://maps.google.com/maps?q=${mapQuery}&z=${config.zoom || '17'}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      filter: 'saturate(0.55) brightness(1.05) sepia(18%)',
                      pointerEvents: 'none',
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização Instituto Milhomem"
                  />

                  {/* Vinheta suave nas bordas */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{ boxShadow: 'inset 0 0 60px 10px rgba(0,0,0,0.18)' }}
                  />

                  {/* Overlay dourado muito sutil */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(var(--primary-rgb, 180,140,60),0.08) 100%)' }} />

                  {/* Card flutuante inferior — glassmorphism elegante */}
                  <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4">
                    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/60 px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Ícone pin dourado */}
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-primary uppercase tracking-widest leading-none mb-0.5">
                            Instituto Milhomem
                          </p>
                          <p className="text-xs text-slate-500 truncate leading-tight">
                            {config.endereco || 'Goiânia, GO'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1.5 bg-primary text-white text-[11px] font-semibold px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
                      >
                        {t('contact_map.open_maps', 'Traçar Rota')}
                      </a>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContatoPage;
