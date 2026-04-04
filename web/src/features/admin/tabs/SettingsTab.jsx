// src/features/admin/tabs/SettingsTab.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, Palette, Type, ImageIcon, Search, LayoutList } from 'lucide-react';
import { Button }   from '@/components/ui/button.jsx';
import { Input }    from '@/components/ui/input.jsx';
import { Label }    from '@/components/ui/label.jsx';
import { Switch }   from '@/components/ui/switch.jsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.jsx';

// ─── Bloco de cor (picker + hex input + preview) ──────────────────────────────
const ColorField = ({ register, watch, name, label, description }) => {
  const value = watch(name) || '#000000';

  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase tracking-wider">{label}</Label>
      {description && (
        <p className="text-[11px] text-muted-foreground">{description}</p>
      )}
      <div className="flex items-center gap-3">
        {/* Color picker nativo */}
        <label
          className="w-10 h-10 rounded-lg border border-border cursor-pointer overflow-hidden shadow-sm flex-shrink-0"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            {...register(name)}
            className="sr-only"
          />
        </label>
        {/* Hex input */}
        <Input
          {...register(name, {
            pattern: { value: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, message: 'Hex inválido' },
          })}
          placeholder="#000000"
          className="w-36 font-mono text-sm uppercase"
          maxLength={7}
        />
        {/* Preview badge */}
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: value, color: isLight(value) ? '#1A1A1A' : '#FFFFFF' }}
        >
          Preview
        </span>
      </div>
    </div>
  );
};

