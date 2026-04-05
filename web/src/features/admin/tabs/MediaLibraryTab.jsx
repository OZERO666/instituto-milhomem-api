import React, { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Folder, Image as ImageIcon, Loader2, Maximize2, RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet.jsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.jsx';
import { useMediaLibrary } from '@/features/admin/hooks/useMediaLibrary.js';
import TabLoader from '@/features/admin/components/TabLoader.jsx';

const FOLDER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'galeria', label: 'Galeria' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'depoimentos', label: 'Depoimentos' },
  { value: 'artigos', label: 'Artigos' },
  { value: 'misc', label: 'Misc' },
];

function formatBytes(value) {
  if (!value) return '0 B';
  const units = ['B', 'KB', 'MB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / 1024 ** index;
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MediaLibraryTab() {
  const { assets, isLoading, isDeleting, nextCursor, activeFolder, fetchMedia, loadMore, deleteAsset } = useMediaLibrary();
  const [query, setQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchMedia('all');
  }, [fetchMedia]);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return assets;
    return assets.filter((asset) =>
      [asset.public_id, asset.folder, asset.format]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [assets, query]);

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copiada!');
    } catch {
      toast.error('Não foi possível copiar a URL');
    }
  };

  const handleOpenDetails = (asset) => {
    setSelectedAsset(asset);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    await deleteAsset(confirmDelete.public_id);
    if (selectedAsset?.public_id === confirmDelete.public_id) setSelectedAsset(null);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Biblioteca De Mídia</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Arquivos hospedados no Cloudinary. Clique em qualquer imagem para ver detalhes ou deletar.
            </p>
          </div>
          <Button variant="outline" onClick={() => fetchMedia(activeFolder)} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Atualizar
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex flex-wrap gap-2">
            {FOLDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => fetchMedia(option.value)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  activeFolder === option.value ? 'bg-primary text-secondary shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="relative lg:ml-auto lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por pasta, nome, formato..." className="pl-9" />
          </div>
        </div>
      </div>

      {isLoading && assets.length === 0 ? (
        <TabLoader rows={3} />
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-border p-10 text-center text-muted-foreground">
          Nenhum arquivo encontrado para os filtros atuais.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.asset_id}
              className="bg-white rounded-xl border border-border shadow-sm overflow-hidden hover:border-primary/40 transition-colors cursor-pointer group"
              onClick={() => handleOpenDetails(asset)}
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                {asset.thumbnail_url ? (
                  <img src={asset.thumbnail_url} alt={asset.public_id} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="w-6 h-6 text-white drop-shadow" />
                </div>
              </div>
              <div className="p-4 space-y-2">
                <p className="font-semibold text-secondary break-all line-clamp-1 text-sm">{asset.public_id.split('/').pop()}</p>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Folder className="w-3 h-3" />{asset.folder || 'sem pasta'}</span>
                  <Badge variant="outline" className="text-xs">{asset.format?.toUpperCase()}</Badge>
                  <Badge variant="outline" className="text-xs">{formatBytes(asset.bytes)}</Badge>
                  {asset.width && <Badge variant="outline" className="text-xs">{asset.width}×{asset.height}</Badge>}
                </div>
                <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => handleCopy(asset.secure_url)}>
                    <Copy className="w-3.5 h-3.5" /> Copiar URL
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => { setConfirmDelete(asset); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Carregar mais
          </Button>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedAsset} onOpenChange={(open) => { if (!open) setSelectedAsset(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="truncate">{selectedAsset?.public_id?.split('/').pop()}</SheetTitle>
          </SheetHeader>

          {selectedAsset && (
            <div className="space-y-6 mt-4">
              {/* Preview */}
              <div className="rounded-lg overflow-hidden border border-border bg-muted aspect-video flex items-center justify-center">
                <img
                  src={selectedAsset.secure_url}
                  alt={selectedAsset.public_id}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-secondary">Informações</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Pasta</div>
                  <div className="font-medium text-right">{selectedAsset.folder || '—'}</div>
                  <div className="text-muted-foreground">Formato</div>
                  <div className="font-medium text-right">{selectedAsset.format?.toUpperCase() || '—'}</div>
                  <div className="text-muted-foreground">Tamanho</div>
                  <div className="font-medium text-right">{formatBytes(selectedAsset.bytes)}</div>
                  {selectedAsset.width && <>
                    <div className="text-muted-foreground">Dimensões</div>
                    <div className="font-medium text-right">{selectedAsset.width} × {selectedAsset.height} px</div>
                  </>}
                  <div className="text-muted-foreground">Criado em</div>
                  <div className="font-medium text-right text-xs">{formatDate(selectedAsset.created_at)}</div>
                  <div className="text-muted-foreground col-span-2 border-t pt-2 text-xs break-all">
                    <span className="font-semibold">public_id:</span> {selectedAsset.public_id}
                  </div>
                </div>
              </div>

              {/* URL */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-secondary">URL da imagem</p>
                <div className="flex gap-2">
                  <Input value={selectedAsset.secure_url} readOnly className="flex-1 text-xs" />
                  <Button size="icon" variant="outline" onClick={() => handleCopy(selectedAsset.secure_url)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button variant="outline" className="gap-2 w-full" asChild>
                  <a href={selectedAsset.secure_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4" /> Abrir imagem original
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2 w-full"
                  onClick={() => setConfirmDelete(selectedAsset)}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" /> Deletar permanentemente
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar imagem permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-mono text-xs break-all">{confirmDelete?.public_id}</span> será removida do Cloudinary e não poderá ser recuperada. Se estiver em uso no site, ficará quebrada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
