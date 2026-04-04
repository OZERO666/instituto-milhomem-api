// src/features/admin/hooks/useServicos.js
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import api from '@/lib/apiServerClient';
import { genericSubmit } from '@/features/admin/utils/adminApi.js';

export function useServicos(currentUser) {
  const [services,    setServices]    = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading,   setIsLoading]   = useState(false);

  const serviceForm = useForm({ mode: 'onBlur', defaultValues: { nome: '', slug: '', descricao: '', beneficios: '', icon: '', ordem: '', imagem: '' } });

  const fetchServicos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.fetch('/servicos').then(r => r.json());
      if (Array.isArray(res)) setServices(res);
    } catch (err) { console.error('Error fetching servicos:', err); toast.error('Erro ao carregar serviços'); }
    finally { setIsLoading(false); }
  }, []);

  const handleServicosSubmit = (data, onSuccess) =>
    genericSubmit({
      collection: 'servicos',
      data,
      form: serviceForm,
      fileFields: ['imagem'],
      editingItem,
      setEditingItem,
      currentUser,
      onSuccess,
    });

  const handleReorder = useCallback(async (index, direction) => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= services.length) return;

    const newItems = services.map((s, i) => ({
      ...s,
      ordem: i === index ? (services[swapIndex].ordem ?? swapIndex)
           : i === swapIndex ? (services[index].ordem ?? index)
           : s.ordem ?? i,
    }));

    setServices([...newItems].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));

    try {
      await api.fetch('/servicos/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItems.map(({ id, ordem }) => ({ id, ordem }))),
      });
    } catch {
      toast.error('Erro ao reordenar serviços');
      fetchServicos();
    }
  }, [services, fetchServicos]);

  return { services, isLoading, serviceForm, editingItem, setEditingItem, fetchServicos, handleServicosSubmit, handleReorder };
}