// Determina se a cor é clara para contraste do texto de preview
function isLight(hex) {
  if (!hex || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Luminância relativa
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ─── Feedback inline de status ────────────────────────────────────────────────
const SaveStatus = ({ status }) => {
  if (!status) return null;
  const config = {
    saving: { icon: Loader2, text: 'Salvando...',           cls: 'text-muted-foreground', spin: true  },
    saved:  { icon: CheckCircle2, text: 'Salvo com sucesso!', cls: 'text-green-600',        spin: false },
    error:  { icon: AlertCircle, text: 'Erro ao salvar.',    cls: 'text-destructive',       spin: false },
  }[status];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${config.cls}`}>
      <Icon className={`w-4 h-4 ${config.spin ? 'animate-spin' : ''}`} />
      {config.text}
    </div>
  );
};

// ─── Tab principal ────────────────────────────────────────────────────────────
const SettingsTab = ({ settingsForm, saveStatus, onSettingsSubmit }) => {
  const { register, handleSubmit, watch, setValue, formState: { isDirty } } = settingsForm;
  const robotsNoindex  = watch('robots_noindex');
  const blogDisabled   = watch('blog_disabled');

  return (
    <div className="space-y-6">

      {/* ── Tema Visual ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <CardTitle>Tema Visual</CardTitle>
          </div>
          <CardDescription>
            Personalize as cores do site. As mudanças ficam visíveis imediatamente
            no painel. Recarregue a página do site para os visitantes verem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSettingsSubmit)} className="space-y-8">

            {/* Cores principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <ColorField
                register={register}
                watch={watch}
                name="primary_color"
                label="Cor Primária"
                description="Botões, destaques, links e badges"
              />
              <ColorField
                register={register}
                watch={watch}
                name="secondary_color"
                label="Cor Secundária"
                description="Títulos, header escuro e textos principais"
              />
              <ColorField
                register={register}
                watch={watch}
                name="accent_color"
                label="Cor de Destaque"
                description="Hover de botões e elementos de ênfase"
              />
              <ColorField
                register={register}
                watch={watch}
                name="background_color"
                label="Fundo Principal"
                description="Cor de fundo da página"
              />
              <ColorField
                register={register}
                watch={watch}
                name="foreground_color"
                label="Texto Principal"
                description="Cor do corpo de texto"
              />
            </div>

            {/* Preview das cores */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                Preview das cores
              </div>
              <div className="p-4 flex flex-wrap gap-3 items-center" style={{ backgroundColor: watch('background_color') || '#fff' }}>
                <span className="text-sm font-bold" style={{ color: watch('secondary_color') || '#181B1E' }}>
                  Título
                </span>
                <span className="text-sm" style={{ color: watch('foreground_color') || '#1A1A1A' }}>
                  Texto do corpo
                </span>
                <button
                  type="button"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: watch('primary_color') || '#C8A16E', color: isLight(watch('primary_color') || '#C8A16E') ? '#1A1A1A' : '#fff' }}
                >
                  Botão primário
                </button>
                <button
                  type="button"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: watch('accent_color') || '#FFDEA4', color: isLight(watch('accent_color') || '#FFDEA4') ? '#1A1A1A' : '#fff' }}
                >
                  Hover / destaque
                </button>
              </div>
            </div>

            {/* ── Identidade ────────────────────────────────────────────── */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Type className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-secondary">
                  Identidade
                </h3>
              </div>
              <div className="max-w-sm space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Nome do site
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Usado em títulos de abas e meta tags
                </p>
                <Input
                  {...register('site_name', { required: 'Nome do site é obrigatório' })}
                  placeholder="Instituto Milhomem"
                  className="mt-1"
                />
              </div>
            </div>

            {/* ── Tamanho da Logo ───────────────────────────────────────── */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-secondary">
                  Tamanho da Logo
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Header */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Header
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Altura da logo no topo da página (px). Padrão: 56
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={24}
                      max={120}
                      step={4}
                      {...register('logo_size_header', { min: 24, max: 120 })}
                      className="flex-1 accent-primary"
                    />
                    <span className="w-12 text-center text-sm font-bold tabular-nums bg-muted rounded-lg px-2 py-1">
                      {watch('logo_size_header') || 56}px
                    </span>
                  </div>
                  {/* Preview */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                    <img
                      src={undefined}
                      alt=""
                      style={{ height: Number(watch('logo_size_header')) || 56 }}
                      className="object-contain opacity-0 pointer-events-none"
                    />
                    <div
                      className="rounded bg-primary/30 flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ height: Number(watch('logo_size_header')) || 56, width: (Number(watch('logo_size_header')) || 56) * 2.5 }}
                    >
                      LOGO ({watch('logo_size_header') || 56}px)
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Footer
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Altura da logo no rodapé da página (px). Padrão: 48
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={24}
                      max={120}
                      step={4}
                      {...register('logo_size_footer', { min: 24, max: 120 })}
                      className="flex-1 accent-primary"
                    />
                    <span className="w-12 text-center text-sm font-bold tabular-nums bg-muted rounded-lg px-2 py-1">
                      {watch('logo_size_footer') || 48}px
                    </span>
                  </div>
                  {/* Preview */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                    <div
                      className="rounded bg-primary/30 flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ height: Number(watch('logo_size_footer')) || 48, width: (Number(watch('logo_size_footer')) || 48) * 2.5 }}
                    >
                      LOGO ({watch('logo_size_footer') || 48}px)
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Indexação nos buscadores ──────────────────────────────── */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Search className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-secondary">
                  Indexação nos Buscadores
                </h3>
              </div>

              <div className="flex items-start justify-between gap-6 rounded-xl border border-border p-5">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-semibold">
                    Bloquear indexação do site
                  </Label>
                  <p className="text-[12px] text-muted-foreground">
                    Quando ativado, todas as páginas recebem{' '}
                    <code className="bg-muted px-1 rounded text-[11px]">noindex, nofollow</code>{' '}
                    — o Google e outros buscadores deixam de indexar o site.
                    Use durante manutenções ou antes do lançamento oficial.
                  </p>
                  {robotsNoindex === 'true' ? (
                    <p className="text-[12px] font-semibold text-destructive mt-2">
                      ⚠️ Site atual: NÃO indexado pelos buscadores.
                    </p>
                  ) : (
                    <p className="text-[12px] font-semibold text-green-600 mt-2">
                      ✓ Site atual: indexado normalmente.
                    </p>
                  )}
                </div>
                <Switch
                  checked={robotsNoindex === 'true'}
                  onCheckedChange={(checked) =>
                    setValue('robots_noindex', checked ? 'true' : 'false', { shouldDirty: true })
                  }
                />
              </div>
            </div>

            {/* ── Conteúdo ──────────────────────────────────────────────── */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <LayoutList className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-secondary">
                  Conteúdo
                </h3>
              </div>

              <div className="flex items-start justify-between gap-6 rounded-xl border border-border p-5">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-semibold">
                    Desativar Blog
                  </Label>
                  <p className="text-[12px] text-muted-foreground">
                    Quando ativado, o link "Blog" some do menu e os endereços{' '}
                    <code className="bg-muted px-1 rounded text-[11px]">/blog</code> e{' '}
                    <code className="bg-muted px-1 rounded text-[11px]">/blog/:artigo</code>{' '}
                    redirecionam para a página inicial. Útil enquanto não houver conteúdo publicado.
                  </p>
                  {blogDisabled === 'true' ? (
                    <p className="text-[12px] font-semibold text-amber-600 mt-2">
                      Blog desativado — link oculto no menu.
                    </p>
                  ) : (
                    <p className="text-[12px] font-semibold text-green-600 mt-2">
                      ✓ Blog ativo e visível no menu.
                    </p>
                  )}
                </div>
                <Switch
                  checked={blogDisabled === 'true'}
                  onCheckedChange={(checked) =>
                    setValue('blog_disabled', checked ? 'true' : 'false', { shouldDirty: true })
                  }
                />
              </div>
            </div>

            {/* ── Botão de salvar + status ───────────────────────────────── */}
            <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                type="submit"
                disabled={!isDirty || saveStatus === 'saving'}
                className="bg-primary text-secondary hover:bg-primary/90 font-bold uppercase tracking-wide px-8"
              >
                {saveStatus === 'saving' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                ) : (
                  'Salvar Configurações'
                )}
              </Button>
              <SaveStatus status={saveStatus} />
              {saveStatus === 'saved' && (
                <p className="text-[11px] text-muted-foreground">
                  Recarregue a página do site para os visitantes verem as mudanças.
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
