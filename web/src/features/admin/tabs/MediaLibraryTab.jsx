import React, { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Folder, Image as ImageIcon, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
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

export default function MediaLibraryTab() {
  const { assets, isLoading, isDeleting, nextCursor, activeFolder, fetchMedia, loadMore, deleteAsset } = useMediaLibrary();
  const [query, setQuery] = useState('');
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
      toast.success('URL copiada para a área de transferência');
    } catch {
      toast.error('Não foi possível copiar a URL');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Biblioteca De Mídia</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os arquivos desta biblioteca vêm do Cloudinary. O projeto não usa pasta local `upload` ou `uploads` para mídia.
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
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por pasta, nome, formato..." className="pl-9" />
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
            <div key={asset.asset_id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden hover:border-primary/40 transition-colors">
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {asset.thumbnail_url ? (
                  <img src={asset.thumbnail_url} alt={asset.public_id} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <p className="font-semibold text-secondary break-all line-clamp-2">{asset.public_id}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Folder className="w-3.5 h-3.5" /> {asset.folder || 'sem pasta'}</span>
                    <Badge variant="outline">{asset.format?.toUpperCase() || 'IMG'}</Badge>
                    <Badge variant="outline">{formatBytes(asset.bytes)}</Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => handleCopy(asset.secure_url)}>
                    <Copy className="w-4 h-4" /> Copiar URL
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={asset.secure_url} target="_blank" rel="noreferrer" aria-label="Abrir arquivo no Cloudinary">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setConfirmDelete(asset)}
                    aria-label="Deletar imagem"
                  >
                    <Trash2 className="w-4 h-4" />
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

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar imagem permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              A imagem <span className="font-mono text-xs break-all">{confirmDelete?.public_id}</span> será removida do Cloudinary e não poderá ser recuperada. Se estiver em uso em alguma página do site, ficará quebrada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={async () => {
                if (confirmDelete) {
                  await deleteAsset(confirmDelete.public_id);
                  setConfirmDelete(null);
                }
              }}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Deletar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}