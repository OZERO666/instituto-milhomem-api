import React, { useState, useMemo } from 'react';
import {
  Edit, Trash2, Upload, Loader2, ChevronUp, ChevronDown, Search, ChevronDown as CaretDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import TabLoader from '@/features/admin/components/TabLoader.jsx';
import MediaSelectorField from '@/features/admin/components/MediaSelectorField.jsx';
import TranslationFields from '@/features/admin/components/TranslationFields.jsx';
import PhosphorIcon from '@/components/PhosphorIcon.jsx';
import {
  HairTransplantIcon, HairFUEIcon, HairDHIIcon, BeardTransplantIcon,
  EyebrowTransplantIcon, SkinCleansingIcon, PeelingLaserIcon, SkinHydrationIcon,
  SkinRejuvenationIcon, BeforeAfterIcon, MedicalConsultIcon, NaturalResultIcon,
  HairlineDesignIcon, FollicleHealthIcon, GraftDensityIcon,
  ScalpAnalysisIcon, PrecisionImplantIcon, PostOpCareIcon,
} from '@/components/icons/AestheticIcons.jsx';

const phosphorIconModules = import.meta.glob('/node_modules/@phosphor-icons/react/dist/csr/*.es.js');
const PHOSPHOR_ICON_KEYS = Object.keys(phosphorIconModules)
  .map((path) => path.split('/').pop()?.replace('.es.js', ''))
  .filter(Boolean)
  .filter((name) => name !== 'IconBase')
  .sort((a, b) => a.localeCompare(b));

const formatIconLabel = (key) => key
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/\s+/g, ' ')
  .trim();

const CUSTOM_ICON_OPTIONS = [
  { key: 'HairTransplantIcon',    label: 'Transplante Capilar',     Component: HairTransplantIcon },
  { key: 'HairFUEIcon',           label: 'Técnica FUE',             Component: HairFUEIcon },
  { key: 'HairDHIIcon',           label: 'Técnica DHI (caneta)',     Component: HairDHIIcon },
  { key: 'BeardTransplantIcon',   label: 'Transplante de Barba',    Component: BeardTransplantIcon },
  { key: 'EyebrowTransplantIcon', label: 'Trspl. de Sobrancelhas',  Component: EyebrowTransplantIcon },
  { key: 'SkinCleansingIcon',     label: 'Limpeza de Pele',         Component: SkinCleansingIcon },
  { key: 'PeelingLaserIcon',      label: 'Peeling / Laser',         Component: PeelingLaserIcon },
  { key: 'SkinHydrationIcon',     label: 'Hidratação da Pele',      Component: SkinHydrationIcon },
  { key: 'SkinRejuvenationIcon',  label: 'Rejuvenescimento',        Component: SkinRejuvenationIcon },
  { key: 'BeforeAfterIcon',       label: 'Antes e Depois',          Component: BeforeAfterIcon },
  { key: 'MedicalConsultIcon',    label: 'Consulta Médica',         Component: MedicalConsultIcon },
  { key: 'NaturalResultIcon',     label: 'Resultado Natural',       Component: NaturalResultIcon },
  { key: 'HairlineDesignIcon',    label: 'Desenho da Linha Frontal', Component: HairlineDesignIcon },
  { key: 'FollicleHealthIcon',    label: 'Saúde Folicular',         Component: FollicleHealthIcon },
  { key: 'GraftDensityIcon',      label: 'Densidade de Enxertos',   Component: GraftDensityIcon },
  { key: 'ScalpAnalysisIcon',     label: 'Análise do Couro Cabeludo', Component: ScalpAnalysisIcon },
  { key: 'PrecisionImplantIcon',  label: 'Precisão de Implantação', Component: PrecisionImplantIcon },
  { key: 'PostOpCareIcon',        label: 'Pós-operatório Capilar',  Component: PostOpCareIcon },
];

const PHOSPHOR_ICON_OPTIONS = PHOSPHOR_ICON_KEYS.map((key) => ({
  key,
  label: `Phosphor: ${formatIconLabel(key)}`,
  Component: ({ className }) => <PhosphorIcon name={key} size={28} className={className} />,
}));

