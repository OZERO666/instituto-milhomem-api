// src/features/admin/tabs/FaqTab.jsx
import React, { useState, useMemo } from 'react';
import { Edit, Trash2, Upload, Loader2, Search, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import TabLoader from '@/features/admin/components/TabLoader.jsx';
import Pagination from '@/features/admin/components/Pagination.jsx';
import { usePagination } from '@/features/admin/hooks/usePagination.js';

const FieldError = ({ error }) =>
  error ? <p className="text-xs text-destructive mt-1">{error.message || 'Campo obrigatório'}</p> : null;

const FaqTab = ({
  faqItems, isLoading, faqForm, editingItem, setEditingItem,
  onGenericSubmit, onDelete,
}) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = faqForm;
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqItems;
    return faqItems.filter(f =>
      f.pergunta?.toLowerCase().includes(q) ||
      f.resposta?.toLowerCase().includes(q)
    );
  }, [faqItems, query]);

  const { paged, page, setPage, totalPages, from, to, total } = usePagination(filtered, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ── Formulário ── */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-secondary border-b border-border pb-3">
            {editingItem ? 'Editar Pergunta' : 'Nova Pergunta'}
          </h2>

          <form onSubmit={handleSubmit(data => onGenericSubmit('faq', data))} className="space-y-5">
            <div>
              <Label className="font-bold">Pergunta</Label>
              <Input
                {...register('pergunta', { required: 'Informe a pergunta' })}
                className="mt-2 focus-visible:ring-primary"
                placeholder="Ex: O transplante é permanente?"
              />
              <FieldError error={errors.pergunta} />
            </div>

            <div>
              <Label className="font-bold">Resposta</Label>
              <Textarea
                {...register('resposta', { required: 'Informe a resposta' })}
                rows={5}
                className="mt-2 resize-y focus-visible:ring-primary"
                placeholder="Resposta detalhada..."
              />
              <FieldError error={errors.resposta} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">Ordem</Label>
                <Input
                  type="number"
                  {...register('ordem', { valueAsNumber: true })}
                  className="mt-2 focus-visible:ring-primary"
                  min={0}
                />
              </div>
              <div>
                <Label className="font-bold">Visível</Label>
                <select
                  {...register('ativo', { valueAsNumber: true })}
                  className="mt-2 w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value={1}>Sim</option>
                  <option value={0}>Não</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-primary-foreground hover:bg-secondary hover:text-white font-bold uppercase tracking-wide"
              >
                {isSubmitting
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <Upload className="w-4 h-4 mr-2" />}
                {editingItem ? 'Atualizar' : 'Adicionar'}
              </Button>
              {editingItem && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setEditingItem(null); reset({ pergunta: '', resposta: '', ordem: 0, ativo: 1 }); }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── Lista ── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-secondary">Perguntas Cadastradas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 w-48"
            />
          </div>
        </div>

        {isLoading ? (
          <TabLoader rows={4} />
        ) : paged.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            {query ? 'Nenhuma pergunta encontrada.' : 'Nenhuma pergunta cadastrada.'}
          </p>
        ) : paged.map((item, idx) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl p-5 border shadow-sm transition-colors ${
              item.ativo ? 'border-border hover:border-primary/50' : 'border-border/40 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    #{item.ordem ?? idx + 1}
                  </span>
                  {!item.ativo && (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Oculto
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-secondary text-sm mb-1 truncate">{item.pergunta}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.resposta}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="icon" variant="outline"
                  onClick={() => { setEditingItem(item); reset(item); }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon" variant="destructive"
                  onClick={() => onDelete('faq', item.id, item.pergunta)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} from={from} to={to} total={total} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
};

export default FaqTab;
