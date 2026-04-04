/**
 * TranslationFields — componente de edição de traduções no painel admin.
 *
 * Exibe abas PT (readonly) | EN | ES com campos editáveis e indicadores
 * visuais de preenchimento. Chama POST /traducoes para salvar.
 *
 * Uso:
 *   <TranslationFields
 *     tabela="servicos"
 *     registroId={editingItem?.id}
 *     fields={[
 *       { name: 'nome',      label: 'Nome',      type: 'input'    },
 *       { name: 'descricao', label: 'Descrição', type: 'textarea', rows: 3 },
 *     ]}
 *     originalData={editingItem}
 *   />
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Globe, CheckCircle2, Circle, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import api from '@/lib/apiServerClient';

const LANGS = [
  { code: 'pt', flag: '🇧🇷', label: 'PT', name: 'Português' },
  { code: 'en', flag: '🇺🇸', label: 'EN', name: 'English'   },
  { code: 'es', flag: '🇪🇸', label: 'ES', name: 'Español'   },
];

/**
 * @param {string}  tabela       - nome da tabela no banco, ex: 'servicos'
 * @param {string|number|null} registroId - ID do registro
 * @param {Array<{name:string, label:string, type:'input'|'textarea', rows?:number}>} fields
 * @param {object}  originalData - dados PT originais do registro
 */
const TranslationFields = ({ tabela, registroId, fields = [], originalData = {} }) => {
  const [activeLang, setActiveLang] = useState('en');
  const [translations, setTranslations] = useState({ en: {}, es: {} });
  const [loadingLang, setLoadingLang] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedLang, setSavedLang] = useState(null);
  const [error, setError] = useState(null);

  const fetchForLocale = useCallback(async (locale) => {
    if (!registroId) return;
    setLoadingLang(locale);
    try {
      const data = await api.get(`/traducoes/${tabela}/${encodeURIComponent(registroId)}?lang=${locale}`);
      setTranslations(prev => ({ ...prev, [locale]: data || {} }));
    } catch (e) {
      console.error(`Erro ao buscar traduções ${locale}:`, e);
    } finally {
      setLoadingLang(null);
    }
  }, [tabela, registroId]);

  // Carrega traduções existentes quando o registroId muda
  useEffect(() => {
    if (!registroId) {
      setTranslations({ en: {}, es: {} });
      return;
    }
    fetchForLocale('en');
    fetchForLocale('es');
  }, [registroId, fetchForLocale]);

  const handleChange = (locale, campo, valor) => {
    setTranslations(prev => ({
      ...prev,
      [locale]: { ...prev[locale], [campo]: valor },
    }));
  };

  const handleSave = async (locale) => {
    setError(null);
    setSaving(true);
    setSavedLang(null);
    try {
      for (const field of fields) {
        const valor = translations[locale]?.[field.name] ?? '';
        await api.post('/traducoes', {
          tabela,
          registro_id: String(registroId),
          campo:       field.name,
          locale,
          valor,
        });
      }
      setSavedLang(locale);
      setTimeout(() => setSavedLang(null), 2500);
    } catch (e) {
      setError('Erro ao salvar. Verifique se você está autenticado.');
    } finally {
      setSaving(false);
    }
  };

  const hasTranslation = (locale) => {
    const tr = translations[locale] || {};
    return fields.some(f => tr[f.name]?.trim());
  };

  // ── Estado sem registroId ──────────────────────────────────────────────────
  if (!registroId) {
    return (
      <div className="bg-muted/30 rounded-xl p-6 border border-dashed border-border text-center text-sm text-muted-foreground">
        Salve o registro primeiro para adicionar traduções.
      </div>
    );
  }

  const activeLangName = LANGS.find(l => l.code === activeLang)?.name ?? '';

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Globe className="w-5 h-5 text-primary flex-shrink-0" />
        <div>
          <h3 className="font-bold text-secondary leading-none">Traduções</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Conteúdo para EN e ES exibido quando o visitante trocar de idioma.</p>
        </div>
      </div>

      {/* Abas de idioma */}
      <div className="flex gap-1 mb-5 bg-muted rounded-lg p-1">
        {LANGS.map(lang => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setActiveLang(lang.code)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-sm font-bold transition-all ${
              activeLang === lang.code
                ? 'bg-white shadow-sm text-secondary'
                : 'text-muted-foreground hover:text-secondary'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {lang.code !== 'pt' && (
              hasTranslation(lang.code)
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
                : <Circle className="w-3.5 h-3.5 text-muted-foreground/40 ml-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* Aba PT — somente leitura */}
      {activeLang === 'pt' && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            Conteúdo original em Português. Para editar, use o formulário principal acima.
          </p>
          {fields.map(field => (
            <div key={field.name}>
              <Label className="font-bold text-xs text-muted-foreground uppercase tracking-wide">{field.label}</Label>
              <div className="mt-1 px-3 py-2 bg-muted/30 rounded-md text-sm text-foreground min-h-[36px] whitespace-pre-wrap border border-border/40">
                {originalData?.[field.name]
                  ? <span>{originalData[field.name]}</span>
                  : <span className="text-muted-foreground/40 italic">— vazio —</span>
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aba EN / ES — editável */}
      {activeLang !== 'pt' && (
        <div className="space-y-4">
          {loadingLang === activeLang && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" /> Carregando traduções existentes…
            </div>
          )}

          {fields.map(field => (
            <div key={field.name}>
              <Label className="font-bold text-xs">{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={translations[activeLang]?.[field.name] ?? ''}
                  onChange={e => handleChange(activeLang, field.name, e.target.value)}
                  rows={field.rows || 3}
                  className="mt-1 resize-none focus-visible:ring-primary"
                  placeholder={`${field.label} em ${activeLangName}…`}
                />
              ) : (
                <Input
                  value={translations[activeLang]?.[field.name] ?? ''}
                  onChange={e => handleChange(activeLang, field.name, e.target.value)}
                  className="mt-1 focus-visible:ring-primary"
                  placeholder={`${field.label} em ${activeLangName}…`}
                />
              )}
            </div>
          ))}

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}

          <Button
            type="button"
            onClick={() => handleSave(activeLang)}
            disabled={saving}
            className="w-full bg-primary text-primary-foreground hover:bg-secondary hover:text-white font-bold uppercase tracking-wide"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando…</>
            ) : savedLang === activeLang ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> {LANGS.find(l => l.code === activeLang)?.flag} Salvo com sucesso!</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Salvar em {LANGS.find(l => l.code === activeLang)?.flag} {activeLang.toUpperCase()}</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TranslationFields;