const ICON_OPTIONS = [...CUSTOM_ICON_OPTIONS, ...PHOSPHOR_ICON_OPTIONS];

export const ICON_MAP = Object.fromEntries(ICON_OPTIONS.map(o => [o.key, o.Component]));

function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = ICON_OPTIONS.find(o => o.key === value);
  const SelectedIcon = selected?.Component;
  const matchingOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_OPTIONS;
    return ICON_OPTIONS.filter(o =>
      o.label.toLowerCase().includes(q) ||
      o.key.toLowerCase().includes(q)
    );
  }, [query]);
  const filteredOptions = useMemo(() => {
    if (query.trim()) return matchingOptions;
    // Sem filtro, mostra todos os customizados + um lote inicial de Phosphor.
    return [...CUSTOM_ICON_OPTIONS, ...PHOSPHOR_ICON_OPTIONS.slice(0, 120)];
  }, [query, matchingOptions]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 border border-input rounded-md bg-background text-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
      >
        {SelectedIcon
          ? <SelectedIcon className="w-5 h-5 text-primary shrink-0" />
          : <span className="w-5 h-5 rounded border border-dashed border-muted-foreground shrink-0" />}
        <span className="flex-1 text-left">{selected?.label || 'Selecionar ícone...'}</span>
        <CaretDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-border rounded-xl shadow-xl p-3 space-y-2">
          <div className="space-y-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ícone (ex: scissor, heart, user)..."
              className="h-8 text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Mostrando {filteredOptions.length} de {ICON_OPTIONS.length} ícones
            </p>
            {!query.trim() && (
              <p className="text-[10px] text-muted-foreground">
                Dica: digite para pesquisar entre todos os ícones Phosphor.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
            {/* Opção "nenhum" */}
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border text-xs transition-colors
                ${!value ? 'border-primary bg-primary/10 text-primary' : 'border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground'}`}
            >
              <span className="w-7 h-7 rounded border-2 border-dashed border-current flex items-center justify-center text-lg leading-none">∅</span>
              <span>Nenhum</span>
            </button>

            {filteredOptions.map(({ key, label, Component }) => (
              <button
                key={key}
                type="button"
                onClick={() => { onChange(key); setOpen(false); setQuery(''); }}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border text-xs transition-colors
                  ${value === key ? 'border-primary bg-primary/10 text-primary' : 'border-transparent hover:border-border hover:bg-muted/50 text-secondary'}`}
              >
                <Component className="w-7 h-7" />
                <span className="text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const FieldError = ({ error }) =>
  error ? <p className="text-xs text-destructive mt-1">{error.message || 'Campo obrigatório'}</p> : null;

const ServicosTab = ({ services, isLoading, serviceForm, editingItem, setEditingItem, onGenericSubmit, onDelete, onReorder }) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = serviceForm;
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(s =>
      s.nome?.toLowerCase().includes(q) ||
      s.slug?.toLowerCase().includes(q) ||
      s.descricao?.toLowerCase().includes(q)
    );
  }, [services, query]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-secondary border-b border-border pb-3">
            {editingItem ? 'Editar Serviço' : 'Adicionar Serviço'}
          </h2>
          <form onSubmit={handleSubmit(data => onGenericSubmit('servicos', data))} className="space-y-5">
            <div>
              <Label htmlFor="nome-servico" className="font-bold">Nome do Serviço</Label>
              <Input id="nome-servico" {...register('nome', { required: 'Informe o nome do serviço' })} className="mt-2 focus-visible:ring-primary" />
              <FieldError error={errors.nome} />
            </div>
            <div>
              <Label className="font-bold">Slug (URL)</Label>
              <Input {...register('slug', { required: 'Informe o slug', pattern: { value: /^[a-z0-9-]+$/, message: 'Use apenas letras minúsculas, números e hífens' } })} placeholder="ex: transplante-fue" className="mt-2 focus-visible:ring-primary" />
              <FieldError error={errors.slug} />
              {!errors.slug && <p className="text-[10px] text-muted-foreground mt-1">Use apenas letras minúsculas, números e hífens.</p>}
            </div>
            <div>
              <Label className="font-bold">Descrição</Label>
              <Textarea {...register('descricao')} rows={3} className="mt-2 resize-none focus-visible:ring-primary" />
            </div>
            <div>
              <Label className="font-bold">Benefícios (separados por vírgula)</Label>
              <Textarea {...register('beneficios')} rows={3} className="mt-2 resize-none focus-visible:ring-primary" />
            </div>
            <div>
              <Label className="font-bold">Ícone do Serviço ({ICON_OPTIONS.length} opções totais)</Label>
              <div className="mt-2">
                <IconPicker value={watch('icon')} onChange={val => setValue('icon', val, { shouldDirty: true })} />
              </div>
            </div>
            <div>
              <Label className="font-bold">Ordem de Exibição</Label>
              <Input type="number" {...register('ordem')} className="mt-2 focus-visible:ring-primary" />
            </div>
            <div className="p-4 border border-dashed border-border rounded-lg bg-muted/30">
              <input type="hidden" {...register('imagem')} />
              <MediaSelectorField
                label="Imagem Representativa"
                value={watch('imagem') || ''}
                onChange={(nextValue) => setValue('imagem', nextValue, { shouldDirty: true })}
                folder="servicos"
                libraryFolders={['all', 'servicos', 'misc']}
                previewClassName="h-24"
                helperText="Use uma imagem já existente da biblioteca ou envie uma nova direto para o Cloudinary."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-primary-foreground hover:bg-secondary hover:text-white font-bold uppercase tracking-wide">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {editingItem ? 'Atualizar' : 'Adicionar'}
              </Button>
              {editingItem && (
                <Button type="button" variant="outline" onClick={() => { setEditingItem(null); reset(); }}>Cancelar</Button>
              )}
            </div>
          </form>

          <TranslationFields
            tabela="servicos"
            registroId={editingItem?.id}
            originalData={editingItem}
            fields={[
              { name: 'nome',       label: 'Nome',       type: 'input'    },
              { name: 'descricao',  label: 'Descrição',  type: 'textarea', rows: 3 },
              { name: 'beneficios', label: 'Benefícios',  type: 'textarea', rows: 3 },
              { name: 'conteudo',   label: 'Conteúdo',   type: 'textarea', rows: 5 },
            ]}
          />
        </div>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-secondary">Serviços Cadastrados</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar serviços..."
              className="pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 w-52"
            />
          </div>
        </div>
        {isLoading ? (
          <TabLoader rows={3} />
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">{query ? 'Nenhum serviço encontrado.' : 'Nenhum serviço cadastrado.'}</p>
        ) : filtered.map((item, idx) => (
          <div key={item.id} className="bg-white rounded-xl p-6 border border-border shadow-sm flex gap-3 hover:border-primary/50 transition-colors">
            <div className="flex flex-col gap-1 justify-center">
              <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => onReorder(idx, 'up')}>
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === services.length - 1} onClick={() => onReorder(idx, 'down')}>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden border border-border">
              {item.imagem
                ? <img src={item.imagem} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Sem img</div>}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg text-secondary">{item.nome}</h3>
                  {item.slug && <p className="text-xs text-muted-foreground">/servicos/{item.slug}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => { setEditingItem(item); reset(item); }}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="destructive" onClick={() => onDelete('servicos', item.id, item.nome)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
              <div className="flex items-center gap-2 mt-2">
                {ICON_MAP[item.icon] && (() => { const Icon = ICON_MAP[item.icon]; return <Icon className="w-5 h-5 text-primary" />; })()}
                <Badge variant="outline">Ordem: {item.ordem || 0}</Badge>
                {item.icon && <Badge variant="secondary" className="text-[10px]">{ICON_OPTIONS.find(o => o.key === item.icon)?.label ?? item.icon}</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicosTab;
