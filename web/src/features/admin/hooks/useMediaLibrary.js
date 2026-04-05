import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/apiServerClient';

export function useMediaLibrary() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [activeFolder, setActiveFolder] = useState('all');

  const fetchMedia = useCallback(async (folder = 'all', cursor = null, append = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (folder && folder !== 'all') params.set('folder', folder);
      params.set('max_results', '24');
      if (cursor) params.set('next_cursor', cursor);

      const data = await api.get(`/utils/media?${params.toString()}`);
      const resources = Array.isArray(data?.resources) ? data.resources : [];
      setAssets((current) => (append ? [...current, ...resources] : resources));
      setNextCursor(data?.next_cursor || null);
      setActiveFolder(folder);
    } catch (error) {
      toast.error(error.message || 'Erro ao carregar biblioteca de mídia');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAsset = useCallback(async (publicId) => {
    setIsDeleting(true);
    try {
      const params = new URLSearchParams({ public_id: publicId });
      await api.delete(`/utils/media?${params.toString()}`);
      setAssets((prev) => prev.filter((a) => a.public_id !== publicId));
      toast.success('Imagem removida com sucesso');
    } catch (error) {
      toast.error(error.message || 'Erro ao remover imagem');
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const renameAsset = useCallback(async (publicId, newName) => {
    setIsSaving(true);
    try {
      const result = await api.put('/utils/media', { public_id: publicId, new_name: newName });
      setAssets((prev) =>
        prev.map((a) =>
          a.public_id === publicId
            ? { ...a, public_id: result.public_id, secure_url: result.secure_url, thumbnail_url: result.secure_url }
            : a
        )
      );
      toast.success('Imagem renomeada com sucesso');
      return result;
    } catch (error) {
      toast.error(error.message || 'Erro ao renomear imagem');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!nextCursor || isLoading) return;
    fetchMedia(activeFolder, nextCursor, true);
  }, [activeFolder, fetchMedia, isLoading, nextCursor]);

  return {
    assets,
    isLoading,
    isDeleting,
    isSaving,
    nextCursor,
    activeFolder,
    fetchMedia,
    loadMore,
    deleteAsset,
    renameAsset,
    setActiveFolder,
  };
}
